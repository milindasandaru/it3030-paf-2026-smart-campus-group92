import type { BookingView } from '../hooks/useBookings';
import { formatDate } from '../utils/formatDate';
import { StatusBadge } from './StatusBadge';

interface BookingCardProps {
  booking: BookingView;
  canModerate: boolean;
  canCancel: boolean;
  actionLoading?: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onCancel: (id: string) => void;
}

function formatTimeRange(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const formatter = new Intl.DateTimeFormat('en-LK', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export function BookingCard({
  booking,
  canModerate,
  canCancel,
  actionLoading = false,
  onApprove,
  onReject,
  onCancel,
}: BookingCardProps) {
  const resourceName = booking.resource?.name ?? 'Unknown resource';
  const requesterName = booking.requester?.fullName ?? 'Unknown requester';

  return (
    //

    <article className="glass-card">
      <div className="glass-card__header">
        <h3 className="glass-card__title">{resourceName}</h3>
        <StatusBadge value={booking.status} />
      </div>

      <div className="glass-card__body">
        <div className="glass-card__detail">
          <span className="glass-card__label">Date</span>
          <span>{formatDate(booking.startTime)}</span>
        </div>
        <div className="glass-card__detail">
          <span className="glass-card__label">Time</span>
          <span>{formatTimeRange(booking.startTime, booking.endTime)}</span>
        </div>
        <div className="glass-card__detail">
          <span className="glass-card__label">By</span>
          <span>{requesterName}</span>
        </div>
        <div className="glass-card__detail">
          <span className="glass-card__label">Attendees</span>
          <span>{booking.attendeeCount ?? 1}</span>
        </div>
        {booking.purpose?.trim() && <p className="glass-card__purpose">{booking.purpose.trim()}</p>}
      </div>

      <div className="glass-card__actions">
        {canModerate && booking.status === 'PENDING' && (
          <>
            <button
              className="glass-btn glass-btn--approve"
              disabled={actionLoading}
              onClick={() => onApprove(booking.id)}
              type="button"
            >
              Approve
            </button>
            <button
              className="glass-btn glass-btn--reject"
              disabled={actionLoading}
              onClick={() => onReject(booking.id)}
              type="button"
            >
              Reject
            </button>
          </>
        )}
        {canCancel && (
          <button
            className="glass-btn glass-btn--cancel"
            disabled={
              actionLoading || booking.status === 'CANCELLED' || booking.status === 'REJECTED'
            }
            onClick={() => onCancel(booking.id)}
            type="button"
          >
            Cancel
          </button>
        )}
      </div>
    </article>
  );
}
