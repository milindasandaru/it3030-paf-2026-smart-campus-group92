import { fetchBookings } from '../api/bookingsApi';

export const bookingService = {
  list: fetchBookings,
};
