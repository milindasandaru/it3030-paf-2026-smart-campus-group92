import { useEffect, useState } from 'react';
import { getBookings } from '../api/bookingsApi';
import { fetchTickets } from '../api/ticketApi';
import type { Booking, Ticket } from '../api/types';

interface DashboardSnapshot {
  bookings: Booking[];
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
}

export function useDashboardSnapshot(): DashboardSnapshot {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSnapshot() {
      setLoading(true);
      try {
        const [bookingData, ticketData] = await Promise.all([getBookings(), fetchTickets()]);
        if (!active) {
          return;
        }
        setBookings(bookingData);
        setTickets(ticketData);
        setError(null);
      } catch (err) {
        if (!active) {
          return;
        }
        setBookings([]);
        setTickets([]);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSnapshot();

    return () => {
      active = false;
    };
  }, []);

  return { bookings, tickets, loading, error };
}
