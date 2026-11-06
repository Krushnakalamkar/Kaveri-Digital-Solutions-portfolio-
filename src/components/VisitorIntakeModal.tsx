import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowRight, LockKeyhole, X, CheckCircle2 } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { INDIAN_STATES, INDIAN_UNION_TERRITORIES } from '../data/seed';

interface VisitorIntakeModalProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

type FormValues = { name: string; age: string; state: string; consent: boolean };
type FieldErrors = Partial<Record<keyof FormValues, string>>;

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (values.name.trim().length < 2) errors.name = 'Please enter at least 2 characters.';
  else if (values.name.trim().length > 100) errors.name = 'Name must be 100 characters or fewer.';

  const age = Number(values.age);
  if (!values.age) errors.age = 'Please enter your age.';
  else if (!Number.isInteger(age) || age < 1 || age > 120) {
    errors.age = 'Enter a whole number from 1 to 120.';
  }

  if (!values.state) errors.state = 'Choose your State or Union Territory.';
  if (!values.consent) errors.consent = 'Please confirm your consent to continue.';
  return errors;
}

export const VisitorIntakeModal: React.FC<VisitorIntakeModalProps> = ({
  currentPath,
  onNavigate,
}) => {
  const {
    hasCompletedIntake,
    isVisitorGateOpen,
    closeVisitorGate,
    submitVisitorIntake,
    isGoogleSheetsConnected,
    googleUserEmail,
    connectGoogleSheets,
  } = useCMS();
  const [values, setValues] = useState<FormValues>({
    name: '',
    age: '',
    state: '',
    consent: false,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [requestError, setRequestError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [connectingSheets, setConnectingSheets] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const isBypassedRoute =
    currentPath === '/privacy' || currentPath.startsWith('/admin');

  const isOpen = (!hasCompletedIntake || isVisitorGateOpen) && !isBypassedRoute;

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    nameRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const setField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setRequestError('');
  };

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const rx = ((event.clientY - bounds.top) / bounds.height - 0.5) * -2.2;
    const ry = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2.2;
    event.currentTarget.style.setProperty('--vi-rotate-x', `${rx.toFixed(2)}deg`);
    event.currentTarget.style.setProperty('--vi-rotate-y', `${ry.toFixed(2)}deg`);
  }, []);

  const onPointerLeave = useCallback((event: React.PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty('--vi-rotate-x', '0deg');
    event.currentTarget.style.setProperty('--vi-rotate-y', '0deg');
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setRequestError('');
    if (Object.keys(nextErrors).length) {
      const firstInvalid = Object.keys(nextErrors)[0];
      dialogRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await submitVisitorIntake({
        name: values.name.trim(),
        age: Number(values.age),
        stateOrUt: values.state,
        consent: true,
      });
      setValues({
        name: '',
        age: '',
        state: '',
        consent: false,
      });
      setErrors({});
    } catch (err) {
      setRequestError(
        err instanceof Error
          ? err.message
          : 'We could not save your details. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleConnectSheets = async () => {
    if (connectingSheets) return;
    setConnectingSheets(true);
    try {
      await connectGoogleSheets();
    } catch {
      // ignore popup cancellation
    } finally {
      setConnectingSheets(false);
    }
  };

  return (
    <div
      className="visitor-intake"
      data-testid="visitor-intake-gate"
      onClick={(e) => e.stopPropagation()}
    >
      <section
        className="visitor-intake__card"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="visitor-intake-heading"
        aria-describedby="visitor-intake-intro"
        tabIndex={-1}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <div className="visitor-intake__content">
          {hasCompletedIntake && isVisitorGateOpen ? (
            <button
              type="button"
              onClick={closeVisitorGate}
              aria-label="Close welcome gate"
              className="visitor-intake__close"
            >
              <X size={16} />
            </button>
          ) : null}

          <div className="visitor-intake__brand" aria-label="Kaveri Digital Solutions">
            <img
              className="visitor-intake__logo"
              src="/images/kaveri-logo.png"
              alt=""
              width="47"
              height="47"
            />
            <span className="visitor-intake__brand-copy">
              <span className="visitor-intake__brand-name">KAVERI</span>
              <span className="visitor-intake__brand-sub">DIGITAL SOLUTIONS</span>
            </span>
          </div>
          <div className="visitor-intake__rule" aria-hidden="true" />
          <h1 className="visitor-intake__heading" id="visitor-intake-heading">
            Welcome to <span>Kaveri</span>
          </h1>
          <p className="visitor-intake__intro" id="visitor-intake-intro">
            Your name, age, State or Union Territory, and consent are recorded in Kaveri’s Google
            Sheet for visitor insights, along with the date and time.
          </p>

          <form className="visitor-intake__form" onSubmit={handleSubmit} noValidate>
            <div className="visitor-intake__field">
              <label className="visitor-intake__label" htmlFor="visitor-name">
                Your name
              </label>
              <input
                ref={nameRef}
                className="visitor-intake__control"
                id="visitor-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="How should I address you?"
                value={values.name}
                onChange={(e) => setField('name', e.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'visitor-name-error' : undefined}
                maxLength={100}
                required
                disabled={submitting}
              />
              {errors.name ? (
                <p className="visitor-intake__field-error" id="visitor-name-error">
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div className="visitor-intake__field">
              <label className="visitor-intake__label" htmlFor="visitor-age">
                Your age
              </label>
              <input
                className="visitor-intake__control"
                id="visitor-age"
                name="age"
                type="number"
                inputMode="numeric"
                min="1"
                max="120"
                step="1"
                placeholder="Enter your age"
                value={values.age}
                onChange={(e) => setField('age', e.target.value)}
                aria-invalid={Boolean(errors.age)}
                aria-describedby={errors.age ? 'visitor-age-error' : undefined}
                required
                disabled={submitting}
              />
              {errors.age ? (
                <p className="visitor-intake__field-error" id="visitor-age-error">
                  {errors.age}
                </p>
              ) : null}
            </div>

            <div className="visitor-intake__field">
              <label className="visitor-intake__label" htmlFor="visitor-state">
                State or Union Territory
              </label>
              <div className="visitor-intake__control-wrap">
                <select
                  className="visitor-intake__control visitor-intake__select"
                  id="visitor-state"
                  name="state"
                  value={values.state}
                  onChange={(e) => setField('state', e.target.value)}
                  aria-invalid={Boolean(errors.state)}
                  aria-describedby={errors.state ? 'visitor-state-error' : undefined}
                  required
                  disabled={submitting}
                >
                  <option value="">Choose your location</option>
                  <optgroup label="States">
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Union Territories">
                    {INDIAN_UNION_TERRITORIES.map((ut) => (
                      <option key={ut} value={ut}>
                        {ut}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <span className="visitor-intake__select-chevron" aria-hidden="true" />
              </div>
              {errors.state ? (
                <p className="visitor-intake__field-error" id="visitor-state-error">
                  {errors.state}
                </p>
              ) : null}
            </div>

            <div className="visitor-intake__consent">
              <input
                id="visitor-consent"
                name="consent"
                type="checkbox"
                checked={values.consent}
                onChange={(e) => setField('consent', e.target.checked)}
                aria-invalid={Boolean(errors.consent)}
                aria-labelledby="visitor-consent-label"
                aria-describedby={errors.consent ? 'visitor-consent-error' : undefined}
                required
                disabled={submitting}
              />
              <span className="visitor-intake__consent-copy">
                <label id="visitor-consent-label" htmlFor="visitor-consent">
                  I agree to share these details with Kaveri Digital Solutions for visitor
                  insights. If I’m under 18, a parent or guardian has reviewed this submission.
                </label>
                <button
                  type="button"
                  className="visitor-intake__privacy-link"
                  onClick={() => onNavigate('/privacy')}
                >
                  Read the privacy notice
                </button>
              </span>
            </div>
            {errors.consent ? (
              <p className="visitor-intake__field-error" id="visitor-consent-error">
                {errors.consent}
              </p>
            ) : null}
            {requestError ? (
              <p className="visitor-intake__error" role="alert">
                {requestError}
              </p>
            ) : null}

            <button className="visitor-intake__submit" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="visitor-intake__spinner" aria-hidden="true" />
                  Saving your details
                </>
              ) : (
                <>
                  <ArrowRight aria-hidden="true" />
                  Continue to the site
                </>
              )}
            </button>
          </form>

          <div className="visitor-intake__sheets-sync">
            {isGoogleSheetsConnected ? (
              <span className="visitor-intake__sheets-connected">
                <CheckCircle2 size={12} aria-hidden="true" /> Google Sheet Live Sync Active
                {googleUserEmail ? ` (${googleUserEmail})` : ''}
              </span>
            ) : (
              <button
                type="button"
                className="gsi-material-button visitor-intake__gsi"
                onClick={handleConnectSheets}
                disabled={connectingSheets}
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      style={{ display: 'block' }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">Sign in with Google</span>
                  <span style={{ display: 'none' }}>Sign in with Google</span>
                </div>
              </button>
            )}
          </div>

          <p className="visitor-intake__privacy">
            <LockKeyhole size={11} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-1px' }} /> This
            browser stores only a completion marker, not the details you submit.
          </p>
          <p className="visitor-intake__footer">Kaveri Digital Solutions</p>
          <p className="visitor-intake__tagline">Build · Grow · Succeed</p>
        </div>
      </section>
    </div>
  );
};
