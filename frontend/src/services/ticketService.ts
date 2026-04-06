import { fetchTickets } from '../api/ticketsApi';

export const ticketService = {
  list: fetchTickets,
};
