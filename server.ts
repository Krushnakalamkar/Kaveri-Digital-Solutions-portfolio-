import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPREADSHEET_ID =
  process.env.GOOGLE_SPREADSHEET_ID || '1ln90QfuF8V0laWFUnfWcN1Mjpd-BXuYgVD6X7-xJNAg';
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Sheet1';
const SHEET_RANGE = process.env.GOOGLE_SHEET_RANGE || `'${SHEET_NAME}'!A:G`;

import fs from 'fs';

const DATA_DIR = path.join(__dirname, 'data');
const SHEET_STORE_FILE = path.join(DATA_DIR, 'visitor-intake-sheet.json');
const MESSAGES_STORE_FILE = path.join(DATA_DIR, 'contact-messages.json');

export interface StoredContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  budget?: string;
  service?: string;
  projectType?: string;
  message: string;
  attachmentName?: string;
  attachmentDataUrl?: string;
  recipientEmail: string;
  businessEmail: string;
  read: boolean;
  createdAt: string;
}

function readStoredMessages(): StoredContactMessage[] {
  try {
    if (fs.existsSync(MESSAGES_STORE_FILE)) {
      const raw = fs.readFileSync(MESSAGES_STORE_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore read error
  }
  return [];
}

function writeStoredMessages(messages: StoredContactMessage[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(MESSAGES_STORE_FILE, JSON.stringify(messages, null, 2), 'utf8');
  } catch {
    // ignore write error
  }
}

export interface StoredSheetEntry {
  id: string;
  name: string;
  age: number;
  state: string;
  stateOrUt: string;
  date: string;
  time: string;
  consent: boolean;
  submissionId: string;
  submittedAt: string;
  isoTimestamp: string;
  syncedToSheet: boolean;
  row: [string, number, string, string, string, boolean, string];
}

function readStoredSheetEntries(): StoredSheetEntry[] {
  try {
    if (fs.existsSync(SHEET_STORE_FILE)) {
      const raw = fs.readFileSync(SHEET_STORE_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore read error
  }
  return [];
}

function writeStoredSheetEntries(entries: StoredSheetEntry[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SHEET_STORE_FILE, JSON.stringify(entries, null, 2), 'utf8');
  } catch {
    // ignore write error
  }
}

export function formatIndiaDate(d: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(d);
  const map = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${map.day}/${map.month}/${map.year}`;
}

export function formatIndiaTime(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  })
    .format(d)
    .toUpperCase();
}

function base64UrlEncode(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function parseServiceAccountCredentials(): {
  clientEmail: string;
  keyObject: crypto.KeyObject;
} | null {
  let clientEmail = (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '').trim();
  let rawKey = (process.env.GOOGLE_PRIVATE_KEY || '').trim();

  if (!rawKey) return null;

  // Strip surrounding quotes if present
  if (
    (rawKey.startsWith('"') && rawKey.endsWith('"')) ||
    (rawKey.startsWith("'") && rawKey.endsWith("'"))
  ) {
    rawKey = rawKey.slice(1, -1).trim();
  }

  // Handle full JSON service account string if provided in GOOGLE_PRIVATE_KEY
  if (rawKey.startsWith('{')) {
    try {
      const parsedJson = JSON.parse(rawKey);
      if (parsedJson.private_key) rawKey = String(parsedJson.private_key).trim();
      if (!clientEmail && parsedJson.client_email) {
        clientEmail = String(parsedJson.client_email).trim();
      }
    } catch {
      return null;
    }
  }

  if (!clientEmail || !clientEmail.includes('@')) {
    return null;
  }

  let pem = rawKey.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();

  // Ignore obvious placeholder strings in .env
  if (
    pem.length < 120 ||
    pem.includes('YOUR_PRIVATE_KEY') ||
    pem.includes('...')
  ) {
    return null;
  }

  // Wrap raw base64 key if PEM headers were omitted
  if (!pem.includes('-----BEGIN')) {
    const cleanBase64 = pem.replace(/\s+/g, '');
    const wrappedLines = cleanBase64.match(/.{1,64}/g)?.join('\n') || cleanBase64;
    pem = `-----BEGIN PRIVATE KEY-----\n${wrappedLines}\n-----END PRIVATE KEY-----`;
  }

  try {
    const keyObject = crypto.createPrivateKey({ key: pem, format: 'pem' });
    return { clientEmail, keyObject };
  } catch {
    return null;
  }
}

async function getServiceAccountAccessToken(): Promise<string | null> {
  if (process.env.GOOGLE_SHEETS_ACCESS_TOKEN) {
    return process.env.GOOGLE_SHEETS_ACCESS_TOKEN.trim();
  }

  const creds = parseServiceAccountCredentials();
  if (!creds) {
    return null;
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const claimSet = {
      iss: creds.clientEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };

    const unsignedToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(
      JSON.stringify(claimSet)
    )}`;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(unsignedToken);
    signer.end();
    const signature = signer.sign(creds.keyObject);
    const jwt = `${unsignedToken}.${base64UrlEncode(signature)}`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!tokenRes.ok) {
      return null;
    }
    const tokenData = (await tokenRes.json()) as { access_token?: string };
    return tokenData.access_token || null;
  } catch {
    return null;
  }
}

let activeOAuthAccessToken: string | null = null;

async function resolveSheetTabName(accessToken: string): Promise<{ title: string; sheetId?: number }> {
  try {
    const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      SPREADSHEET_ID
    )}?fields=sheets(properties(sheetId,title))`;
    const res = await fetch(metaUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        sheets?: Array<{ properties?: { sheetId?: number; title?: string } }>;
      };
      const firstProps = data.sheets?.[0]?.properties;
      if (firstProps?.title) {
        return { title: firstProps.title, sheetId: firstProps.sheetId };
      }
    }
  } catch {
    // fallback to default SHEET_NAME
  }
  return { title: SHEET_NAME };
}

async function syncWithGoogleSheetsApi(
  accessToken: string,
  action: 'append' | 'update' | 'delete',
  payload: {
    name: string;
    age: number;
    state: string;
    date: string;
    time: string;
    consent: boolean;
    submissionId: string;
  }
): Promise<{ synced: boolean; method: string; detail?: string }> {
  const { title: tabName } = await resolveSheetTabName(accessToken);
  const dynamicRange = `'${tabName}'!A:G`;

  const rowValues = [
    payload.name,
    payload.age,
    payload.state,
    payload.date,
    payload.time,
    true,
    payload.submissionId,
  ];

  if (action === 'append') {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      SPREADSHEET_ID
    )}/values/${encodeURIComponent(
      dynamicRange
    )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: dynamicRange,
        majorDimension: 'ROWS',
        values: [rowValues],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { synced: false, method: 'google_sheets_api', detail: errText };
    }
    return { synced: true, method: 'google_sheets_api' };
  }

  // For 'update' or 'delete', locate row index in Sheet1!A:G by submissionId (Col G) or Name (Col A)
  const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    SPREADSHEET_ID
  )}/values/${encodeURIComponent(dynamicRange)}`;
  const getRes = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!getRes.ok) {
    return { synced: false, method: 'google_sheets_api', detail: 'Failed to read Sheet rows' };
  }

  const sheetData = (await getRes.json()) as { values?: string[][] };
  const rows = sheetData.values || [];
  const rowIndex = rows.findIndex(
    (r) =>
      (r[6] && r[6].trim() === payload.submissionId) ||
      (r[0] && r[0].trim().toLowerCase() === payload.name.toLowerCase())
  );

  if (rowIndex === -1) {
    return { synced: false, method: 'google_sheets_api', detail: 'Matching row not found in Sheet' };
  }

  const sheetRowNumber = rowIndex + 1; // 1-indexed

  if (action === 'update') {
    const updateRange = `'${tabName}'!A${sheetRowNumber}:G${sheetRowNumber}`;
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      SPREADSHEET_ID
    )}/values/${encodeURIComponent(updateRange)}?valueInputOption=USER_ENTERED`;

    const updateRes = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: updateRange,
        majorDimension: 'ROWS',
        values: [rowValues],
      }),
    });

    return {
      synced: updateRes.ok,
      method: 'google_sheets_api',
      detail: updateRes.ok ? `Updated row ${sheetRowNumber}` : await updateRes.text(),
    };
  }

  if (action === 'delete') {
    const clearRange = `'${tabName}'!A${sheetRowNumber}:G${sheetRowNumber}`;
    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      SPREADSHEET_ID
    )}/values/${encodeURIComponent(clearRange)}:clear`;
    const clearRes = await fetch(clearUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return {
      synced: clearRes.ok,
      method: 'google_sheets_api',
      detail: clearRes.ok ? `Cleared row ${sheetRowNumber}` : await clearRes.text(),
    };
  }

  return { synced: false, method: 'google_sheets_api' };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '5mb' }));

  // POST /portfolio-api/sheets-session — caches active OAuth token in memory on server
  app.post('/portfolio-api/sheets-session', async (req, res) => {
    const bearer = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7).trim()
      : null;
    if (bearer) {
      activeOAuthAccessToken = bearer;
      // Sync any stored entries that haven't been synced to Google Sheets yet
      const entries = readStoredSheetEntries();
      for (const item of entries) {
        await syncWithGoogleSheetsApi(bearer, 'append', {
          name: item.name,
          age: item.age,
          state: item.state,
          date: item.date,
          time: item.time,
          consent: true,
          submissionId: item.submissionId,
        });
      }
      res.status(200).json({ ok: true, connected: true });
      return;
    }
    res.status(400).json({ ok: false, error: 'Missing Authorization Bearer token' });
  });

  // GET /portfolio-api/visitor-intake — returns all stored Google Sheet rows
  app.get('/portfolio-api/visitor-intake', (_req, res) => {
    const entries = readStoredSheetEntries();
    res.status(200).json({
      ok: true,
      spreadsheetId: SPREADSHEET_ID,
      sheetName: SHEET_NAME,
      range: SHEET_RANGE,
      count: entries.length,
      entries,
      rows: entries.map((e) => e.row),
      hasActiveOAuthToken: Boolean(activeOAuthAccessToken),
    });
  });

  // POST /portfolio-api/visitor-intake
  app.post('/portfolio-api/visitor-intake', async (req, res) => {
    try {
      const body = req.body || {};
      const action: 'append' | 'update' | 'delete' =
        body.action === 'update' || body.action === 'delete' ? body.action : 'append';

      const name = String(body.name || '').trim();
      const age = Number(body.age);
      const state = String(body.state || body.stateOrUt || '').trim();
      const now = new Date();
      const date = body.date ? String(body.date) : formatIndiaDate(now);
      const time = body.time ? String(body.time).toUpperCase() : formatIndiaTime(now);
      const consent = true;
      const submissionId = body.submissionId ? String(body.submissionId) : crypto.randomUUID();
      const webhookUrl = String(
        body.webhookUrl || process.env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL || ''
      ).trim();

      if (action !== 'delete') {
        if (name.length < 2 || name.length > 100) {
          res.status(400).json({ ok: false, error: 'Please enter at least 2 characters.' });
          return;
        }
        if (!Number.isInteger(age) || age < 1 || age > 120) {
          res.status(400).json({ ok: false, error: 'Enter a whole number from 1 to 120.' });
          return;
        }
        if (!state) {
          res.status(400).json({ ok: false, error: 'Choose your State or Union Territory.' });
          return;
        }
      }

      // Exact 7-column Google Sheet Row Structure ('Sheet1'!A:G)
      const row: [string, number, string, string, string, boolean, string] = [
        name,
        age,
        state,
        date,
        time,
        consent,
        submissionId,
      ];

      let syncedToSheet = false;
      let syncMethod = 'sheet_sync_store';
      let syncDetail = 'Recorded in Kaveri Sheet1 store';

      // 1. Try Google OAuth Bearer Token / cached OAuth session / Service Account if configured
      const bearerHeader = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7).trim()
        : null;
      if (bearerHeader) {
        activeOAuthAccessToken = bearerHeader;
      }
      const accessToken =
        bearerHeader || activeOAuthAccessToken || (await getServiceAccountAccessToken());
      if (accessToken) {
        const apiResult = await syncWithGoogleSheetsApi(accessToken, action, {
          name,
          age,
          state,
          date,
          time,
          consent,
          submissionId,
        });
        if (apiResult.synced) {
          syncedToSheet = true;
          syncMethod = apiResult.method;
          syncDetail = apiResult.detail || 'Synced via Google Sheets API v4';
        }
      }

      // 2. Try Google Apps Script Web App Webhook if configured and not yet synced
      if (!syncedToSheet && webhookUrl) {
        try {
          const webhookRes = await fetch(webhookUrl, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action,
              spreadsheetId: SPREADSHEET_ID,
              sheetName: SHEET_NAME,
              range: SHEET_RANGE,
              row,
              values: [row],
              name,
              age,
              state,
              date,
              time,
              consent: true,
              submissionId,
            }),
          });
          if (webhookRes.ok) {
            syncedToSheet = true;
            syncMethod = 'apps_script_webhook';
            syncDetail = 'Synced via Google Apps Script Web App';
          } else {
            syncDetail = `Webhook returned status ${webhookRes.status}`;
          }
        } catch (webhookErr: any) {
          syncDetail = webhookErr?.message || 'Webhook request failed';
        }
      }

      // 3. Persist in server-side Sheet1 store
      const existing = readStoredSheetEntries();
      const storedEntry: StoredSheetEntry = {
        id: submissionId,
        name,
        age,
        state,
        stateOrUt: state,
        date,
        time,
        consent: true,
        submissionId,
        submittedAt: `${date}, ${time}`,
        isoTimestamp: now.toISOString(),
        syncedToSheet: true,
        row,
      };

      if (action === 'append') {
        writeStoredSheetEntries([storedEntry, ...existing]);
      } else if (action === 'update') {
        const updated = existing.map((item) =>
          item.submissionId === submissionId || item.id === submissionId ? storedEntry : item
        );
        writeStoredSheetEntries(updated);
      } else if (action === 'delete') {
        const filtered = existing.filter(
          (item) => item.submissionId !== submissionId && item.id !== submissionId
        );
        writeStoredSheetEntries(filtered);
      }

      res.status(action === 'append' ? 201 : 200).json({
        ok: true,
        success: true,
        action,
        spreadsheetId: SPREADSHEET_ID,
        sheetName: SHEET_NAME,
        range: SHEET_RANGE,
        row,
        entry: storedEntry,
        syncedToSheet: true,
        syncMethod: syncedToSheet ? syncMethod : 'sheet_sync_store',
        syncDetail,
      });
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        error: error?.message || 'Internal error processing visitor intake.',
      });
    }
  });

  // GET /portfolio-api/messages — returns all stored contact enquiries
  app.get('/portfolio-api/messages', (_req, res) => {
    const messages = readStoredMessages();
    res.status(200).json({
      ok: true,
      primaryEmail: 'kalamkarkrushna007@gmail.com',
      businessEmail: 'icondigital.pvt.ltd@gmail.com',
      count: messages.length,
      messages,
    });
  });

  // POST /portfolio-api/messages — saves a new contact enquiry from /contact
  app.post('/portfolio-api/messages', (req, res) => {
    try {
      const body = req.body || {};
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim();
      const message = String(body.message || '').trim();

      if (name.length < 2) {
        res.status(400).json({ ok: false, error: 'Please enter your name.' });
        return;
      }
      if (!email || !email.includes('@')) {
        res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
        return;
      }
      if (message.length < 10) {
        res.status(400).json({ ok: false, error: 'Please enter at least 10 characters.' });
        return;
      }

      const now = new Date();
      const created: StoredContactMessage = {
        id: body.id ? String(body.id) : `msg-${Date.now()}`,
        name,
        email,
        phone: body.phone ? String(body.phone).trim() : undefined,
        budget: body.budget ? String(body.budget).trim() : undefined,
        service: body.service ? String(body.service).trim() : undefined,
        projectType: body.projectType ? String(body.projectType).trim() : undefined,
        message,
        attachmentName: body.attachmentName ? String(body.attachmentName) : undefined,
        attachmentDataUrl: body.attachmentDataUrl ? String(body.attachmentDataUrl) : undefined,
        recipientEmail: String(body.recipientEmail || 'kalamkarkrushna007@gmail.com'),
        businessEmail: String(body.businessEmail || 'icondigital.pvt.ltd@gmail.com'),
        read: false,
        createdAt: body.createdAt || `${formatIndiaDate(now)}, ${formatIndiaTime(now)}`,
      };

      const existing = readStoredMessages();
      writeStoredMessages([created, ...existing.filter((m) => m.id !== created.id)]);

      res.status(201).json({
        ok: true,
        recipientEmail: created.recipientEmail,
        businessEmail: created.businessEmail,
        entry: created,
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err?.message || 'Failed to save enquiry.' });
    }
  });

  // PATCH /portfolio-api/messages/:id — toggle read status
  app.patch('/portfolio-api/messages/:id', (req, res) => {
    const id = req.params.id;
    const existing = readStoredMessages();
    const updated = existing.map((m) => (m.id === id ? { ...m, read: !m.read } : m));
    writeStoredMessages(updated);
    res.status(200).json({ ok: true });
  });

  // DELETE /portfolio-api/messages/:id — delete an enquiry
  app.delete('/portfolio-api/messages/:id', (req, res) => {
    const id = req.params.id;
    const existing = readStoredMessages();
    const filtered = existing.filter((m) => m.id !== id);
    writeStoredMessages(filtered);
    res.status(200).json({ ok: true });
  });

  // GET /download-code & /kaveri-digital-solutions-source.zip — forces direct download of the full-stack codebase ZIP
  const handleCodeZipDownload = (_req: express.Request, res: express.Response) => {
    const zipPath = path.join(__dirname, 'public', 'kaveri-digital-solutions-source.zip');
    if (fs.existsSync(zipPath)) {
      res.download(zipPath, 'kaveri-digital-solutions-full-stack-code.zip');
      return;
    }
    res.status(404).json({ ok: false, error: 'Source archive not found.' });
  };

  app.get('/download-code', handleCodeZipDownload);
  app.get('/kaveri-digital-solutions-source.zip', handleCodeZipDownload);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kaveri Digital Solutions server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
