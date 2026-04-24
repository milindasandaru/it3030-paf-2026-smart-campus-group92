import { AxiosError } from 'axios';
import { apiClient } from './client';
import type {
  AssignTicketRequest,
  CreateCommentRequest,
  CreateTicketRequest,
  RejectTicketRequest,
  ResolveTicketRequest,
  Ticket,
  TicketActionRequest,
  TicketAttachment,
  TicketComment,
  UpdateCommentRequest,
} from './types';

function isNotFound(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 404;
}

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

// export async function fetchTicketComments(ticketId: string): Promise<TicketComment[]> {
//   try {
//     const { data } = await apiClient.get<TicketComment[]>(`/tickets/${ticketId}/comments`);
//     return data;
//   } catch (error) {
//     if (!isNotFound(error)) {
//       throw error;
//     }
//     const { data } = await apiClient.get<TicketComment[]>(`/comments/ticket/${ticketId}`);
//     return data;
//   }
// }

export async function fetchTicketComments(ticketId: string) {
  const { data } = await apiClient.get(`/comments/ticket/${ticketId}`);
  return data;
}

export async function createTicketComment(
  ticketId: string,
  payload: CreateCommentRequest,
): Promise<TicketComment> {
  try {
    const { data } = await apiClient.post<TicketComment>(`/tickets/${ticketId}/comments`, payload);
    return data;
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
    const { data } = await apiClient.post<TicketComment>(`/comments/ticket/${ticketId}`, payload);
    return data;
  }
}

export async function updateTicketComment(
  ticketId: string,
  commentId: string,
  payload: UpdateCommentRequest,
): Promise<TicketComment> {
  try {
    const { data } = await apiClient.put<TicketComment>(
      `/tickets/${ticketId}/comments/${commentId}`,
      payload,
    );
    return data;
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
    const { data } = await apiClient.put<TicketComment>(`/comments/${commentId}`, payload);
    return data;
  }
}

export async function deleteTicketComment(
  ticketId: string,
  commentId: string,
  actorUserId: string,
): Promise<void> {
  try {
    await apiClient.delete(`/tickets/${ticketId}/comments/${commentId}`, {
      params: { actorUserId },
    });
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
    await apiClient.delete(`/comments/${commentId}`, { params: { actorUserId } });
  }
}

export async function fetchTicketAttachments(ticketId: string): Promise<TicketAttachment[]> {
  const { data } = await apiClient.get<TicketAttachment[]>(`/tickets/${ticketId}/attachments`);
  return data;
}

export async function uploadTicketAttachments(
  ticketId: string,
  actorUserId: string,
  files: File[],
): Promise<TicketAttachment[]> {
  const formData = new FormData();
  formData.append('actorUserId', actorUserId);
  files.forEach((file) => formData.append('files', file));

  const { data } = await apiClient.post<TicketAttachment[]>(
    `/tickets/${ticketId}/attachments`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return data;
}

export async function deleteTicketAttachment(
  ticketId: string,
  attachmentId: string,
  actorUserId: string,
): Promise<void> {
  await apiClient.delete(`/tickets/${ticketId}/attachments/${attachmentId}`, {
    params: { actorUserId },
  });
}
