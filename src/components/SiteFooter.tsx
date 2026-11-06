import React from 'react';
import {
  Home,
  UserRound,
  Layers,
  FolderKanban,
  BrainCircuit,
  FileText,
  Send,
  Mail,
  Phone,
  Instagram,
  Linkedin,
  LayoutDashboard,
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';

interface SiteFooterProps {
  onNavigate: (path: string) => void;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({ onNavigate }) => {
  const { db } = useCMS();

  const exploreLinks = [
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
    onNavigate(path);
  };

  return (
    <footer className="public-footer">
      <div className="public-footer-main">
        {/* Column 1: Brand logo (146px) + Founder of KAVERI DIGITAL SOLUTIONS / Maharashtra, India */}
        <div>
          <a
            href="/"
            onClick={(e) => handleNav(e, '/')}
            className="public-brand public-footer-brand"
            aria-label={`Go to ${db.settings.siteTitle} homepage`}
          >
            <img
              src={db.settings.footerLightLogoUrl || '/images/kaveri-footer-light.png'}
              alt=""
              aria-hidden="true"
              loading="lazy"
              width={581}
              height={537}
              className="public-brand-logo public-brand-logo-footer public-brand-logo-footer-light"
            />
            <img
              src={db.settings.footerDarkLogoUrl || '/images/kaveri-footer-dark.png'}
              alt=""
              aria-hidden="true"
              loading="lazy"
              width={396}
              height={418}
              className="public-brand-logo public-brand-logo-footer public-brand-logo-footer-dark"
            />
          </a>
          <p>
            {db.profile.title}
            <br />
            {db.profile.location}
          </p>
        </div>

        {/* Column 2: Explore */}
        <div className="footer-link-column">
          <h2>Explore</h2>
          {exploreLinks.map((item) => {
            const Icon = item.icon;
            return (
              <a
                href={item.path}
                key={item.label}
                onClick={(e) => handleNav(e, item.path)}
              >
                <Icon className="ic" size={14} strokeWidth={1.75} aria-hidden="true" focusable="false" />
                {item.label}
              </a>
            );
          })}
        </div>

        {/* Column 3: Get in touch */}
        <div className="footer-link-column">
          <h2>Get in touch</h2>
          <a href={`mailto:${db.profile.primaryEmail}`}>
            <Mail className="ic" size={14} strokeWidth={1.75} aria-hidden="true" focusable="false" />
            {db.profile.primaryEmail}
          </a>
          <a href={`mailto:${db.profile.businessEmail}`}>
            <Mail className="ic" size={14} strokeWidth={1.75} aria-hidden="true" focusable="false" />
            {db.profile.businessEmail}
          </a>
          <a href={`tel:${db.profile.phone.replace(/[^\d+]/g, '')}`}>
            <Phone className="ic" size={14} strokeWidth={1.75} aria-hidden="true" focusable="false" />
            {db.profile.phone}
          </a>
          {db.profile.instagramUrl ? (
            <a href={db.profile.instagramUrl} target="_blank" rel="noreferrer">
              <Instagram className="ic" size={14} strokeWidth={1.75} aria-hidden="true" focusable="false" />
              Instagram
            </a>
          ) : null}
          {db.profile.linkedinUrl ? (
            <a href={db.profile.linkedinUrl} target="_blank" rel="noreferrer">
              <Linkedin className="ic" size={14} strokeWidth={1.75} aria-hidden="true" focusable="false" />
              LinkedIn
            </a>
          ) : null}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a href="/privacy" onClick={(e) => handleNav(e, '/privacy')}>
              Privacy notice
            </a>
            <a
              href="/admin/dashboard"
              onClick={(e) => handleNav(e, '/admin/dashboard')}
              aria-label="Admin"
            >
              <LayoutDashboard className="ic" size={14} strokeWidth={1.75} aria-hidden="true" focusable="false" />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-fine">
        <span>
          © {new Date().getFullYear()} {db.settings.siteTitle}. All rights reserved.
        </span>
        <span>{db.profile.name.toUpperCase()}</span>
      </div>
    </footer>
  );
};
