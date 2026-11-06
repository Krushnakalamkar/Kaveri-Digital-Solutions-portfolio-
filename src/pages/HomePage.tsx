import React, { useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { CategoryIcon } from '../components/CategoryIcon';
import { triggerResumeDownload } from '../utils/resumeDownload';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

const HERO_CORNER_ICON_URL =
  '/assets/aistudio/apps.40749.14551954140006744.d20500b3-e3f5-4e22-9b0f-0c38504cc190_5cc63691.png';

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { db } = useCMS();
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  const [portraitStep, setPortraitStep] = useState(0);
  const [isPointerPressed, setIsPointerPressed] = useState(false);

  const PORTRAIT_3D_STATES = [
    { tiltX: 5.5, tiltY: 8.5, wbX: -11, wbY: 11 },   // Bottom-Left white 3D box (Screenshot 4)
    { tiltX: -6, tiltY: 9, wbX: -11, wbY: -11 },     // Top-Left white 3D box (Screenshot 3)
    { tiltX: -5.5, tiltY: -8.5, wbX: 11, wbY: -10 }, // Top-Right white 3D box (Screenshot 1)
    { tiltX: 6, tiltY: -9, wbX: 11, wbY: 11 },       // Bottom-Right white 3D box (Screenshot 2)
  ];

  const current3D = PORTRAIT_3D_STATES[portraitStep % PORTRAIT_3D_STATES.length];

  const activeServices = db.services.filter((s) => s.active);
  const sortedCategories = [...db.categories].sort((a, b) => a.order - b.order);
  const publishedProjects = db.projects.filter((p) => p.published);
  const activeSkills = [...db.skills].filter((s) => s.active).sort((a, b) => a.order - b.order);

  const firstName = (db.profile.firstName || db.profile.name.trim().split(/\s+/)[0] || 'Krushna').trim();

  const applyPortraitStep = (el: HTMLElement, nextStep: number) => {
    const state = PORTRAIT_3D_STATES[nextStep % PORTRAIT_3D_STATES.length];
    el.style.setProperty('--portrait-tilt-x', `${state.tiltX}deg`);
    el.style.setProperty('--portrait-tilt-y', `${state.tiltY}deg`);
    el.style.setProperty('--wb-x', `${state.wbX}px`);
    el.style.setProperty('--wb-y', `${state.wbY}px`);
  };

  const handlePortraitTap = (event: React.MouseEvent<HTMLElement>) => {
    const el = event.currentTarget;
    const bounds = el.getBoundingClientRect();
    let nextStep = (portraitStep + 1) % PORTRAIT_3D_STATES.length;

    if (bounds.width && bounds.height && event.clientX && event.clientY) {
      const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      // Determine tapped quadrant; if already in that quadrant, advance to next state
      let tappedStep = nextStep;
      if (x < -0.15 && y >= 0.1) tappedStep = 0; // bottom-left
      else if (x < -0.15 && y < 0.1) tappedStep = 1; // top-left
      else if (x >= 0.15 && y < 0.1) tappedStep = 2; // top-right
      else if (x >= 0.15 && y >= 0.1) tappedStep = 3; // bottom-right

      nextStep = tappedStep === portraitStep ? (portraitStep + 1) % PORTRAIT_3D_STATES.length : tappedStep;
    }

    setPortraitStep(nextStep);
    applyPortraitStep(el, nextStep);
  };

  const handlePortraitPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!isPointerPressed) return;
    const el = event.currentTarget;
    const bounds = el.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1));
    const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1));
    el.style.setProperty('--portrait-tilt-x', `${(-y * 8).toFixed(2)}deg`);
    el.style.setProperty('--portrait-tilt-y', `${(x * 10).toFixed(2)}deg`);
    el.style.setProperty('--wb-x', `${(-x * 13).toFixed(1)}px`);
    el.style.setProperty('--wb-y', `${(-y * 13).toFixed(1)}px`);
  };

  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  const handleResumeDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerResumeDownload(
      db.profile,
      db.settings.resumePdfDataUrl,
      db.settings.resumeFileName,
      db.skills,
      db.categories,
      db.services
    );
  };

  return (
    <>
      {/* Hero (.hero-next) */}
      <section className="hero-next">
        <div className="hero-next-copy">
          <h1>
            Hi, I’m
            <br />
            <span>{firstName}.</span>
          </h1>
          <p className="hero-next-role">
            {db.profile.title} <span className="role-divider">/</span> {db.profile.location}
          </p>
          {db.profile.biography ? (
            <p className="hero-personal-intro">{db.profile.biography}</p>
          ) : null}

          <div className="hero-actions-next">
            <a
              className="button-primary focus-ring"
              href="/contact"
              onClick={(e) => handleNav(e, '/contact')}
            >
              Get in touch <ArrowUpRight size={16} />
            </a>
            <a
              className="button-text focus-ring"
              href={publishedProjects.length ? '/work' : '/about'}
              onClick={(e) => handleNav(e, publishedProjects.length ? '/work' : '/about')}
            >
              {publishedProjects.length ? 'View selected work' : 'More about me'}{' '}
              <ArrowRight size={15} />
            </a>
          </div>

          <div className="proof-strip">
            {db.profile.experience ? (
              <div>
                <b>{db.profile.experience}</b>
                <span>Experience</span>
              </div>
            ) : null}
            <div>
              <b>{activeServices.length}</b>
              <span>Services across {sortedCategories.length} categories</span>
            </div>
          </div>
        </div>

        {db.profile.portraitUrl ? (
          <figure
            className="hero-portrait"
            style={
              {
                '--portrait-tilt-x': `${current3D.tiltX}deg`,
                '--portrait-tilt-y': `${current3D.tiltY}deg`,
                '--wb-x': `${current3D.wbX}px`,
                '--wb-y': `${current3D.wbY}px`,
              } as React.CSSProperties
            }
            onClick={handlePortraitTap}
            onPointerDown={() => setIsPointerPressed(true)}
            onPointerMove={handlePortraitPointerMove}
            onPointerUp={() => setIsPointerPressed(false)}
            onPointerCancel={() => setIsPointerPressed(false)}
            onPointerLeave={() => setIsPointerPressed(false)}
            role="button"
            tabIndex={0}
            aria-label={`Interactive 3D portrait of ${db.profile.name}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const next = (portraitStep + 1) % PORTRAIT_3D_STATES.length;
                setPortraitStep(next);
                applyPortraitStep(e.currentTarget, next);
              }
            }}
          >
            <div className="hero-portrait-stage">
              <div className="hero-portrait-white-box" aria-hidden="true" />
              <div className="hero-image-wrap">
                <img
                  src={db.profile.portraitUrl}
                  alt={`Portrait of ${db.profile.name}`}
                />
                <span className="hero-portrait-arrow" aria-hidden="true">
                  <ArrowUpRight size={16} />
                </span>
              </div>
              <img
                src={HERO_CORNER_ICON_URL}
                alt=""
                aria-hidden="true"
                className="hero-portrait-corner-icon"
              />
            </div>
            <figcaption className="hero-image-label">
              <span>{db.profile.name}</span>
              <span>{db.profile.location}</span>
            </figcaption>
          </figure>
        ) : null}
      </section>

      {/* Services Section (.home-services) */}
      <section className="home-services">
        <div className="content-section">
          <div className="services-heading-row">
            <h2 className="display section-heading">
              Services
              <br />
              <em>I offer.</em>
            </h2>
            <a
              className="button-light focus-ring"
              href="/services"
              onClick={(e) => handleNav(e, '/services')}
            >
              Explore services <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="category-list">
            {sortedCategories.map((category, index) => {
              const matching = activeServices
                .filter((s) => s.categoryId === category.id)
                .sort((a, b) => a.order - b.order);

              return (
                <details className="category-disclosure" key={category.id}>
                  <summary>
                    <span className="cat-ic">
                      <CategoryIcon icon={category.icon} size={20} />
                    </span>
                    {category.name}
                    <span>{matching.length} SERVICES</span>
                  </summary>
                  {matching.length > 0 ? (
                    <div className="category-services">
                      {matching.map((service, i) => (
                        <p key={service.id || `${index}-${i}`}>
                          <i>{String(i + 1).padStart(2, '0')}</i>
                          <a
                            href={`/services/${service.slug}`}
                            onClick={(e) => handleNav(e, `/services/${service.slug}`)}
                          >
                            {service.name}
                          </a>
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="service-category-note">
                      No services currently available in this category.
                    </p>
                  )}
                  <a
                    href={`/services/${category.slug}`}
                    onClick={(e) => handleNav(e, `/services/${category.slug}`)}
                    className="dark-text-link category-detail-link"
                  >
                    Explore {category.name} <ArrowUpRight size={14} />
                  </a>
                </details>
              );
            })}
          </div>
        </div>
      </section>

      {/* Selected Work Section (only rendered when published projects exist, matching reference page.tsx) */}
      {publishedProjects.length > 0 ? (
        <section className="content-section">
          <div className="section-topline">
            <p className="eyebrow">Selected work</p>
            <span>
              {publishedProjects.length} PUBLISHED PROJECT
              {publishedProjects.length === 1 ? '' : 'S'}
            </span>
          </div>
          <div style={{ paddingTop: 28 }}>
            <div className="project-list">
              {publishedProjects.map((project, index) => (
                <article className="project-row" key={project.slug || index}>
                  {project.coverImage ? (
                    <div className="project-cover-img">
                      <img src={project.coverImage} alt={`${project.title} project image`} />
                    </div>
                  ) : (
                    <div className="project-cover" aria-hidden="true">
                      KK<span>.</span>
                    </div>
                  )}
                  <div className="project-info">
                    <span className="eyebrow">{project.category}</span>
                    <h2>{project.title}</h2>
                    <p>{project.summary}</p>
                    {project.tags.length ? (
                      <div className="tech-list">
                        {project.tags.map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </div>
                    ) : null}
                    <a
                      href={`/work/${project.slug}`}
                      onClick={(e) => handleNav(e, `/work/${project.slug}`)}
                    >
                      View case study <ArrowUpRight size={14} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <a
            href="/work"
            onClick={(e) => handleNav(e, '/work')}
            className="dark-text-link"
            style={{ marginTop: 20 }}
          >
            See all projects <ArrowRight size={16} />
          </a>
        </section>
      ) : null}

      {/* Skills Section (#skills) */}
      <section className="content-section skills-home" id="skills">
        <div className="section-topline">
          <p className="eyebrow">Skills</p>
          {activeSkills.length ? <span>{activeSkills.length} LISTED SKILLS</span> : null}
        </div>
        <div className="skill-cloud">
          {activeSkills.length ? (
            activeSkills.slice(0, 12).map((skill, i) => {
              const keyId = skill.id || String(i);
              const isSelected = selectedSkillId === keyId;
              return (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedSkillId((prev) => (prev === keyId ? null : keyId))
                  }
                  aria-pressed={isSelected}
                  className={`skill-tag ${isSelected ? 'skill-accent' : ''}`}
                  key={keyId}
                >
                  <i>{String(i + 1).padStart(2, '0')}</i>
                  {skill.name}
                </button>
              );
            })
          ) : (
            <p className="data-empty-note">I haven’t listed specific tools or skills here yet.</p>
          )}
        </div>
      </section>

      {/* Experience & Résumé Section */}
      <section className="content-section">
        <div className="section-topline">
          <p className="eyebrow">Experience &amp; résumé</p>
        </div>
        <h2 className="display section-heading">
          Want more
          <br />
          <em>detail?</em>
        </h2>
        <p className="about-copy">
          {db.settings.resumePdfDataUrl
            ? 'Download my current résumé for an overview of my experience.'
            : 'I haven’t posted a résumé here yet. Get in touch to ask about my experience.'}
        </p>
        {db.settings.resumePdfDataUrl ? (
          <a
            href="#download-resume"
            onClick={handleResumeDownload}
            className="button-primary focus-ring"
          >
            Download résumé <ArrowDown size={16} />
          </a>
        ) : (
          <a
            href="/contact"
            onClick={(e) => handleNav(e, '/contact')}
            className="dark-text-link"
          >
            Ask about my experience <ArrowUpRight size={16} />
          </a>
        )}
      </section>

      {/* Site Callout (.site-callout) */}
      <section className="site-callout">
        <div className="site-callout-inner">
          <h2>
            Have a question?
            <br />
            Write to me.
          </h2>
          <a href="/contact" onClick={(e) => handleNav(e, '/contact')}>
            Get in touch <ArrowUpRight size={16} />
          </a>
        </div>
      </section>
    </>
  );
};
