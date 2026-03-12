import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTickets } from '../api/ticketsApi';
import type { Ticket } from '../api/types';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';

const fallbackTickets: Ticket[] = [
  {
    id: 't1',
    title: 'East wing HVAC fault',
    description: 'Cooling dropped below target for three classrooms.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    resourceName: 'East Wing',
    reporterName: 'Facilities Desk',
    assigneeName: 'Technician 07',
  },
];

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>(fallbackTickets);

  useEffect(() => {
    void fetchTickets().then(setTickets).catch(() => setTickets(fallbackTickets));
  }, []);

  return (
    <SectionCard title="Maintenance tickets">
      <div className="ticket-list">
        {tickets.map((ticket) => (
          <article className="ticket-card" key={ticket.id}>
            <div className="ticket-card__header">
              <div>
                <h3>{ticket.title}</h3>
                <p>{ticket.description}</p>
              </div>
              <div className="ticket-badges">
                <StatusBadge value={ticket.priority} />
                <StatusBadge value={ticket.status} />
              </div>
            </div>
            <footer>
              <span>Reporter: {ticket.reporterName}</span>
              <span>Assignee: {ticket.assigneeName ?? 'Unassigned'}</span>
              <Link className="ghost-button" to={`/tickets/${ticket.id}`}>
                View details
              </Link>
            </footer>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
