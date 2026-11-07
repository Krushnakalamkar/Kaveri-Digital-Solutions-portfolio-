import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Mail,
  Phone,
  Instagram,
  Linkedin,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { PageHero } from '../components/PageHero';
import { BUDGET_OPTIONS } from '../data/seed';

interface ContactPageProps {
  initialService?: string;
}

export const ContactPage: React.FC<ContactPageProps> = ({ initialService = '' }) => {
  const { db, addContactMessage } = useCMS();
  const activeServices = db.services.filter((s) => s.active);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [budget, setBudget] = useState('');
  const [service, setService] = useState(initialService);
  const [projectType, setProjectType] = useState('');
  const [message, setMessage] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentDataUrl, setAttachmentDataUrl] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialService) {
      setService(initialService);
    }
  }, [initialService]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setAttachmentName('');
      setAttachmentDataUrl('');
      return;
    }
    setAttachmentName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachmentDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanMessage = message.trim();

    if (cleanName.length < 2) {
      setError('Please enter your name (at least 2 characters).');
      setStatus('error');
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      setStatus('error');
      return;
    }
    if (cleanMessage.length < 10) {
      setError('Please describe your project (at least 10 characters).');
      setStatus('error');
      return;
    }

    addContactMessage({
      name: cleanName,
      email: cleanEmail,
      phone: phone.trim() || undefined,
      budget: budget || undefined,
      service: service || undefined,
      projectType: projectType.trim() || undefined,
      message: cleanMessage,
      attachmentName: attachmentName || undefined,
      attachmentDataUrl: attachmentDataUrl || undefined,
    });

    setStatus('success');
    setError('');
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setBudget('');
    setService('');
    setProjectType('');
    setMessage('');
    setAttachmentName('');
    setAttachmentDataUrl('');
    setStatus('idle');
    setError('');
  };

  return (
    <>
      <PageHero
        eyebrow="CONTACT"
        title={
          <>
            Let’s make
            <br />
            <em>something matter.</em>
          </>
        }
        subtitle="Have a clear brief or just the beginning of an idea? Tell me where you want to go."
      />
      <section className="content-section public-contact">
        <div>
          <p className="eyebrow burgundy">
            <MapPin className="ic" size={13} strokeWidth={1.75} aria-hidden="true" focusable="false" />{' '}
            {db.profile.location}
          </p>
          <div className="contact-links-stack">
            <a href={`mailto:${db.profile.primaryEmail}`}>
              <span>
                <Mail className="ic" size={12} strokeWidth={1.75} aria-hidden="true" focusable="false" /> PRIMARY EMAIL
              </span>
              {db.profile.primaryEmail}
            </a>
            <a href={`mailto:${db.profile.businessEmail}`}>
              <span>
                <Mail className="ic" size={12} strokeWidth={1.75} aria-hidden="true" focusable="false" /> BUSINESS EMAIL
              </span>
              {db.profile.businessEmail}
            </a>
            <a href={`tel:${db.profile.phone.replace(/[^\d+]/g, '')}`}>
              <span>
                <Phone className="ic" size={12} strokeWidth={1.75} aria-hidden="true" focusable="false" /> PHONE
              </span>
              {db.profile.phone}
            </a>
            {db.profile.instagramUrl ? (
              <a href={db.profile.instagramUrl} target="_blank" rel="noreferrer">
                <span>
                  <Instagram className="ic" size={12} strokeWidth={1.75} aria-hidden="true" focusable="false" /> INSTAGRAM
                </span>
                {db.profile.instagramUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            ) : null}
            {db.profile.linkedinUrl ? (
              <a href={db.profile.linkedinUrl} target="_blank" rel="noreferrer">
                <span>
                  <Linkedin className="ic" size={12} strokeWidth={1.75} aria-hidden="true" focusable="false" /> LINKEDIN
                </span>
                {db.profile.linkedinUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            ) : null}
          </div>
        </div>

        <div className="contact-form-panel">
          {status === 'success' ? (
            <div className="contact-success" role="status">
              <CheckCircle2 size={26} strokeWidth={1.5} aria-hidden="true" />
              <h2>Message received.</h2>
              <p>
                Your enquiry has been saved to our Studio Inbox and routed to{' '}
                <strong>{db.profile.primaryEmail}</strong> (and business desk{' '}
                <strong>{db.profile.businessEmail}</strong>). I will reply directly to{' '}
                <strong>{email}</strong>.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
                <a
                  href={`mailto:${db.profile.primaryEmail}?cc=${encodeURIComponent(
                    db.profile.businessEmail
                  )}&subject=${encodeURIComponent(
                    `Project Enquiry${service ? `: ${service}` : ''} — ${name}`
                  )}&body=${encodeURIComponent(
                    `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nService: ${
                      service || 'General'
                    }\nBudget: ${budget || 'N/A'}\nProject Type: ${
                      projectType || 'N/A'
                    }\n\nProject Details:\n${message}`
                  )}`}
                  className="button-primary focus-ring"
                >
                  Open in Email App ({db.profile.primaryEmail})
                </a>
                <button type="button" className="button-light focus-ring" onClick={resetForm}>
                  Send another message
                </button>
              </div>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="admin-field">
                <label htmlFor="c-name">Your name</label>
                <input
                  id="c-name"
                  name="name"
                  autoComplete="name"
                  minLength={2}
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="c-email">Email address</label>
                <input
                  id="c-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="contact-two">
                <div className="admin-field">
                  <label htmlFor="c-phone">Phone (optional)</label>
                  <input
                    id="c-phone"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="c-budget">Budget (optional)</label>
                  <select
                    id="c-budget"
                    name="budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  >
                    <option value="">Select a range</option>
                    {BUDGET_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="contact-two">
                <div className="admin-field">
                  <label htmlFor="c-service">Service (optional)</label>
                  <select
                    id="c-service"
                    name="service"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                  >
                    <option value="">Select a service</option>
                    {activeServices.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-field">
                  <label htmlFor="c-type">Project type (optional)</label>
                  <input
                    id="c-type"
                    name="projectType"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-field">
                <label htmlFor="c-message">A little about your project</label>
                <textarea
                  id="c-message"
                  name="message"
                  rows={5}
                  minLength={10}
                  maxLength={10000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="c-attachment">Attachment (optional)</label>
                <input
                  id="c-attachment"
                  type="file"
                  onChange={handleFileChange}
                />
              </div>

              <div style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
                <label htmlFor="c-website">Website</label>
                <input
                  id="c-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {status === 'error' ? (
                <p className="contact-error" role="alert">
                  <AlertCircle size={15} strokeWidth={1.75} aria-hidden="true" /> {error}
                </p>
              ) : null}

              <button className="button-primary focus-ring" type="submit">
                Send enquiry <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
};
