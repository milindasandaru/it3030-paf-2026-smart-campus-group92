import type { Ticket } from '../api/types';
import { TicketCard } from './TicketCard';

interface TicketListProps {
  tickets: Ticket[];
}

export function TicketList({ tickets }: TicketListProps) {
  if (tickets.length === 0) {
    return <p className="empty-state">No tickets match the current filters.</p>;
  }

  return (
    <div className="ticket-list">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
