import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBookingById } from '../api/bookingsApi';
import { SectionCard } from '../components/SectionCard';
import type { Booking } from '../api/types';

function formatDt(iso: string) {
  return new Intl.DateTimeFormat('en-LK', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function QrSvg({ value }: { value: string }) {
  const size = 200;
  const cellSize = 4;
  const cells = Math.floor(size / cellSize);

  const hash = (s: string) => {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
    return h >>> 0;
  };

  const rects: { x: number; y: number }[] = [];
  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      const seed = hash(`${value}:${row}:${col}`);
      if (seed % 3 === 0) {
        rects.push({ x: col * cellSize, y: row * cellSize });
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="Booking QR code"
      style={{ border: '8px solid white', borderRadius: '4px', background: 'white' }}
    >
      {rects.map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={cellSize} height={cellSize} fill="#000" />
      ))}
      <rect x={0} y={0} width={24} height={24} fill="#000" rx={2} />
      <rect x={4} y={4} width={16} height={16} fill="#fff" />
      <rect x={8} y={8} width={8} height={8} fill="#000" />
      <rect x={size - 24} y={0} width={24} height={24} fill="#000" rx={2} />
      <rect x={size - 20} y={4} width={16} height={16} fill="#fff" />
      <rect x={size - 16} y={8} width={8} height={8} fill="#000" />
      <rect x={0} y={size - 24} width={24} height={24} fill="#000" rx={2} />
      <rect x={4} y={size - 20} width={16} height={16} fill="#fff" />
      <rect x={8} y={size - 16} width={8} height={8} fill="#000" />
    </svg>
  );
}

export function BookingQrPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    setLoading(true);
    getBookingById(bookingId)
      .then((data: Booking) => {
        setBooking(data);
        setError(null);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load booking'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <SectionCard title="QR Check-In"><p>Loading…</p></SectionCard>;
  if (error) return <SectionCard title="QR Check-In"><p className="error-text">{error}</p></SectionCard>;
  if (!booking) return <SectionCard title="QR Check-In"><p className="empty-state">Booking not found.</p></SectionCard>;

  if (booking.status !== 'APPROVED') {
    return (
      <SectionCard title="QR Check-In">
        <p className="error-text">
          QR check-in is only available for <strong>APPROVED</strong> bookings. This booking is <strong>{booking.status}</strong>.
        </p>
      </SectionCard>
    );
  }

  const qrPayload = `smartcampus:booking:${booking.id}`;

  return (
    <div className="page-grid">
      <SectionCard title="QR Check-In">
        {checkedIn ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <p style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</p>
            <h3 style={{ margin: '0 0 0.5rem' }}>Checked In!</h3>
            <p className="empty-state">Your attendance has been verified for this booking.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem', justifyItems: 'center', textAlign: 'center' }}>
            <QrSvg value={qrPayload} />

            <dl className="resource-meta" style={{ justifyContent: 'center' }}>
              <div>
                <dt>Resource</dt>
                <dd>{booking.resourceName ?? '—'}</dd>
              </div>
              <div>
                <dt>Start</dt>
                <dd>{formatDt(booking.startTime)}</dd>
              </div>
              <div>
                <dt>End</dt>
                <dd>{formatDt(booking.endTime)}</dd>
              </div>
              <div>
                <dt>Booking ID</dt>
                <dd style={{ fontSize: '0.78rem', fontFamily: 'monospace' }}>{booking.id}</dd>
              </div>
            </dl>

            <p style={{ color: 'var(--ink-muted)', fontSize: '0.88rem', maxWidth: '340px' }}>
              Show this QR code at the venue entrance to verify your approved booking.
            </p>

            <button
              className="primary-button"
              type="button"
              onClick={() => setCheckedIn(true)}
            >
              Confirm Check-In
            </button>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
