import { FormEvent, useState } from 'react';
import { isAxiosError } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { roleToDashboardPath } from '../services/roleRoutingService';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const session = await login(identifier.trim(), password);
      navigate(roleToDashboardPath(session.role), { replace: true });
    } catch (error) {
      if (isAxiosError<{ message?: string }>(error)) {
        const serverMsg = error.response?.data?.message;
        const status = error.response?.status;
        const netMsg = error.message;
        setErrorMessage(serverMsg ?? (status ? `HTTP ${status}: ${netMsg}` : `Network error: ${netMsg}`));
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Unable to sign in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">University access</p>
        <h1>Smart Campus Operations Hub</h1>
        <p>
          Manage resources, triage incidents, and monitor operational signals from a single control
          room.
        </p>
        <form className="booking-form" onSubmit={handleSubmit}>
          <label htmlFor="identifier">
            Username or email
            <input
              id="identifier"
              name="identifier"
              autoComplete="username"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="admin or admin@smartcampus.edu"
              required
            />
          </label>
          <label htmlFor="password">
            Password
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>
          {errorMessage ? (
            <p style={{ color: 'var(--warning)', margin: 0 }}>{errorMessage}</p>
          ) : null}
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
          <p style={{ textAlign: 'right', margin: '0.25rem 0 0', fontSize: '0.88rem' }}>
            <Link to="/forgot-password" style={{ color: 'var(--accent)', fontWeight: 500 }}>
              Forgot password?
            </Link>
          </p>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>or</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
        </div>

        <a
          href="/oauth2/authorization/google"
          className="ghost-button"
          style={{ display: 'block', textAlign: 'center', width: '100%' }}
        >
          Sign in with Google
        </a>
      </div>
    </div>
  );
}
