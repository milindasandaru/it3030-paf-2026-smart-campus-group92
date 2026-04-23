import { apiClient } from './client';
import type { Booking } from './types';

export async function fetchBookings(): Promise<Booking[]> {
  const { data } = await apiClient.get<Booking[]>('/bookings');
  return data;
}


