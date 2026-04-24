import { useEffect, useState } from 'react';
import { SectionCard } from '../components/SectionCard';
import { ToastMessage } from '../components/ToastMessage';

type NotifCategory =
  | 'BOOKING_CREATED'
  | 'BOOKING_APPROVED'
  | 'BOOKING_REJECTED'
  | 'TICKET_CREATED'
  | 'TICKET_ASSIGNED'
  | 'TICKET_IN_PROGRESS'
  | 'TICKET_RESOLVED'
  | 'TICKET_REJECTED'
  | 'TICKET_CLOSED';

const CATEGORIES: { key: NotifCategory; label: string; description: string }[] = [
  { key: 'BOOKING_CREATED',    label: 'Booking Submitted',    description: 'When a new booking request is created.' },
  { key: 'BOOKING_APPROVED',   label: 'Booking Approved',     description: 'When your booking is approved by an admin.' },
  { key: 'BOOKING_REJECTED',   label: 'Booking Rejected',     description: 'When your booking is rejected with a reason.' },
  { key: 'TICKET_CREATED',     label: 'Ticket Created',       description: 'When a new support ticket is submitted.' },
  { key: 'TICKET_ASSIGNED',    label: 'Ticket Assigned',      description: 'When a ticket is assigned to a technician.' },
  { key: 'TICKET_IN_PROGRESS', label: 'Ticket In Progress',   description: 'When work starts on your ticket.' },
  { key: 'TICKET_RESOLVED',    label: 'Ticket Resolved',      description: 'When your ticket is marked resolved.' },
  { key: 'TICKET_REJECTED',    label: 'Ticket Rejected',      description: 'When your ticket is rejected.' },
  { key: 'TICKET_CLOSED',      label: 'Ticket Closed',        description: 'When your ticket is closed.' },
];

const STORAGE_KEY = 'sc-notif-prefs';

function loadPrefs(): Record<NotifCategory, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Record<NotifCategory, boolean>;
  } catch {
    // ignore
  }
  const defaults: Record<string, boolean> = {};
  CATEGORIES.forEach((c) => { defaults[c.key] = true; });
  return defaults as Record<NotifCategory, boolean>;
}

export function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState<Record<NotifCategory, boolean>>(loadPrefs);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const t = window.setTimeout(() => setSaved(false), 2500);
    return () => window.clearTimeout(t);
  }, [saved]);

  const toggle = (key: NotifCategory) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setSaved(true);
  };

  const enableAll = () => {
    const all: Record<string, boolean> = {};
    CATEGORIES.forEach((c) => { all[c.key] = true; });
    setPrefs(all as Record<NotifCategory, boolean>);
  };

  const disableAll = () => {
    const none: Record<string, boolean> = {};
    CATEGORIES.forEach((c) => { none[c.key] = false; });
    setPrefs(none as Record<NotifCategory, boolean>);
  };

  return (
    <div className="page-grid">
      <section className="hero-card dashboard-hero">
        <p className="eyebrow">Settings</p>
        <h2>Notification Preferences</h2>
        <p>Choose which types of notifications you want to receive.</p>
      </section>

      <SectionCard
        title="Notification Categories"
        action={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="ghost-button" type="button" onClick={enableAll}>Enable all</button>
            <button className="ghost-button" type="button" onClick={disableAll}>Disable all</button>
          </div>
        }
      >
        {saved ? <ToastMessage message="Preferences saved!" /> : null}

        <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.5rem' }}>
          {CATEGORIES.map((cat) => (
            <label
              key={cat.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '0.75rem 1rem',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                background: 'var(--surface-muted)',
                cursor: 'pointer',
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink)' }}>{cat.label}</p>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--ink-muted)' }}>{cat.description}</p>
              </div>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <input
                  type="checkbox"
                  checked={prefs[cat.key]}
                  onChange={() => toggle(cat.key)}
                  style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer', accentColor: 'var(--accent)' }}
                />
              </div>
            </label>
          ))}
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="primary-button" type="button" onClick={save}>
            Save preferences
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
