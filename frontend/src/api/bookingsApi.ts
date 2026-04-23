import { apiClient } from './client';
import type { Booking, BookingCreateRequest, BookingQueryFilters } from './types';

export async function getBookings(filters?: BookingQueryFilters): Promise<Booking[]> {
  const { data } = await apiClient.get<Booking[]>('/bookings', {
    params: filters,
  });
  return data;
}

export async function createBooking(payload: BookingCreateRequest): Promise<Booking> {
  const { data } = await apiClient.post<Booking>('/bookings', payload);
  return data;
}

export async function approveBooking(id: string, actorUserId: string): Promise<Booking> {
  const { data } = await apiClient.put<Booking>(`/bookings/${id}/approve`, null, {
    params: { actorUserId },
  });
  return data;
}

export async function rejectBooking(id: string, actorUserId: string): Promise<Booking> {
  const { data } = await apiClient.put<Booking>(`/bookings/${id}/reject`, null, {
    params: { actorUserId },
  });
  return data;
}

export async function cancelBooking(id: string, actorUserId: string): Promise<Booking> {
  const { data } = await apiClient.put<Booking>(`/bookings/${id}/cancel`, null, {
    params: { actorUserId },
  });
  return data;
}
