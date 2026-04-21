import { apiClient } from './client';
import type {
  AssignTicketRequest,
  CreateCommentRequest,
  CreateTicketRequest,
  RejectTicketRequest,
  ResolveTicketRequest,
  Ticket,
  TicketActionRequest,
  TicketComment,
  UpdateCommentRequest,
  UpdateTicketDetailsRequest,
} from './types';

export async function fetchTickets(): Promise<Ticket[]> {
  const { data } = await apiClient.get<Ticket[]>('/tickets');
  return data;
}

export async function fetchTicketById(ticketId: string): Promise<Ticket> {
  const { data } = await apiClient.get<Ticket>(`/tickets/${ticketId}`);
  return data;
}

export async function createTicket(payload: CreateTicketRequest): Promise<Ticket> {
  const { data } = await apiClient.post<Ticket>('/tickets', payload);
  return data;
}

export async function updateTicketDetails(
  ticketId: string,
  payload: UpdateTicketDetailsRequest,
): Promise<Ticket> {
  const { data } = await apiClient.put<Ticket>(`/tickets/${ticketId}/details`, payload);
  return data;
}

export async function assignTicket(
  ticketId: string,
  payload: AssignTicketRequest,
): Promise<Ticket> {
  const { data } = await apiClient.put<Ticket>(`/tickets/${ticketId}/assign`, payload);
  return data;
}

export async function startTicketWork(
  ticketId: string,
  payload: TicketActionRequest,
): Promise<Ticket> {
  const { data } = await apiClient.put<Ticket>(`/tickets/${ticketId}/start`, payload);
  return data;
}

export async function resolveTicket(
  ticketId: string,
  payload: ResolveTicketRequest,
): Promise<Ticket> {
  const { data } = await apiClient.put<Ticket>(`/tickets/${ticketId}/resolve`, payload);
  return data;
}

export async function closeTicket(ticketId: string, payload: TicketActionRequest): Promise<Ticket> {
  const { data } = await apiClient.put<Ticket>(`/tickets/${ticketId}/close`, payload);
  return data;
}

export async function rejectTicket(
  ticketId: string,
  payload: RejectTicketRequest,
): Promise<Ticket> {
  const { data } = await apiClient.put<Ticket>(`/tickets/${ticketId}/reject`, payload);
  return data;
}

export async function reopenTicket(
  ticketId: string,
  payload: TicketActionRequest,
): Promise<Ticket> {
  const { data } = await apiClient.put<Ticket>(`/tickets/${ticketId}/reopen`, payload);
  return data;
}

export async function fetchTicketComments(ticketId: string): Promise<TicketComment[]> {
  const { data } = await apiClient.get<TicketComment[]>(`/comments/ticket/${ticketId}`);
  return data;
}

export async function createTicketComment(
  ticketId: string,
  payload: CreateCommentRequest,
): Promise<TicketComment> {
  const { data } = await apiClient.post<TicketComment>(`/comments/ticket/${ticketId}`, payload);
  return data;
}

export async function updateTicketComment(
  commentId: string,
  payload: UpdateCommentRequest,
): Promise<TicketComment> {
  const { data } = await apiClient.put<TicketComment>(`/comments/${commentId}`, payload);
  return data;
}

export async function deleteTicketComment(commentId: string, actorUserId: string): Promise<void> {
  await apiClient.delete(`/comments/${commentId}`, { params: { actorUserId } });
}
