import { apiClient } from './client';

export interface TopResourcePoint {
  resourceName: string;
  bookingCount: number;
}

export interface PeakHourPoint {
  hourOfDay: number;
  bookingCount: number;
}

export interface BookingTrendPoint {
  bookingDate: string;
  bookingCount: number;
}

export interface TicketStatusPoint {
  status: string;
  ticketCount: number;
}

export async function getTopResources(): Promise<TopResourcePoint[]> {
  const { data } = await apiClient.get<TopResourcePoint[]>('/analytics/top-resources');
  return data;
}

export async function getPeakHours(): Promise<PeakHourPoint[]> {
  const { data } = await apiClient.get<PeakHourPoint[]>('/analytics/peak-hours');
  return data;
}

export async function getBookingTrends(): Promise<BookingTrendPoint[]> {
  const { data } = await apiClient.get<BookingTrendPoint[]>('/analytics/booking-trends');
  return data;
}

export async function getTicketStatusDistribution(): Promise<TicketStatusPoint[]> {
  const { data } = await apiClient.get<TicketStatusPoint[]>('/analytics/ticket-status');
  return data;
}

export async function downloadBookingReport(params?: {
  from?: string;
  to?: string;
  resourceId?: string;
  format?: 'json' | 'csv';
}): Promise<Blob> {
  const { data } = await apiClient.get('/reports/bookings', {
    params,
    responseType: 'blob',
  });
  return data;
}
