import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

interface PrivacyPageProps {
  onNavigate: (path: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
  const { db } = useCMS();

  return (
    <main className="privacy-notice-page">
      <article className="privacy-notice-card">
        <button
          type="button"
          className="privacy-notice-back"
          onClick={() => onNavigate('/')}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Back to Kaveri
        </button>
        <p className="privacy-notice-eyebrow">Kaveri Digital Solutions</p>
        <h1>Privacy notice</h1>
        <p className="privacy-notice-intro">
          This notice explains what the welcome form collects, why it is collected, where it is
          stored, and how to ask for a correction or deletion.
        </p>

        <section className="privacy-notice-section">
          <h2>What we collect and why</h2>
          <p>
            The welcome form collects your name, age, State or Union Territory, and your consent to
            submit these details. Kaveri Digital Solutions uses them for visitor insights.
          </p>
        </section>

        <section className="privacy-notice-section">
          <h2>Where your details go</h2>
          <p>
            When you submit the form, your name, age, State or Union Territory, consent, and the
            date and time of submission are added to Kaveri Digital Solutions’ connected Google
            Sheet. The date and time are recorded in India local time. This browser stores only a
            completion marker, not the details you submit.
          </p>
        </section>

        <section className="privacy-notice-section">
          <h2>How long entries are kept</h2>
          <p>
            Entries are kept in the Google Sheet indefinitely unless a deletion request is made.
          </p>
        </section>

        <section className="privacy-notice-section">
          <h2>Correction or deletion requests</h2>
          <p>
            To ask Kaveri Digital Solutions to correct or delete your visitor-intake entry, email{' '}
            <a href={`mailto:${db.profile.primaryEmail}`}>{db.profile.primaryEmail}</a>. Include
            the name you entered and whether you are requesting a correction or deletion. For a
            correction, say what should be changed; do not send details that are not needed for
            your request.
          </p>
        </section>

        <section className="privacy-notice-section">
          <h2>If you are under 18</h2>
          <p>
            You may submit the form after a parent or guardian has reviewed the submission. The
            consent checkbox confirms this review as well as your agreement to share the details.
          </p>
        </section>
      </article>
    </main>
  );
};
