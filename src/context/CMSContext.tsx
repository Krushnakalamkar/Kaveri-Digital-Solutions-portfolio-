import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CMSDatabase,
  INITIAL_CMS_DATABASE,
  ProfileData,
  SiteSettings,
  ServiceCategory,
  ServiceItem,
  ProjectItem,
  SkillItem,
  ContactMessage,
  VisitorIntakeEntry,
  formatIndiaDate,
  formatIndiaTime,
  formatIndiaDateTime,
  generateSubmissionId,
  GOOGLE_SPREADSHEET_ID,
  GOOGLE_SHEET_NAME,
  GOOGLE_SHEET_RANGE,
} from '../data/seed';
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  logoutGoogle,
} from '../services/googleAuth';

const STORAGE_KEY = 'kaveri_cms_database_v1';
const THEME_STORAGE_KEY = 'kaveri_theme_mode';
const INTAKE_COMPLETE_KEY = 'kaveri-visitor-intake-complete';
const ADMIN_AUTH_KEY = 'kaveri_studio_admin_authenticated';

export type ThemeMode = 'dark' | 'light';

interface CMSContextValue {
  db: CMSDatabase;
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  hasCompletedIntake: boolean;
  isVisitorGateOpen: boolean;
  openVisitorGate: () => void;
  closeVisitorGate: () => void;
  // Google Sheets OAuth
  isGoogleSheetsConnected: boolean;
  googleUserEmail: string | null;
  connectGoogleSheets: () => Promise<boolean>;
  disconnectGoogleSheets: () => Promise<void>;
  submitVisitorIntake: (entry: {
    name: string;
    age: number;
    stateOrUt: string;
    consent: boolean;
  }) => Promise<void>;
  updateVisitorEntry: (
    id: string,
    updates: { name: string; age: number; stateOrUt: string }
  ) => Promise<void>;
  deleteVisitorEntry: (id: string) => Promise<void>;
  // Admin Auth
  isAdminAuthenticated: boolean;
  loginAdmin: (email: string, password: string) => boolean;
  logoutAdmin: () => void;
  // Profile & Settings
  updateProfile: (profile: ProfileData) => void;
  updateSettings: (settings: SiteSettings) => void;
  // Projects
  saveProject: (
    project: Omit<ProjectItem, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
  ) => ProjectItem;
  deleteProject: (id: string) => void;
  toggleProjectPublish: (id: string) => void;
  toggleProjectFeatured: (id: string) => void;
  // Categories & Services
  updateCategory: (category: ServiceCategory) => void;
  addService: (service: {
    name: string;
    slug?: string;
    categoryId: string;
    description?: string;
  }) => void;
  updateService: (service: ServiceItem) => void;
  toggleServiceActive: (id: string) => void;
  reorderService: (id: string, direction: 'up' | 'down') => void;
  deleteService: (id: string) => void;
  // Skills
  addSkill: (name: string) => void;
  toggleSkillActive: (id: string) => void;
  reorderSkill: (id: string, direction: 'up' | 'down') => void;
  deleteSkill: (id: string) => void;
  // Messages
  addContactMessage: (
    msg: Omit<ContactMessage, 'id' | 'read' | 'createdAt'>
  ) => ContactMessage;
  toggleMessageRead: (id: string) => void;
  deleteMessage: (id: string) => void;
  // Backup & Reset
  importDatabaseJson: (jsonString: string) => { ok: boolean; error?: string };
  resetToDefaultSeed: () => void;
}

const CMSContext = createContext<CMSContextValue | undefined>(undefined);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function resolveClientSheetTabName(token: string): Promise<string> {
  try {
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        GOOGLE_SPREADSHEET_ID
      )}?fields=sheets(properties(sheetId,title))`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (metaRes.ok) {
      const data = await metaRes.json();
      const firstTitle = data?.sheets?.[0]?.properties?.title;
      if (firstTitle) return String(firstTitle);
    }
  } catch {
    // fallback to default
  }
  return GOOGLE_SHEET_NAME;
}

async function syncRowDirectWithGoogleSheetsClient(
  token: string,
  action: 'append' | 'update' | 'delete',
  row: [string, number, string, string, string, boolean, string],
  submissionId: string,
  name: string
): Promise<boolean> {
  try {
    const tabName = await resolveClientSheetTabName(token);
    const dynamicRange = `'${tabName}'!A:G`;

    if (action === 'append') {
      const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        GOOGLE_SPREADSHEET_ID
      )}/values/${encodeURIComponent(
        dynamicRange
      )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
      const res = await fetch(appendUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: dynamicRange,
          majorDimension: 'ROWS',
          values: [row],
        }),
      });
      return res.ok;
    }

    const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      GOOGLE_SPREADSHEET_ID
    )}/values/${encodeURIComponent(dynamicRange)}`;
    const getRes = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!getRes.ok) return false;
    const sheetData = await getRes.json();
    const rows: string[][] = sheetData?.values || [];
    const rowIndex = rows.findIndex(
      (r) =>
        (r[6] && r[6].trim() === submissionId) ||
        (r[0] && r[0].trim().toLowerCase() === name.toLowerCase())
    );
    if (rowIndex === -1) return false;
    const rowNumber = rowIndex + 1;
    const rowRange = `'${tabName}'!A${rowNumber}:G${rowNumber}`;

    if (action === 'update') {
      const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        GOOGLE_SPREADSHEET_ID
      )}/values/${encodeURIComponent(rowRange)}?valueInputOption=USER_ENTERED`;
      const updateRes = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: rowRange,
          majorDimension: 'ROWS',
          values: [row],
        }),
      });
      return updateRes.ok;
    }

    if (action === 'delete') {
      const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        GOOGLE_SPREADSHEET_ID
      )}/values/${encodeURIComponent(rowRange)}:clear`;
      const clearRes = await fetch(clearUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return clearRes.ok;
    }
  } catch {
    // ignore client error and let backend handle fallback
  }
  return false;
}

async function syncRowWithPortfolioApiAndWebhook(
  action: 'append' | 'update' | 'delete',
  entry: {
    name: string;
    age: number;
    state: string;
    date: string;
    time: string;
    consent: boolean;
    submissionId: string;
  },
  webhookUrl: string
): Promise<boolean> {
  // Exact 7-column Google Sheet Row Structure ('Sheet1'!A:G)
  const row: [string, number, string, string, string, boolean, string] = [
    entry.name,
    entry.age,
    entry.state,
    entry.date,
    entry.time,
    true,
    entry.submissionId,
  ];

  const payload = {
    action,
    spreadsheetId: GOOGLE_SPREADSHEET_ID,
    sheetName: GOOGLE_SHEET_NAME,
    range: GOOGLE_SHEET_RANGE,
    row,
    name: entry.name,
    age: entry.age,
    state: entry.state,
    date: entry.date,
    time: entry.time,
    consent: true,
    submissionId: entry.submissionId,
    webhookUrl: webhookUrl.trim(),
  };

  let synced = false;
  const oauthToken = await getAccessToken();

  // 1. Direct client-side Google Sheets API v4 sync if OAuth token is in memory
  if (oauthToken) {
    synced = await syncRowDirectWithGoogleSheetsClient(
      oauthToken,
      action,
      row,
      entry.submissionId,
      entry.name
    );
  }

  // 2. Backend API store & server-side Sheet sync
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (oauthToken && !synced) {
      headers.Authorization = `Bearer ${oauthToken}`;
    }
    const res = await fetch('/portfolio-api/visitor-intake', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      synced = synced || Boolean(data?.syncedToSheet || data?.ok);
    }
  } catch {
    // Graceful fallback if backend is unreachable
  }

  // 3. Also support direct browser-to-Sheet saving if a Google Apps Script Web App webhook URL is configured
  if (!synced && webhookUrl.trim()) {
    try {
      await fetch(webhookUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      synced = true;
    } catch {
      // Ignore direct webhook network error and preserve local state
    }
  }

  return synced;
}

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<CMSDatabase>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const normalizedEntries: VisitorIntakeEntry[] = Array.isArray(parsed.visitorEntries)
          ? parsed.visitorEntries.map((item: any) => {
              const dateStr = item.date || formatIndiaDate(new Date());
              const timeStr = (item.time || formatIndiaTime(new Date())).toUpperCase();
              const stateStr = item.state || item.stateOrUt || '';
              const subId = item.submissionId || item.id || generateSubmissionId();
              return {
                ...item,
                id: subId,
                name: String(item.name || '').trim(),
                age: Number(item.age) || 18,
                state: stateStr,
                stateOrUt: stateStr,
                date: dateStr,
                time: timeStr,
                consent: true,
                submissionId: subId,
                submittedAt: item.submittedAt || `${dateStr}, ${timeStr}`,
              };
            })
          : INITIAL_CMS_DATABASE.visitorEntries;

        const mergedSettings: SiteSettings = {
          ...INITIAL_CMS_DATABASE.settings,
          ...(parsed.settings || {}),
        };
        if (
          !mergedSettings.logoUrl ||
          mergedSettings.logoUrl.includes('kaveri_brand_emblem_') ||
          mergedSettings.logoUrl.includes('kaveri-icon_')
        ) {
          mergedSettings.logoUrl = INITIAL_CMS_DATABASE.settings.logoUrl;
        }
        if (
          !mergedSettings.footerDarkLogoUrl ||
          mergedSettings.footerDarkLogoUrl.includes('kaveri_brand_emblem_') ||
          mergedSettings.footerDarkLogoUrl.includes('kaveri-icon_')
        ) {
          mergedSettings.footerDarkLogoUrl = INITIAL_CMS_DATABASE.settings.footerDarkLogoUrl;
        }
        if (
          !mergedSettings.footerLightLogoUrl ||
          mergedSettings.footerLightLogoUrl.includes('kaveri_brand_emblem_') ||
          mergedSettings.footerLightLogoUrl.includes('kaveri-icon_')
        ) {
          mergedSettings.footerLightLogoUrl = INITIAL_CMS_DATABASE.settings.footerLightLogoUrl;
        }

        const mergedProfile: ProfileData = {
          ...INITIAL_CMS_DATABASE.profile,
          ...(parsed.profile || {}),
        };
        if (
          !mergedProfile.portraitUrl ||
          mergedProfile.portraitUrl.includes('krushna_kalamkar_portrait_')
        ) {
          mergedProfile.portraitUrl = INITIAL_CMS_DATABASE.profile.portraitUrl;
        }

        const cleanedProjects = Array.isArray(parsed.projects)
          ? parsed.projects.filter(
              (p: any) =>
                p.id !== 'proj-kaveri-studio-platform' &&
                p.id !== 'proj-ai-lead-triage-engine'
            )
          : INITIAL_CMS_DATABASE.projects;

        const resolvedSkills: SkillItem[] =
          Array.isArray(parsed.skills) && parsed.skills.length > 0
            ? parsed.skills
            : INITIAL_CMS_DATABASE.skills;

        const savedCategories: ServiceCategory[] = Array.isArray(parsed.categories)
          ? parsed.categories
          : INITIAL_CMS_DATABASE.categories;
        const missingCategories = INITIAL_CMS_DATABASE.categories.filter(
          (seedCat) => !savedCategories.some((c) => c.id === seedCat.id)
        );
        const resolvedCategories = [...savedCategories, ...missingCategories];

        const savedServices: ServiceItem[] = Array.isArray(parsed.services)
          ? parsed.services
          : INITIAL_CMS_DATABASE.services;
        const missingServices = INITIAL_CMS_DATABASE.services.filter(
          (seedSrv) => !savedServices.some((s) => s.id === seedSrv.id)
        );
        const resolvedServices = [...savedServices, ...missingServices];

        return {
          ...INITIAL_CMS_DATABASE,
          ...parsed,
          profile: mergedProfile,
          settings: mergedSettings,
          categories: resolvedCategories,
          services: resolvedServices,
          projects: cleanedProjects,
          skills: resolvedSkills,
          visitorEntries: normalizedEntries,
        };
      }
    } catch (e) {
      console.error('Failed to load CMS database from localStorage:', e);
    }
    return INITIAL_CMS_DATABASE;
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore
    }
    return 'dark';
  });

  const [hasCompletedIntake, setHasCompletedIntake] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem(INTAKE_COMPLETE_KEY) === 'true' ||
        sessionStorage.getItem(INTAKE_COMPLETE_KEY) === 'true'
      );
    } catch {
      return false;
    }
  });

  const [isVisitorGateOpen, setIsVisitorGateOpen] = useState<boolean>(false);
  const [isGoogleSheetsConnected, setIsGoogleSheetsConnected] = useState<boolean>(false);
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(null);

  const openVisitorGate = () => {
    setIsVisitorGateOpen(true);
  };

  const closeVisitorGate = () => {
    setIsVisitorGateOpen(false);
  };

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setIsGoogleSheetsConnected(true);
        setGoogleUserEmail(user.email || null);
      },
      () => {
        setIsGoogleSheetsConnected(false);
        setGoogleUserEmail(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const connectGoogleSheets = async (): Promise<boolean> => {
    try {
      const result = await googleSignIn();
      if (result?.accessToken) {
        setIsGoogleSheetsConnected(true);
        setGoogleUserEmail(result.user.email || null);
        return true;
      }
    } catch {
      // handled by caller
    }
    return false;
  };

  const disconnectGoogleSheets = async (): Promise<void> => {
    await logoutGoogle();
    setIsGoogleSheetsConnected(false);
    setGoogleUserEmail(null);
  };

  useEffect(() => {
    let active = true;
    fetch('/portfolio-api/visitor-intake')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        if (data.hasActiveOAuthToken) {
          setIsGoogleSheetsConnected(true);
        }
        if (!Array.isArray(data.entries) || data.entries.length === 0) return;
        setDb((prev) => {
          const existingIds = new Set(
            prev.visitorEntries.map((item) => item.submissionId || item.id)
          );
          const newServerItems: VisitorIntakeEntry[] = data.entries.filter(
            (item: any) => !existingIds.has(item.submissionId || item.id)
          );
          if (newServerItems.length === 0) return prev;
          return {
            ...prev,
            visitorEntries: [...newServerItems, ...prev.visitorEntries],
          };
        });
      })
      .catch(() => {
        // ignore network error
      });
    return () => {
      active = false;
    };
  }, []);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Failed to persist CMS database to localStorage:', e);
    }
  }, [db]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    if (db.settings.siteTitle) {
      document.title = `${db.settings.siteTitle} — ${db.profile.name}`;
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && db.settings.metaDescription) {
      metaDesc.setAttribute('content', db.settings.metaDescription);
    }
  }, [db.settings.siteTitle, db.settings.metaDescription, db.profile.name]);

  const setTheme = (next: ThemeMode) => setThemeState(next);
  const toggleTheme = () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const submitVisitorIntake = async (entry: {
    name: string;
    age: number;
    stateOrUt: string;
    consent: boolean;
  }) => {
    const now = new Date();
    const trimmedName = entry.name.trim();
    const cleanAge = Number(entry.age);
    const cleanState = entry.stateOrUt.trim();
    const date = formatIndiaDate(now);
    const time = formatIndiaTime(now);
    const submissionId = generateSubmissionId();

    const synced = await syncRowWithPortfolioApiAndWebhook(
      'append',
      {
        name: trimmedName,
        age: cleanAge,
        state: cleanState,
        date,
        time,
        consent: true,
        submissionId,
      },
      db.settings.googleAppsScriptWebhookUrl || ''
    );

    const newEntry: VisitorIntakeEntry = {
      id: submissionId,
      name: trimmedName,
      age: cleanAge,
      state: cleanState,
      stateOrUt: cleanState,
      date,
      time,
      consent: true,
      submissionId,
      submittedAt: `${date}, ${time}`,
      isoTimestamp: now.toISOString(),
      syncedToSheet: synced,
    };

    setDb((prev) => ({
      ...prev,
      visitorEntries: [newEntry, ...prev.visitorEntries],
    }));

    try {
      localStorage.setItem(INTAKE_COMPLETE_KEY, 'true');
      sessionStorage.setItem(INTAKE_COMPLETE_KEY, 'true');
    } catch {
      // ignore
    }
    setHasCompletedIntake(true);
    setIsVisitorGateOpen(false);
  };

  const updateVisitorEntry = async (
    id: string,
    updates: { name: string; age: number; stateOrUt: string }
  ) => {
    const target = db.visitorEntries.find((item) => item.id === id || item.submissionId === id);
    const trimmedName = updates.name.trim();
    const cleanAge = Number(updates.age);
    const cleanState = updates.stateOrUt.trim();
    const date = target?.date || formatIndiaDate(new Date());
    const time = target?.time || formatIndiaTime(new Date());
    const submissionId = target?.submissionId || id;

    setDb((prev) => ({
      ...prev,
      visitorEntries: prev.visitorEntries.map((item) =>
        item.id === id || item.submissionId === id
          ? {
              ...item,
              name: trimmedName,
              age: cleanAge,
              state: cleanState,
              stateOrUt: cleanState,
            }
          : item
      ),
    }));

    await syncRowWithPortfolioApiAndWebhook(
      'update',
      {
        name: trimmedName,
        age: cleanAge,
        state: cleanState,
        date,
        time,
        consent: true,
        submissionId,
      },
      db.settings.googleAppsScriptWebhookUrl || ''
    );
  };

  const deleteVisitorEntry = async (id: string) => {
    const target = db.visitorEntries.find((item) => item.id === id || item.submissionId === id);

    setDb((prev) => ({
      ...prev,
      visitorEntries: prev.visitorEntries.filter(
        (item) => item.id !== id && item.submissionId !== id
      ),
    }));

    if (target) {
      await syncRowWithPortfolioApiAndWebhook(
        'delete',
        {
          name: target.name,
          age: target.age,
          state: target.state || target.stateOrUt,
          date: target.date,
          time: target.time,
          consent: true,
          submissionId: target.submissionId || target.id,
        },
        db.settings.googleAppsScriptWebhookUrl || ''
      );
    }
  };

  const loginAdmin = (email: string, password: string): boolean => {
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail && password.trim().length >= 4) {
      setIsAdminAuthenticated(true);
      try {
        localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    } catch {
      // ignore
    }
  };

  const updateProfile = (profile: ProfileData) => {
    setDb((prev) => ({ ...prev, profile }));
  };

  const updateSettings = (settings: SiteSettings) => {
    setDb((prev) => ({ ...prev, settings }));
  };

  const saveProject = (
    projectInput: Omit<ProjectItem, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
  ): ProjectItem => {
    const cleanSlug = projectInput.slug ? slugify(projectInput.slug) : slugify(projectInput.title);
    const existingIndex = projectInput.id
      ? db.projects.findIndex((p) => p.id === projectInput.id)
      : -1;

    if (existingIndex >= 0 && projectInput.id) {
      const updated: ProjectItem = {
        ...db.projects[existingIndex],
        ...projectInput,
        id: projectInput.id,
        slug: cleanSlug,
      };
      setDb((prev) => ({
        ...prev,
        projects: prev.projects.map((p) => (p.id === updated.id ? updated : p)),
      }));
      return updated;
    } else {
      const created: ProjectItem = {
        ...projectInput,
        id: `proj-${Date.now()}`,
        slug: cleanSlug || `project-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setDb((prev) => ({
        ...prev,
        projects: [created, ...prev.projects],
      }));
      return created;
    }
  };

  const deleteProject = (id: string) => {
    setDb((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  const toggleProjectPublish = (id: string) => {
    setDb((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, published: !p.published } : p)),
    }));
  };

  const toggleProjectFeatured = (id: string) => {
    setDb((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p)),
    }));
  };

  const updateCategory = (category: ServiceCategory) => {
    setDb((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === category.id ? { ...category, slug: slugify(category.slug || category.name) } : c
      ),
    }));
  };

  const addService = (input: {
    name: string;
    slug?: string;
    categoryId: string;
    description?: string;
  }) => {
    const cleanName = input.name.trim();
    if (!cleanName) return;
    const slug = input.slug ? slugify(input.slug) : slugify(cleanName);
    const description =
      input.description && input.description.trim()
        ? input.description.trim()
        : `${cleanName} for individuals, startups and businesses.`;

    setDb((prev) => {
      const maxOrder = prev.services.reduce((max, s) => Math.max(max, s.order), 0);
      const newService: ServiceItem = {
        id: `srv-${slug}-${Date.now()}`,
        name: cleanName,
        slug,
        categoryId: input.categoryId,
        active: true,
        description,
        order: maxOrder + 1,
      };
      return {
        ...prev,
        services: [...prev.services, newService],
      };
    });
  };

  const updateService = (service: ServiceItem) => {
    setDb((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === service.id ? service : s)),
    }));
  };

  const toggleServiceActive = (id: string) => {
    setDb((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
    }));
  };

  const reorderService = (id: string, direction: 'up' | 'down') => {
    setDb((prev) => {
      const target = prev.services.find((s) => s.id === id);
      if (!target) return prev;
      const catServices = prev.services
        .filter((s) => s.categoryId === target.categoryId)
        .sort((a, b) => a.order - b.order);
      const idx = catServices.findIndex((s) => s.id === id);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= catServices.length) return prev;

      const currentOrder = catServices[idx].order;
      const neighborOrder = catServices[swapIdx].order;
      const neighborId = catServices[swapIdx].id;

      return {
        ...prev,
        services: prev.services.map((s) => {
          if (s.id === id) return { ...s, order: neighborOrder };
          if (s.id === neighborId) return { ...s, order: currentOrder };
          return s;
        }),
      };
    });
  };

  const deleteService = (id: string) => {
    setDb((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }));
  };

  const addSkill = (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    setDb((prev) => {
      const maxOrder = prev.skills.reduce((max, s) => Math.max(max, s.order), 0);
      return {
        ...prev,
        skills: [
          ...prev.skills,
          {
            id: `sk-${Date.now()}`,
            name: clean,
            active: true,
            order: maxOrder + 1,
          },
        ],
      };
    });
  };

  const toggleSkillActive = (id: string) => {
    setDb((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
    }));
  };

  const reorderSkill = (id: string, direction: 'up' | 'down') => {
    setDb((prev) => {
      const sorted = [...prev.skills].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((s) => s.id === id);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const aOrder = sorted[idx].order;
      const bOrder = sorted[swapIdx].order;
      const neighborId = sorted[swapIdx].id;
      return {
        ...prev,
        skills: prev.skills.map((s) => {
          if (s.id === id) return { ...s, order: bOrder };
          if (s.id === neighborId) return { ...s, order: aOrder };
          return s;
        }),
      };
    });
  };

  const deleteSkill = (id: string) => {
    setDb((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id),
    }));
  };

  const addContactMessage = (
    msg: Omit<ContactMessage, 'id' | 'read' | 'createdAt'>
  ): ContactMessage => {
    const newMsg: ContactMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      read: false,
      createdAt: formatIndiaDateTime(new Date()),
    };
    setDb((prev) => ({
      ...prev,
      messages: [newMsg, ...prev.messages],
    }));
    return newMsg;
  };

  const toggleMessageRead = (id: string) => {
    setDb((prev) => ({
      ...prev,
      messages: prev.messages.map((m) => (m.id === id ? { ...m, read: !m.read } : m)),
    }));
  };

  const deleteMessage = (id: string) => {
    setDb((prev) => ({
      ...prev,
      messages: prev.messages.filter((m) => m.id !== id),
    }));
  };

  const importDatabaseJson = (jsonString: string): { ok: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.services)) {
        return { ok: false, error: 'Invalid backup JSON structure.' };
      }
      setDb({
        ...INITIAL_CMS_DATABASE,
        ...parsed,
      });
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Failed to parse JSON.' };
    }
  };

  const resetToDefaultSeed = () => {
    setDb(INITIAL_CMS_DATABASE);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CMS_DATABASE));
    } catch {
      // ignore
    }
  };

  return (
    <CMSContext.Provider
      value={{
        db,
        theme,
        toggleTheme,
        setTheme,
        hasCompletedIntake,
        isVisitorGateOpen,
        openVisitorGate,
        closeVisitorGate,
        isGoogleSheetsConnected,
        googleUserEmail,
        connectGoogleSheets,
        disconnectGoogleSheets,
        submitVisitorIntake,
        updateVisitorEntry,
        deleteVisitorEntry,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        updateProfile,
        updateSettings,
        saveProject,
        deleteProject,
        toggleProjectPublish,
        toggleProjectFeatured,
        updateCategory,
        addService,
        updateService,
        toggleServiceActive,
        reorderService,
        deleteService,
        addSkill,
        toggleSkillActive,
        reorderSkill,
        deleteSkill,
        addContactMessage,
        toggleMessageRead,
        deleteMessage,
        importDatabaseJson,
        resetToDefaultSeed,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = (): CMSContextValue => {
  const ctx = useContext(CMSContext);
  if (!ctx) throw new Error('useCMS must be used within a CMSProvider');
  return ctx;
};
