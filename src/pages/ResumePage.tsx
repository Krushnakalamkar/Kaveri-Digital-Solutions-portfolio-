import React from 'react';
import { Download, Mail } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { PageHero } from '../components/PageHero';
import { triggerResumeDownload } from '../utils/resumeDownload';

interface ResumePageProps {
  onNavigate: (path: string) => void;
}

export const ResumePage: React.FC<ResumePageProps> = ({ onNavigate }) => {
  const { db } = useCMS();
  const hasResume = Boolean(db.settings.resumePdfDataUrl);

  const handleDownload = (e: React.MouseEvent) => {
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

  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <>
      <PageHero
        eyebrow="RESUME"
        title={
          <>
            My
            <br />
            <em>résumé.</em>
          </>
        }
        subtitle={[db.profile.title, db.profile.experience].filter(Boolean).join(' · ')}
      />
      <section className="content-section narrow">
        <div className="resume-public">
          {hasResume ? (
            <>
              <p>Download the current résumé.</p>
              <a
                className="button-light focus-ring"
                href="#download"
                onClick={handleDownload}
                data-testid="link-resume-download"
              >
                <Download className="ic" size={16} strokeWidth={1.75} aria-hidden="true" focusable="false" />
                Download résumé
              </a>
            </>
          ) : (
            <>
              <p>
                I haven’t published a résumé here yet. Get in touch to ask about my experience.
              </p>
              <a
                className="button-light focus-ring"
                href="/contact"
                onClick={(e) => handleNav(e, '/contact')}
              >
                <Mail className="ic" size={16} strokeWidth={1.75} aria-hidden="true" focusable="false" />
                Ask about my experience
              </a>
            </>
          )}
        </div>
      </section>
    </>
  );
};
