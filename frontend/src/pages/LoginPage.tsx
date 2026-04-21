import { FormEvent, useState } from 'react';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
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
        setErrorMessage(error.response?.data?.message ?? 'Unable to sign in. Please try again.');
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
        </form>
      </div>
    </div>
  );
}
