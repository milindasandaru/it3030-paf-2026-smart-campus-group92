import type { Booking } from '../api/types';
import type { BookingView } from '../hooks/useBookings';
import { BookingCard } from './BookingCard';

interface BookingListProps {
  bookings: BookingView[];
  loading: boolean;
  actionLoading: boolean;
  canModerate: boolean;
  canCancelBooking: (booking: Booking) => boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onCancel: (id: string) => void;
}

export function BookingList({
  bookings,
  loading,
  actionLoading,
  canModerate,
  canCancelBooking,
  onApprove,
  onReject,
  onCancel,
}: BookingListProps) {
  if (loading) {
    return <p>Loading bookings...</p>;
  }

  if (bookings.length === 0) {
    return <p className="empty-state">No bookings found.</p>;
  }

  return (
    <div className="booking-list-grid">
      {bookings.map((booking) => (
        <BookingCard
          actionLoading={actionLoading}
          booking={booking}
          canCancel={canCancelBooking(booking)}
          canModerate={canModerate}
          key={booking.id}
          onApprove={onApprove}
          onCancel={onCancel}
          onReject={onReject}
        />
      ))}
    </div>
  );
}
