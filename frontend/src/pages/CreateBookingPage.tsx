import { useNavigate } from 'react-router-dom';
import { BookingForm } from '../components/BookingForm';
import { useAuth } from '../hooks/useAuth';

export function CreateBookingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role === 'ADMIN' || user.role === 'TECHNICIAN') {
    return (
      <section className="section-card form-card">
        <header className="section-card__header">
          <h2>Book Resource</h2>
        </header>
        <p className="error-text">Your role is not allowed to create bookings.</p>
      </section>
    );
  }

  return (
    <BookingForm
      onSuccess={() => {
        navigate('/bookings');
      }}
    />
  );
}
