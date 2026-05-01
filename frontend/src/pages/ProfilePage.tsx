import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { fetchUserById, updateUserAdmin, updateUserProfile } from '../api/authApi';
import type { UserRole, UserSummary } from '../api/types';
import { SectionCard } from '../components/SectionCard';
import { ToastMessage } from '../components/ToastMessage';
import { useAuth } from '../hooks/useAuth';

const AVATAR_KEY = 'sc-avatar-';
const ALL_ROLES: UserRole[] = ['STUDENT', 'LECTURER', 'STAFF', 'TECHNICIAN', 'ADMIN'];

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function AvatarCircle({ name, src }: { name: string; src: string | null }) {
  return (
    <div style={{ width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', background: 'var(--accent-soft)', border: '3px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {src
        ? <img src={src} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>{initials(name)}</span>}
    </div>
  );
}

interface Rule { label: string; passed: boolean }
interface StrengthResult { score: number; label: string; color: string; rules: Rule[] }

function checkStrength(pwd: string): StrengthResult {
  const rules: Rule[] = [
    { label: 'At least 8 characters',           passed: pwd.length >= 8 },
    { label: 'One uppercase letter (A–Z)',        passed: /[A-Z]/.test(pwd) },
    { label: 'One lowercase letter (a–z)',        passed: /[a-z]/.test(pwd) },
    { label: 'One number (0–9)',                  passed: /[0-9]/.test(pwd) },
    { label: 'One special character (!@#$…)',     passed: /[^A-Za-z0-9]/.test(pwd) },
  ];
  const score = rules.filter((r) => r.passed).length;
  const labels = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
  const colors = ['', '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#2b6cb0'];
  return { score, label: labels[score] ?? '', color: colors[score] ?? '#ccc', rules };
}

export function ProfilePage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(user?.username ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  const [adminEmail, setAdminEmail] = useState('');
  const [adminRole, setAdminRole] = useState<UserRole>('STUDENT');
  const [adminFullName, setAdminFullName] = useState('');
  const [adminSaving, setAdminSaving] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const strength = newPassword ? checkStrength(newPassword) : null;
  const confirmMatch = confirmPassword.length > 0 && confirmPassword === newPassword;
  const confirmMismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;

  useEffect(() => {
    if (!user) return;
    const stored = localStorage.getItem(AVATAR_KEY + user.userId);
    if (stored) setAvatarSrc(stored);
    fetchUserById(user.userId)
      .then((u: UserSummary) => {
        setFullName(u.fullName);
        if (isAdmin) { setAdminEmail(u.email); setAdminFullName(u.fullName); setAdminRole(u.role); }
      })
      .catch(() => {});
  }, [user, isAdmin]);

  const showToast = (msg: string, error = false) => {
    setToast({ msg, error });
    window.setTimeout(() => setToast(null), 4000);
  };

  const handleAvatarChange = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      localStorage.setItem(AVATAR_KEY + user.userId, result);
      setAvatarSrc(result);
      showToast('Profile picture updated!');
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    if (!user) return;
    localStorage.removeItem(AVATAR_KEY + user.userId);
    setAvatarSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Profile picture removed.');
  };

  const handleNameSave = async () => {
    if (!user || !fullName.trim()) return;
    setSaving(true);
    try {
      await updateUserProfile(user.userId, { fullName });
      showToast('Display name saved!');
    } catch (err) {
      const msg = isAxiosError<{ message?: string }>(err)
        ? (err.response?.data?.message ?? 'Failed to save name.')
        : 'Failed to save name.';
      showToast(msg, true);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!user) return;
    if (!currentPassword) { showToast('Enter your current password.', true); return; }
    if (newPassword.length < 8) { showToast('New password must be at least 8 characters.', true); return; }
    if (newPassword !== confirmPassword) { showToast('Passwords do not match.', true); return; }
    if (strength && strength.score < 3) { showToast('Password is too weak — follow the checklist.', true); return; }
    setSaving(true);
    try {
      await updateUserProfile(user.userId, {
        fullName,
        currentPassword,
        newPassword,
      });
      showToast(`✅ Password changed! A confirmation notification will be sent to ${user.email}`);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = isAxiosError<{ message?: string }>(err)
        ? (err.response?.data?.message ?? 'Failed to update password.')
        : 'Failed to update password.';
      showToast(msg, true);
    } finally {
      setSaving(false);
    }
  };

  const handleAdminSave = async () => {
    if (!user) return;
    setAdminSaving(true);
    try {
      await updateUserAdmin(user.userId, { email: adminEmail, fullName: adminFullName, role: adminRole });
      showToast('Account settings updated!');
    } catch {
      showToast('Failed to update account settings.', true);
    } finally {
      setAdminSaving(false);
    }
  };

  if (!user) return null;

  const fieldRow = { display: 'flex', flexDirection: 'column' as const, gap: '0.35rem' };

  return (
    <div className="page-grid">
      <section className="hero-card dashboard-hero">
        <p className="eyebrow">Account</p>
        <h2>Your Profile</h2>
        <p>Manage your personal details, profile picture, and password.</p>
      </section>

      {toast ? <ToastMessage message={toast.msg} /> : null}

      {/* ── Avatar ── */}
      <SectionCard title="Profile Picture">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <AvatarCircle name={fullName || user.username} src={avatarSrc} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            <button className="primary-button" type="button" onClick={() => fileInputRef.current?.click()}>
              Upload photo
            </button>
            {avatarSrc
              ? <button className="ghost-button" type="button" onClick={removeAvatar}>Remove photo</button>
              : null}
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
              JPG, PNG or GIF — stored locally in browser
            </p>
          </div>
        </div>
      </SectionCard>

      {/* ── Personal details ── */}
      <SectionCard title="Personal Details">
        <div style={{ display: 'grid', gap: '1.25rem', maxWidth: '440px' }}>
          <div style={fieldRow}>
            <label className="field-label" htmlFor="email">Email</label>
            <input id="email" className="field-input" type="email" value={user.email} disabled
              style={{ opacity: 0.55, cursor: 'not-allowed', background: 'var(--surface-muted)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>Contact an admin to change your email.</span>
          </div>
          <div style={fieldRow}>
            <label className="field-label" htmlFor="role">Role</label>
            <input id="role" className="field-input" type="text" value={user.role} disabled
              style={{ opacity: 0.55, cursor: 'not-allowed', background: 'var(--surface-muted)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>Roles are assigned by an administrator.</span>
          </div>
          <div style={fieldRow}>
            <label className="field-label" htmlFor="fullName">Display name</label>
            <input id="fullName" className="field-input" type="text" value={fullName}
              onChange={(e) => setFullName(e.target.value)} maxLength={120} />
          </div>
          <div style={{ justifySelf: 'start' as const }}>
            <button
              className="primary-button"
              type="button"
              disabled={saving || !fullName.trim()}
              onClick={() => void handleNameSave()}
            >
              {saving ? 'Saving…' : 'Save name'}
            </button>
          </div>
        </div>
      </SectionCard>

      {/* ── Change Password ── separate card ── */}
      <SectionCard title="Change Password">
        <div style={{ display: 'grid', gap: '1.25rem', maxWidth: '440px' }}>

          {/* Current password */}
          <div style={fieldRow}>
            <label className="field-label" htmlFor="currentPwd">Current password</label>
            <input
              id="currentPwd"
              className="field-input"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter your current password"
            />
          </div>

          {/* New password + strength */}
          <div style={fieldRow}>
            <label className="field-label" htmlFor="newPwd">New password</label>
            <input
              id="newPwd"
              className="field-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Leave blank to keep current"
            />

            {/* Always-visible requirements checklist */}
            <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'var(--surface-muted)', borderRadius: '8px', display: 'grid', gap: '0.3rem' }}>
              {strength ? (
                <>
                  {/* Strength bar */}
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} style={{ flex: 1, height: '5px', borderRadius: '4px', background: i <= strength.score ? strength.color : 'var(--border)', transition: 'background 0.25s' }} />
                    ))}
                  </div>
                  <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: strength.color, fontWeight: 700 }}>
                    {strength.label}
                  </p>
                  {strength.rules.map((r) => (
                    <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: r.passed ? '#38a169' : 'var(--ink-muted)', fontWeight: r.passed ? 600 : 400 }}>
                      <span style={{ fontSize: '0.9rem' }}>{r.passed ? '✓' : '○'}</span>
                      <span style={{ textDecoration: r.passed ? 'none' : 'none' }}>{r.label}</span>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <p style={{ margin: '0 0 4px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--ink-muted)' }}>
                    Password must include:
                  </p>
                  {[
                    'At least 8 characters',
                    'One uppercase letter (A–Z)',
                    'One lowercase letter (a–z)',
                    'One number (0–9)',
                    'One special character (!@#$…)',
                  ].map((h) => (
                    <div key={h} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                      <span>○</span><span>{h}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Confirm password — only shown when new password typed */}
          {newPassword ? (
            <div style={fieldRow}>
              <label className="field-label" htmlFor="confirmPwd" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Confirm new password
                {confirmMatch && <span style={{ color: '#38a169', fontWeight: 700, fontSize: '0.82rem' }}>✓ Passwords match</span>}
                {confirmMismatch && <span style={{ color: '#e53e3e', fontWeight: 700, fontSize: '0.82rem' }}>✗ Does not match</span>}
              </label>
              <input
                id="confirmPwd"
                className="field-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Re-enter new password"
                style={{
                  borderColor: confirmMismatch ? '#e53e3e' : confirmMatch ? '#38a169' : undefined,
                  outlineColor: confirmMismatch ? '#e53e3e' : confirmMatch ? '#38a169' : undefined,
                }}
              />
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              className="primary-button"
              type="button"
              disabled={
                saving ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                confirmMismatch ||
                (strength !== null && strength.score < 3)
              }
              onClick={() => void handlePasswordSave()}
            >
              {saving ? 'Saving…' : 'Update password'}
            </button>
            {currentPassword || newPassword || confirmPassword ? (
              <button
                className="ghost-button"
                type="button"
                onClick={() => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}
              >
                Clear
              </button>
            ) : null}
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
            A confirmation notification will be sent to <strong>{user.email}</strong> after a successful change.
          </p>
        </div>
      </SectionCard>

      {/* ── Admin-only section ── */}
      {isAdmin ? (
        <SectionCard title="Admin Account Settings">
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.88rem', color: 'var(--ink-muted)', padding: '0.6rem 0.85rem', background: 'var(--surface-muted)', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
            🔒 These settings are reserved for admins. Changes take effect immediately.
          </p>
          <div style={{ display: 'grid', gap: '1.25rem', maxWidth: '440px' }}>
            <div style={fieldRow}>
              <label className="field-label" htmlFor="adminFullName">Full name</label>
              <input id="adminFullName" className="field-input" type="text" value={adminFullName}
                onChange={(e) => setAdminFullName(e.target.value)} maxLength={120} />
            </div>
            <div style={fieldRow}>
              <label className="field-label" htmlFor="adminEmail">Email</label>
              <input id="adminEmail" className="field-input" type="email" value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)} />
            </div>
            <div style={fieldRow}>
              <label className="field-label" htmlFor="adminRole">Role</label>
              <select id="adminRole" className="field-input" value={adminRole}
                onChange={(e) => setAdminRole(e.target.value as UserRole)}>
                {ALL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ justifySelf: 'start' as const }}>
              <button className="primary-button" type="button" disabled={adminSaving}
                onClick={() => void handleAdminSave()}>
                {adminSaving ? 'Saving…' : 'Update account'}
              </button>
            </div>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
