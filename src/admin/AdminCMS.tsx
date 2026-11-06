import React, { useState } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Layers,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
  Plus,
  Lock,
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import {
  AdminProjectsView,
  AdminServicesView,
  AdminMessagesView,
  AdminVisitorRequestsView,
  AdminSkillsView,
  AdminProfileView,
  AdminResumeView,
  AdminSettingsView,
} from './AdminSubViews';

interface AdminCMSProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const AdminCMS: React.FC<AdminCMSProps> = ({ currentPath, onNavigate }) => {
  const { db, isAdminAuthenticated, loginAdmin, logoutAdmin } = useCMS();
  const [email, setEmail] = useState(db.profile.primaryEmail);
  const [password, setPassword] = useState('kaveri2026');
  const [loginError, setLoginError] = useState('');

  // If on /admin/login or unauthenticated
  if (!isAdminAuthenticated || currentPath === '/admin/login') {
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      const ok = loginAdmin(email, password);
      if (ok) {
        setLoginError('');
        onNavigate('/admin/dashboard');
      } else {
        setLoginError('Please enter a valid Studio email and password (min 4 chars).');
      }
    };

    return (
      <div className="min-h-screen bg-[#08111f] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-[#0e1b30] border border-white/15 p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3.5">
            <img
              src={db.settings.logoUrl || '/images/kaveri-logo.png'}
              alt={db.settings.siteTitle}
              referrerPolicy="no-referrer"
              className="w-24 h-auto p-1.5 rounded-lg object-contain bg-black border border-white/20"
            />
            <div>
              <div className="font-display-app font-bold text-base tracking-tight text-white">
                {db.settings.siteTitle}
              </div>
              <div className="text-xs font-mono-app text-sky-300">STUDIO ADMIN</div>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="font-display-app text-2xl font-bold text-white">Studio Sign In</h1>
            <p className="text-xs text-slate-300">
              Sign in to manage projects, 47 services, enquiries, and visitor intake records.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-400/40 text-xs text-rose-200">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1">Studio Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-[#08111f] border border-white/20 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-[#08111f] border border-white/20 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#6D001A] hover:bg-[#8E092B] text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Lock size={15} strokeWidth={1.75} />
              <span>Access Studio Workspace</span>
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="hover:text-white underline cursor-pointer"
            >
              ← Return to Public Site
            </button>
            <span>{db.profile.name}</span>
          </div>
        </div>
      </div>
    );
  }

  const navLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/admin/projects', icon: Briefcase },
    { label: 'Services', path: '/admin/services', icon: Layers },
    { label: 'Messages', path: '/admin/messages', icon: Mail },
    { label: 'Privacy Requests', path: '/admin/visitor-requests', icon: ShieldCheck },
    { label: 'Skills', path: '/admin/skills', icon: Sparkles },
    { label: 'Profile', path: '/admin/profile', icon: User },
    { label: 'Résumé', path: '/admin/resume', icon: FileText },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  // Compute live counts for /admin/dashboard
  const stats = [
    { label: 'TOTAL PROJECTS', value: db.projects.length, path: '/admin/projects' },
    {
      label: 'PUBLISHED PROJECTS',
      value: db.projects.filter((p) => p.published).length,
      path: '/admin/projects',
    },
    {
      label: 'FEATURED PROJECTS',
      value: db.projects.filter((p) => p.featured).length,
      path: '/admin/projects',
    },
    { label: 'TOTAL MESSAGES', value: db.messages.length, path: '/admin/messages' },
    {
      label: 'NEW MESSAGES',
      value: db.messages.filter((m) => !m.read).length,
      path: '/admin/messages',
    },
    {
      label: 'TOTAL SERVICES',
      value: db.services.filter((s) => s.active).length,
      path: '/admin/services',
    },
    {
      label: 'TOTAL SKILLS',
      value: db.skills.filter((s) => s.active).length,
      path: '/admin/skills',
    },
    {
      label: 'VISITOR ENTRIES',
      value: db.visitorEntries.length,
      path: '/admin/visitor-requests',
    },
  ];

  const renderMainWorkspace = () => {
    if (currentPath === '/admin/projects/new') {
      return <AdminProjectsView mode="new" onNavigate={onNavigate} />;
    }
    if (currentPath.startsWith('/admin/projects/edit/')) {
      const id = currentPath.replace('/admin/projects/edit/', '');
      return <AdminProjectsView mode="edit" editProjectId={id} onNavigate={onNavigate} />;
    }
    if (currentPath.startsWith('/admin/projects')) {
      return <AdminProjectsView mode="list" onNavigate={onNavigate} />;
    }
    if (currentPath.startsWith('/admin/services')) {
      return <AdminServicesView />;
    }
    if (currentPath.startsWith('/admin/messages')) {
      return <AdminMessagesView />;
    }
    if (currentPath.startsWith('/admin/visitor-requests')) {
      return <AdminVisitorRequestsView />;
    }
    if (currentPath.startsWith('/admin/skills')) {
      return <AdminSkillsView />;
    }
    if (currentPath.startsWith('/admin/profile')) {
      return <AdminProfileView />;
    }
    if (currentPath.startsWith('/admin/resume')) {
      return <AdminResumeView />;
    }
    if (currentPath.startsWith('/admin/settings')) {
      return <AdminSettingsView />;
    }

    // Default: /admin/dashboard
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-mono-app text-xs uppercase tracking-widest text-slate-500">
              STUDIO OVERVIEW
            </div>
            <h1 className="font-display-app text-2xl sm:text-3xl font-bold text-[#08111f]">
              Welcome back, {db.profile.firstName || 'Krushna'}.
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('/admin/projects/new')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#6D001A] text-white text-xs sm:text-sm font-medium hover:bg-[#8E092B] cursor-pointer"
            >
              <Plus size={16} strokeWidth={1.75} />
              <span>New Project</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs sm:text-sm font-medium hover:bg-slate-50 cursor-pointer"
            >
              <span>View Public Site</span>
              <ExternalLink size={15} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* 8 Live Count Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((st) => (
            <button
              key={st.label}
              type="button"
              onClick={() => onNavigate(st.path)}
              className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-slate-400 transition-colors cursor-pointer shadow-xs"
            >
              <div className="font-mono-app text-[11px] uppercase tracking-wider text-slate-500">
                {st.label}
              </div>
              <div className="font-display-app text-3xl font-bold text-[#08111f] mt-2 font-mono-app">
                {st.value}
              </div>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h2 className="font-display-app text-base font-bold text-[#08111f]">
            Quick Studio Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/admin/services')}
              className="p-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-left cursor-pointer"
            >
              <div className="font-semibold text-sm text-slate-900">Manage 47 Services</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Edit 6 categories & toggle offerings
              </div>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/admin/messages')}
              className="p-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-left cursor-pointer"
            >
              <div className="font-semibold text-sm text-slate-900">Review Enquiries</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {db.messages.filter((m) => !m.read).length} unread client messages
              </div>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/admin/visitor-requests')}
              className="p-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-left cursor-pointer"
            >
              <div className="font-semibold text-sm text-slate-900">Visitor Intake Sheet</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Inspect or export {db.visitorEntries.length} visitor rows
              </div>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/admin/profile')}
              className="p-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-left cursor-pointer"
            >
              <div className="font-semibold text-sm text-slate-900">Update Profile & Bio</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Edit founder portrait & contact info
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-shell min-h-screen flex flex-col lg:flex-row bg-[#f2f4f7] text-slate-900">
      {/* Dark #08111f Left Sidebar */}
      <aside className="w-full lg:w-64 bg-[#08111f] text-white shrink-0 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
        <div className="p-5 space-y-6">
          <div className="flex items-center justify-between lg:justify-start gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/admin/dashboard')}
              className="flex items-center gap-3 text-left cursor-pointer"
            >
              <img
                src={db.settings.logoUrl || '/images/kaveri-logo.png'}
                alt={db.settings.siteTitle}
                referrerPolicy="no-referrer"
                className="w-20 h-auto object-contain shrink-0"
              />
              <div>
                <div className="font-display-app font-bold text-xs tracking-wider text-white">
                  STUDIO ADMIN
                </div>
                <div className="text-[11px] text-slate-400">{db.profile.name}</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="lg:hidden text-xs text-sky-300 underline cursor-pointer"
            >
              Public Site
            </button>
          </div>

          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = currentPath.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#6D001A] text-white'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={16} strokeWidth={1.75} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block p-5 border-t border-white/10 space-y-2">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <span>Public Website</span>
            <ExternalLink size={14} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => {
              logoutAdmin();
              onNavigate('/admin/login');
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs text-rose-300 hover:bg-rose-500/15 cursor-pointer"
          >
            <LogOut size={14} strokeWidth={1.75} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Light #f2f4f7 Main Workspace */}
      <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
        {renderMainWorkspace()}
      </main>
    </div>
  );
};
