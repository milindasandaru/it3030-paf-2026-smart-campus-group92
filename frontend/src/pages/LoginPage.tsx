import { useEffect, useState } from 'react';
import { fetchAuthConfig } from '../api/authApi';

export function LoginPage() {
  const [loginUrl, setLoginUrl] = useState('/oauth2/authorization/google');

  useEffect(() => {
    void fetchAuthConfig()
      .then((config) => setLoginUrl(config.loginUrl))
      .catch(() => setLoginUrl('/oauth2/authorization/google'));
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">University access</p>
        <h1>Smart Campus Operations Hub</h1>
        <p>
          Manage resources, triage incidents, and monitor operational signals from a single
          control room.
        </p>
        <a className="primary-button" href={loginUrl}>
          Continue with Google
        </a>
      </div>
    </div>
  );
}
