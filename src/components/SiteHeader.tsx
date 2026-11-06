import React, { useState } from 'react';
import {
  Home,
  UserRound,
  Layers,
  FolderKanban,
  BrainCircuit,
  FileText,
  Send,
  ArrowUpRight,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';

interface SiteHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({ onNavigate }) => {
  const { db, theme, toggleTheme } = useCMS();
  const [open, setOpen] = useState(false);
  const isDark = theme !== 'light';

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'About', path: '/about', icon: UserRound },
    { label: 'Services', path: '/services', icon: Layers },
    { label: 'Work', path: '/work', icon: FolderKanban },
    { label: 'Skills', path: '/#skills', icon: BrainCircuit },
    { label: 'Resume', path: '/resume', icon: FileText },
    { label: 'Contact', path: '/contact', icon: Send },
  ];

  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setOpen(false);
    onNavigate(path);
  };

  return (
    <header className="public-header">
      <div className="public-header-inner">
        <a
          href="/"
          className="public-brand focus-ring"
          onClick={(e) => handleNav(e, '/')}
          aria-label={`${db.settings.siteTitle} — home`}
        >
          <img
            src="/images/kaveri-emblem.png"
            alt=""
            aria-hidden="true"
            width={260}
            height={260}
            className="public-brand-logo public-brand-logo-dark"
          />
          <img
            src={db.settings.footerLightLogoUrl || '/images/kaveri-footer-light.png'}
            alt=""
            aria-hidden="true"
            width={581}
            height={537}
            className="public-brand-logo public-brand-logo-light"
          />
          <span className="public-brand-copy">
            <b>{db.settings.siteTitle}</b>
            <small>{db.profile.name}</small>
          </span>
        </a>

        <nav className={`public-nav ${open ? 'is-open' : ''}`} aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.path}
                onClick={(e) => handleNav(e, item.path)}
              >
                <Icon className="ic" size={15} strokeWidth={1.75} aria-hidden="true" focusable="false" />
                {item.label}
              </a>
            );
          })}
          <a
            className="public-hire"
            href="/contact"
            onClick={(e) => handleNav(e, '/contact')}
          >
            Hire Me <ArrowUpRight size={15} />
          </a>
        </nav>

        <div className="public-header-actions">
          <button
            type="button"
            className="public-theme-toggle focus-ring"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
          >
            {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="public-menu-button focus-ring"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};
