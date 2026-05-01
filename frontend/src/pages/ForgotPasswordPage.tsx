import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';

type Step = 'request' | 'sent' | 'reset' | 'done';

interface StrengthResult { score: number; label: string; color: string; hints: string[] }
function checkStrength(pwd: string): StrengthResult {
  const hints: string[] = [];
  if (pwd.length < 8) hints.push('At least 8 characters');
  if (!/[A-Z]/.test(pwd)) hints.push('One uppercase letter (A–Z)');
  if (!/[a-z]/.test(pwd)) hints.push('One lowercase letter (a–z)');
  if (!/[0-9]/.test(pwd)) hints.push('One number (0–9)');
  if (!/[^A-Za-z0-9]/.test(pwd)) hints.push('One special character (!@#$…)');
  const score = 5 - hints.length;
  const labels = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
  const colors = ['', '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#2b6cb0'];
  return { score, label: labels[score] ?? '', color: colors[score] ?? '#ccc', hints };
}

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const MOCK_CODE = '123456';

  const strength = newPassword ? checkStrength(newPassword) : null;
  const confirmMatch = confirmPassword.length > 0 && confirmPassword === newPassword;
  const confirmMismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;

  const handleRequest = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setStep('sent');
    }, 1000);
  };

  const handleVerify = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (code.trim() !== MOCK_CODE) {
      setError('Invalid reset code. (Hint: use 123456 for this demo)');
      return;
    }
    setStep('reset');
  };

  const handleReset = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newPassword) { setError('Please enter a new password.'); return; }
    if (strength && strength.score < 3) { setError('Password is too weak. Follow the hints.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setStep('done');
    }, 900);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Password Recovery</p>
        <h1>Forgot Password</h1>

        {/* ── Step 1: Enter email ── */}
        {step === 'request' && (
          <>
            <p>Enter the email address linked to your account. We'll send a reset code.</p>
            <form className="booking-form" onSubmit={handleRequest}>
              <label htmlFor="fp-email">
                Email address
                <input
                  id="fp-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@smartcampus.edu"
                  required
                />
              </label>
              {error ? <p style={{ color: 'var(--warning)', margin: 0 }}>{error}</p> : null}
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset code'}
              </button>
            </form>
          </>
        )}

        {/* ── Step 2: Code sent ── */}
        {step === 'sent' && (
          <>
            <p>
              A 6-digit reset code has been <strong>simulated</strong> as sent to{' '}
              <strong>{email}</strong>. Enter it below to continue.
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', background: 'var(--surface-muted)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
              📧 Demo mode: no real email is sent. Use code <strong>123456</strong>.
            </p>
            <form className="booking-form" onSubmit={handleVerify}>
              <label htmlFor="fp-code">
                Reset code
                <input
                  id="fp-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit code"
                  required
                />
              </label>
              {error ? <p style={{ color: 'var(--warning)', margin: 0 }}>{error}</p> : null}
              <button className="primary-button" type="submit">Verify code</button>
              <button
                className="ghost-button"
                type="button"
                onClick={() => { setStep('request'); setCode(''); setError(''); }}
              >
                ← Back
              </button>
            </form>
          </>
        )}

        {/* ── Step 3: Set new password ── */}
        {step === 'reset' && (
          <>
            <p>Choose a strong new password for <strong>{email}</strong>.</p>
            <form className="booking-form" onSubmit={handleReset}>
              <label htmlFor="fp-new-pwd">
                New password
                <input
                  id="fp-new-pwd"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  required
                />
              </label>

              {/* Strength meter */}
              {strength ? (
                <div style={{ marginTop: '-0.5rem' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} style={{ flex: 1, height: '4px', borderRadius: '4px', background: i <= strength.score ? strength.color : 'var(--border)', transition: 'background 0.2s' }} />
                    ))}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: strength.color, fontWeight: 600 }}>{strength.label}</p>
                  {strength.hints.length > 0
                    ? <ul style={{ margin: '0.3rem 0 0', paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                        {strength.hints.map((h) => <li key={h}>{h}</li>)}
                      </ul>
                    : <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#38a169' }}>✓ All requirements met</p>}
                </div>
              ) : (
                <p style={{ margin: '-0.5rem 0 0', fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                  Min. 8 chars · uppercase · lowercase · number · special character
                </p>
              )}

              <label htmlFor="fp-confirm-pwd">
                Confirm new password{' '}
                {confirmMatch && <span style={{ color: '#38a169', fontWeight: 600 }}>✓ match</span>}
                {confirmMismatch && <span style={{ color: '#e53e3e', fontWeight: 600 }}>✗ mismatch</span>}
                <input
                  id="fp-confirm-pwd"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Repeat your new password"
                  required
                  style={{ borderColor: confirmMismatch ? '#e53e3e' : confirmMatch ? '#38a169' : undefined }}
                />
              </label>

              {error ? <p style={{ color: 'var(--warning)', margin: 0 }}>{error}</p> : null}
              <button
                className="primary-button"
                type="submit"
                disabled={loading || confirmMismatch || !confirmPassword}
              >
                {loading ? 'Saving…' : 'Set new password'}
              </button>
            </form>
          </>
        )}

        {/* ── Step 4: Done ── */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <p style={{ fontSize: '2.5rem', margin: '0 0 0.5rem' }}>✅</p>
            <h3 style={{ margin: '0 0 0.75rem' }}>Password Reset!</h3>
            <p style={{ color: 'var(--ink-muted)' }}>
              Your password has been updated successfully. You can now sign in with your new password.
            </p>
            <Link className="primary-button" to="/login" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>
              Back to Sign In
            </Link>
          </div>
        )}

        {step !== 'done' && (
          <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.88rem' }}>
            Remember your password?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
