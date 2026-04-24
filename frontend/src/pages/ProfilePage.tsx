import { useEffect, useRef, useState } from 'react';
import { fetchUserById, updateUserAdmin, updateUserProfile } from '../api/authApi';
import type { UserRole } from '../api/types';
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
    <div
      style={{
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        overflow: 'hidden',
        background: 'var(--accent-soft)',
        border: '3px solid var(--accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {src ? (
        <img src={src} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>{initials(name)}</span>
      )}
    </div>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(user?.username ?? '');
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

  useEffect(() => {
    if (!user) return;
    const stored = localStorage.getItem(AVATAR_KEY + user.userId);
    if (stored) setAvatarSrc(stored);

    fetchUserById(user.userId)
      .then((u) => {
        setFullName(u.fullName);
        if (isAdmin) {
          setAdminEmail(u.email);
          setAdminFullName(u.fullName);
          setAdminRole(u.role);
        }
      })
      .catch(() => {});
  }, [user, isAdmin]);

  const showToast = (msg: string, error = false) => {
    setToast({ msg, error });
    window.setTimeout(() => setToast(null), 3000);
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
    if (newPassword && newPassword !== confirmPassword) {
      showToast('Passwords do not match.', true);
      return;
    }
    if (newPassword && newPassword.length < 6) {
      showToast('Password must be at least 6 characters.', true);
      return;
    }
    setSaving(true);
    try {
      await updateUserProfile(user.userId, {
        fullName,
        newPassword: newPassword || undefined,
      });
      setNewPassword('');
      setConfirmPassword('');
      showToast('Profile saved successfully!');
    } catch {
      showToast('Failed to save profile.', true);
    } finally {
      setSaving(false);
    }
  };

  const handleAdminSave = async () => {
    if (!user) return;
    setAdminSaving(true);
    try {
      await updateUserAdmin(user.userId, {
        email: adminEmail,
        fullName: adminFullName,
        role: adminRole,
      });
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

      {toast ? (
        <ToastMessage message={toast.msg} />
      ) : null}

      {/* ── Avatar ── */}
      <SectionCard title="Profile Picture">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <AvatarCircle name={fullName || user.username} src={avatarSrc} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
            <button
              className="primary-button"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload photo
            </button>
            {avatarSrc ? (
              <button className="ghost-button" type="button" onClick={removeAvatar}>
                Remove photo
              </button>
            ) : null}
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
              JPG, PNG or GIF · stored locally in browser
            </p>
          </div>
        </div>
      </SectionCard>

      {/* ── Personal details ── */}
      <SectionCard title="Personal Details">
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '420px' }}>
          <div>
            <label className="field-label" htmlFor="email">Email (read-only)</label>
            <input
              id="email"
              className="field-input"
              type="email"
              value={user.email}
              disabled
              style={{ opacity: 0.6 }}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="role">Role (read-only)</label>
            <input
              id="role"
              className="field-input"
              type="text"
              value={user.role}
              disabled
              style={{ opacity: 0.6 }}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="fullName">Display name</label>
            <input
              id="fullName"
              className="field-input"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={120}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="newPwd">New password (leave blank to keep current)</label>
            <input
              id="newPwd"
              className="field-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          {newPassword ? (
            <div>
              <label className="field-label" htmlFor="confirmPwd">Confirm new password</label>
              <input
                id="confirmPwd"
                className="field-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          ) : null}
          <button
            className="primary-button"
            type="button"
            disabled={saving || !fullName.trim()}
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
              <input
                id="adminFullName"
                className="field-input"
                type="text"
                value={adminFullName}
                onChange={(e) => setAdminFullName(e.target.value)}
                maxLength={120}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="adminEmail">Email</label>
              <input
                id="adminEmail"
                className="field-input"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="adminRole">Role</label>
              <select
                id="adminRole"
                className="field-input"
                value={adminRole}
                onChange={(e) => setAdminRole(e.target.value as UserRole)}
              >
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <button
              className="primary-button"
              type="button"
              disabled={adminSaving}
              onClick={() => void handleAdminSave()}
              style={{ justifySelf: 'start' }}
            >
              {adminSaving ? 'Saving…' : 'Update account'}
            </button>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
