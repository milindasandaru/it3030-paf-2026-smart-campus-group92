import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchBookings } from '../api/bookingsApi';
import type { Booking } from '../api/types';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate } from '../utils/formatDate';

const fallbackBookings: Booking[] = [
  {
    id: 'b1',
    title: 'AI Society Workshop',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: 'PENDING',
    resourceId: '1',
    resourceName: 'Innovation Lab',
    requesterId: 'u1',
    requesterName: 'A. Perera',
  },
];

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(fallbackBookings);

  useEffect(() => {
    void fetchBookings()
      .then(setBookings)
      .catch(() => setBookings(fallbackBookings));
  }, []);

  return (
    <SectionCard
      title="Booking requests"
      action={
        <Link className="primary-button" to="/bookings/new">
          New booking
        </Link>
      }
    >
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Resource</th>
              <th>Window</th>
              <th>Requester</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.title}</td>
                <td>{booking.resourceName}</td>
                <td>
                  {formatDate(booking.startTime)} to {formatDate(booking.endTime)}
                </td>
                <td>{booking.requesterName}</td>
                <td>
                  <StatusBadge value={booking.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}


