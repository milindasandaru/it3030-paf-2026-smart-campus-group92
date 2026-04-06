import { apiClient } from './client';
import type { Ticket } from './types';

export async function fetchTickets(): Promise<Ticket[]> {
  const { data } = await apiClient.get<Ticket[]>('/tickets');
  return data;
}
