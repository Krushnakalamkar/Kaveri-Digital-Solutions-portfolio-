import React from 'react';
import { ArrowLeft, ArrowUpRight, Github } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { PageHero } from '../components/PageHero';

interface WorkPageProps {
  slug?: string;
  onNavigate: (path: string) => void;
}

export const WorkPage: React.FC<WorkPageProps> = ({ slug, onNavigate }) => {
  const { db } = useCMS();
  const published = db.projects.filter((p) => p.published);

  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  if (slug) {
    const project = db.projects.find((p) => p.slug === slug);
    if (project) {
      const steps = [
        ['01', 'Challenge', project.challenge],
        ['02', 'Approach', project.approach],
        ['03', 'Development', project.development],
        ['04', 'Result', project.result],
      ];

      return (
        <>
          <PageHero
            eyebrow={`SELECTED WORK / ${project.category}`}
            title={
              <>
                {project.title}
                <em>.</em>
              </>
            }
            subtitle={project.summary}
          />
          <section className="content-section">
            {!project.published ? (
              <p className="admin-alert">
                Draft preview — only visible to a signed-in administrator.
              </p>
            ) : null}
            <a
              href="/work"
              onClick={(e) => handleNav(e, '/work')}
              className="dark-text-link"
            >
              <ArrowLeft size={15} /> Selected work
            </a>
            {project.coverImage ? (
              <div className="project-hero-image">
                <img src={project.coverImage} alt={`${project.title} project image`} />
              </div>
            ) : null}
            {project.tags.length ? (
              <div className="tech-list">
                {project.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            ) : null}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 14 }}>
              {project.liveUrl ? (
                <a
                  className="dark-text-link"
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit live project <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden="true" />
                </a>
              ) : null}
              {project.githubUrl ? (
                <a
                  className="dark-text-link"
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github size={15} strokeWidth={1.75} aria-hidden="true" /> Source on GitHub
                </a>
              ) : null}
            </div>
            {project.description ? (
              <p className="project-detail-copy">{project.description}</p>
            ) : null}
            <h2 className="display section-heading framework-heading">
              From Idea <em>→</em>
              <br />
              Digital Product
            </h2>
            <div className="case-framework">
              {steps.map(([number, title, detail]) => (
                <section className="case-step" key={number}>
                  <b>{number}</b>
                  <h3>{title}</h3>
                  {detail ? <p>{detail}</p> : null}
                </section>
              ))}
            </div>
          </section>
        </>
      );
    }
  }

  return (
    <>
      <PageHero
        eyebrow="WORK / SELECTED PROJECTS"
        title={
          <>
            Selected
            <br />
            <em>Work.</em>
          </>
        }
        subtitle="A selection of digital experiences and solutions."
      />
      <section className="content-section">
        {!published.length ? (
          <div className="empty-state">
            <span className="empty-label">PROJECTS</span>
            <h2>I haven’t shared project details here yet.</h2>
            <p>No project write-ups are currently published on this portfolio.</p>
          </div>
        ) : (
          <div className="project-list">
            {published.map((project, index) => (
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
        )}
      </section>
    </>
  );
};
