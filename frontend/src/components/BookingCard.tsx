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
    <article className="booking-card">
      <div className="booking-card__main">
        <p>📍 {resourceName}</p>
        <p>📅 {formatDate(booking.startTime)}</p>
        <p>⏰ {formatTimeRange(booking.startTime, booking.endTime)}</p>
        <p>👤 {requesterName}</p>
        <div className="booking-card__status-row">
          <span>📊 Status:</span>
          <StatusBadge value={booking.status} />
        </div>
        <p>📝 {booking.purpose?.trim() || 'No purpose provided'}</p>
        <p>👥 {booking.attendeeCount ?? 1} attendees</p>
      </div>

      <div className="booking-card__actions">
        {canModerate && booking.status === 'PENDING' ? (
          <>
            <button
              className="ghost-button"
              disabled={actionLoading}
              onClick={() => onApprove(booking.id)}
              type="button"
            >
              Approve
            </button>
            <button
              className="ghost-button"
              disabled={actionLoading}
              onClick={() => onReject(booking.id)}
              type="button"
            >
              Reject
            </button>
          </>
        ) : null}

        {canCancel ? (
          <button
            className="ghost-button"
            disabled={
              actionLoading || booking.status === 'CANCELLED' || booking.status === 'REJECTED'
            }
            onClick={() => onCancel(booking.id)}
            type="button"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </article>
  );
}
