import React, { useState, useEffect } from 'react';
import { CMSProvider, useCMS } from './context/CMSContext';
import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { VisitorIntakeModal } from './components/VisitorIntakeModal';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { WorkPage } from './pages/WorkPage';
import { ResumePage } from './pages/ResumePage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { AdminCMS } from './admin/AdminCMS';

const AppRouter: React.FC = () => {
  const { openVisitorGate } = useCMS();
  const [route, setRoute] = useState<{
    path: string;
    search: string;
    hash: string;
    transitionKey: number;
  }>(() => ({
    path: window.location.pathname || '/',
    search: window.location.search || '',
    hash: window.location.hash || '',
    transitionKey: 1,
  }));

  useEffect(() => {
    const handlePopState = () => {
      setRoute((prev) => ({
        path: window.location.pathname || '/',
        search: window.location.search || '',
        hash: window.location.hash || '',
        transitionKey: prev.transitionKey + 1,
      }));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (rawTarget: string) => {
    // Handle /#skills or #skills
    if (rawTarget === '/#skills' || rawTarget === '#skills') {
      if (route.path !== '/') {
        window.history.pushState({}, '', '/#skills');
        setRoute((prev) => ({
          path: '/',
          search: '',
          hash: '#skills',
          transitionKey: prev.transitionKey + 1,
        }));
        setTimeout(() => {
          document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      } else {
        document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    const url = new URL(rawTarget, window.location.origin);
    if (url.pathname === '/contact') {
      openVisitorGate();
    }
    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
    setRoute((prev) => ({
      path: url.pathname || '/',
      search: url.search || '',
      hash: url.hash || '',
      transitionKey: prev.transitionKey + 1,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRouteGroup = (p: string): string => {
    if (p === '/' || p === '') return 'home';
    if (p.startsWith('/about')) return 'about';
    if (p.startsWith('/services')) return 'services';
    if (p.startsWith('/work')) return 'work';
    if (p.startsWith('/resume')) return 'resume';
    if (p.startsWith('/contact')) return 'contact';
    return 'home';
  };

  const routeGroup = getRouteGroup(route.path);

  useEffect(() => {
    let rafId = 0;

    // Select all animatable blocks across every public route
    const selectors = [
      '.hero-next-copy > *',
      '.hero-portrait',
      '.page-hero .eyebrow',
      '.page-hero h1',
      '.page-hero p',
      '.services-heading-row',
      '.section-topline',
      '.category-disclosure',
      '.category-services > p',
      '.editorial-item',
      '.project-row',
      '.empty-state',
      '.case-step',
      '.skill-tag',
      '.resume-public',
      '.contact-links-stack a',
      '.contact-form-panel',
      '.site-callout-inner',
      '.about-page-copy > .eyebrow',
      '.about-page-copy > .section-heading',
      '.about-page-copy > .about-copy',
      '.about-cta',
      '.content-section > .section-heading',
      '.content-section > .about-copy',
      '.content-section > .button-primary',
      '.content-section > .dark-text-link',
      '.privacy-notice-card',
      '.privacy-notice-section',
      '.public-footer-main > div',
    ].join(', ');

    const elements = Array.from(document.querySelectorAll<HTMLElement>(selectors));

    elements.forEach((el, idx) => {
      el.classList.add('scroll-reveal');
      // Group stagger index within parent container for natural wave cascades
      const siblings = el.parentElement
        ? Array.from(el.parentElement.children).indexOf(el)
        : idx;
      const staggerIndex = Math.max(0, siblings) % 10;
      el.style.setProperty('--sr-idx', String(staggerIndex));

      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 20) {
        el.classList.add('is-inview');
      }
    });

    const updateScrollFrame = () => {
      const docEl = document.documentElement;
      const vh = Math.max(1, window.innerHeight);
      const maxScroll = Math.max(1, docEl.scrollHeight - vh);
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      docEl.style.setProperty('--site-scroll-progress', progress.toFixed(4));
      docEl.style.setProperty('--site-scroll-y', `${Math.min(window.scrollY, 600).toFixed(1)}px`);
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        updateScrollFrame();
        rafId = 0;
      });
    };

    updateScrollFrame();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            target.classList.add('is-inview');
          } else {
            // Re-arm animation when element scrolls completely out of viewport so scrolling back up/down animates smoothly
            const rect = entry.boundingClientRect;
            if (rect.top > window.innerHeight * 0.98 || rect.bottom < -40) {
              target.classList.remove('is-inview');
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -5% 0px',
        threshold: 0.05,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [route.path, route.search, route.transitionKey]);

  // Studio Admin CMS routes (/admin/*)
  if (route.path.startsWith('/admin')) {
    return <AdminCMS currentPath={route.path} onNavigate={navigate} />;
  }

  // Standalone Privacy Notice route (/privacy)
  if (route.path === '/privacy') {
    return <PrivacyPage onNavigate={navigate} />;
  }

  // Parse query params (e.g., ?service=Website%20Development)
  const searchParams = new URLSearchParams(route.search);
  const preselectedService = searchParams.get('service') || '';

  const renderPublicPage = () => {
    const p = route.path;

    if (p === '/' || p === '') {
      return <HomePage onNavigate={navigate} />;
    }
    if (p === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }
    if (p === '/services') {
      return <ServicesPage onNavigate={navigate} />;
    }
    if (p.startsWith('/services/')) {
      const slug = decodeURIComponent(p.replace('/services/', ''));
      return <ServicesPage slug={slug} onNavigate={navigate} />;
    }
    if (p === '/work') {
      return <WorkPage onNavigate={navigate} />;
    }
    if (p.startsWith('/work/')) {
      const slug = decodeURIComponent(p.replace('/work/', ''));
      return <WorkPage slug={slug} onNavigate={navigate} />;
    }
    if (p === '/resume') {
      return <ResumePage onNavigate={navigate} />;
    }
    if (p === '/contact') {
      return <ContactPage initialService={preselectedService} />;
    }

    return <HomePage onNavigate={navigate} />;
  };

  return (
    <>
      <div className="scroll-progress-bar" aria-hidden="true" />
      <div className="route-stage" data-route={routeGroup} key={route.transitionKey}>
        <div className="page-magic" aria-hidden="true" />
        <div className="site-public">
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <SiteHeader currentPath={route.path} onNavigate={navigate} />
          <main id="main-content" className="public-main">
            {renderPublicPage()}
          </main>
          <SiteFooter onNavigate={navigate} />
        </div>
      </div>
      <VisitorIntakeModal currentPath={route.path} onNavigate={navigate} />
    </>
  );
};

export default function App() {
  return (
    <CMSProvider>
      <AppRouter />
    </CMSProvider>
  );
}
