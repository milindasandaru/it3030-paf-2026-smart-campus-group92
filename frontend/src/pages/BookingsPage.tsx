import { Link } from 'react-router-dom';
import { BookingFilters } from '../components/BookingFilters';
import { BookingList } from '../components/BookingList';
import { SectionCard } from '../components/SectionCard';
import { useBookings } from '../hooks/useBookings';

export function BookingsPage() {
  const {
    loading,
    actionLoading,
    error,
    toast,
    filters,
    resources,
    visibleBookings,
    canModerate,
    canCreateBooking,
    setFilter,
    approve,
    reject,
    cancel,
    canCancelBooking,
  } = useBookings();

  return (
    <div className="page-grid">
      <SectionCard
        title="Booking Management"
        action={
          canCreateBooking ? (
            <Link className="primary-button" to="/bookings/new">
              Book Resource
            </Link>
          ) : null
        }
      >
        <p>
          {canModerate
            ? 'Review and manage all booking requests.'
            : 'Track your booking requests and manage upcoming reservations.'}
        </p>
        {toast ? <p className="success-text">{toast}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
      </SectionCard>

      <BookingFilters filters={filters} onChange={setFilter} resources={resources} />

      <SectionCard title="Bookings">
        <BookingList
          actionLoading={actionLoading}
          bookings={visibleBookings}
          canCancelBooking={canCancelBooking}
          canModerate={canModerate}
          loading={loading}
          onApprove={(id) => {
            void approve(id);
          }}
          onCancel={(id) => {
            void cancel(id);
          }}
          onReject={(id) => {
            void reject(id);
          }}
        />
      </SectionCard>
    </div>
  );
}
