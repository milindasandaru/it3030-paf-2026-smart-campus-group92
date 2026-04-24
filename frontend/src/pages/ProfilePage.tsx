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

interface StrengthResult { score: number; label: string; color: string; hints: string[] }
function checkStrength(pwd: string): StrengthResult {
  const hints: string[] = [];
  if (pwd.length < 8)  hints.push('At least 8 characters');
  if (!/[A-Z]/.test(pwd)) hints.push('One uppercase letter (A–Z)');
  if (!/[a-z]/.test(pwd)) hints.push('One lowercase letter (a–z)');
  if (!/[0-9]/.test(pwd)) hints.push('One number (0–9)');
  if (!/[^A-Za-z0-9]/.test(pwd)) hints.push('One special character (!@#$…)');
  const score = 5 - hints.length;
  const labels = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
  const colors = ['', '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#2b6cb0'];
  return { score, label: labels[score] ?? '', color: colors[score] ?? '#ccc', hints };
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

  const handleProfileSave = async () => {
    if (!user) return;
    if (newPassword) {
      if (!currentPassword) { showToast('Enter your current password to set a new one.', true); return; }
      if (newPassword.length < 8) { showToast('New password must be at least 8 characters.', true); return; }
      if (newPassword !== confirmPassword) { showToast('Passwords do not match.', true); return; }
      if (strength && strength.score < 3) { showToast('Password is too weak. Follow the hints below.', true); return; }
    }
    setSaving(true);
    try {
      await updateUserProfile(user.userId, {
        fullName,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      if (newPassword) {
        showToast(`✅ Password changed! A confirmation email has been sent to ${user.email}`);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast('Profile saved successfully!');
      }
    } catch (err) {
      const msg = isAxiosError<{ message?: string }>(err)
        ? (err.response?.data?.message ?? 'Failed to save profile.')
        : 'Failed to save profile.';
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <AvatarCircle name={fullName || user.username} src={avatarSrc} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            <button className="primary-button" type="button" onClick={() => fileInputRef.current?.click()}>Upload photo</button>
            {avatarSrc ? <button className="ghost-button" type="button" onClick={removeAvatar}>Remove photo</button> : null}
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--ink-muted)' }}>JPG, PNG or GIF · stored locally in browser</p>
          </div>
        </div>
      </SectionCard>

      {/* ── Personal details ── */}
      <SectionCard title="Personal Details">
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '440px' }}>
          <div>
            <label className="field-label" htmlFor="email">Email (read-only)</label>
            <input id="email" className="field-input" type="email" value={user.email} disabled style={{ opacity: 0.6 }} />
          </div>
          <div>
            <label className="field-label" htmlFor="role">Role (read-only)</label>
            <input id="role" className="field-input" type="text" value={user.role} disabled style={{ opacity: 0.6 }} />
          </div>
          <div>
            <label className="field-label" htmlFor="fullName">Display name</label>
            <input id="fullName" className="field-input" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120} />
          </div>

          {/* ── Change password section ── */}
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.25rem 0' }} />
          <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink)' }}>Change Password</p>

          <div>
            <label className="field-label" htmlFor="currentPwd">Current password</label>
            <input
              id="currentPwd"
              className="field-input"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Required to set a new password"
            />
          </div>

          <div>
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
            {/* Strength meter */}
            {strength ? (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} style={{ flex: 1, height: '4px', borderRadius: '4px', background: i <= strength.score ? strength.color : 'var(--border)', transition: 'background 0.2s' }} />
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: strength.color, fontWeight: 600 }}>{strength.label}</p>
                {strength.hints.length > 0 ? (
                  <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                    {strength.hints.map((h) => <li key={h}>{h}</li>)}
                  </ul>
                ) : (
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#38a169' }}>✓ All requirements met</p>
                )}
              </div>
            ) : (
              <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                Min. 8 chars · uppercase · lowercase · number · special character
              </p>
            )}
          </div>

          {newPassword ? (
            <div>
              <label className="field-label" htmlFor="confirmPwd">
                Confirm new password{' '}
                {confirmMatch && <span style={{ color: '#38a169', fontWeight: 600 }}>✓ match</span>}
                {confirmMismatch && <span style={{ color: '#e53e3e', fontWeight: 600 }}>✗ mismatch</span>}
              </label>
              <input
                id="confirmPwd"
                className="field-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                style={{ borderColor: confirmMismatch ? '#e53e3e' : confirmMatch ? '#38a169' : undefined }}
              />
            </div>
          ) : null}

          <button
            className="primary-button"
            type="button"
            disabled={saving || !fullName.trim() || (newPassword.length > 0 && (confirmMismatch || !confirmPassword))}
            onClick={() => void handleProfileSave()}
            style={{ justifySelf: 'start' }}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </SectionCard>

      {/* ── Admin-only section ── */}
      {isAdmin ? (
        <SectionCard title="Admin Account Settings">
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.88rem', marginTop: 0 }}>
            Only admins can change email and role assignments.
          </p>
          <div style={{ display: 'grid', gap: '1rem', maxWidth: '420px' }}>
            <div>
              <label className="field-label" htmlFor="adminFullName">Full name</label>
              <input id="adminFullName" className="field-input" type="text" value={adminFullName} onChange={(e) => setAdminFullName(e.target.value)} maxLength={120} />
            </div>
            <div>
              <label className="field-label" htmlFor="adminEmail">Email</label>
              <input id="adminEmail" className="field-input" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
            </div>
            <div>
              <label className="field-label" htmlFor="adminRole">Role</label>
              <select id="adminRole" className="field-input" value={adminRole} onChange={(e) => setAdminRole(e.target.value as UserRole)}>
                {ALL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button className="primary-button" type="button" disabled={adminSaving} onClick={() => void handleAdminSave()} style={{ justifySelf: 'start' }}>
              {adminSaving ? 'Saving…' : 'Update account'}
            </button>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
