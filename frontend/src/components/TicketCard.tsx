import { Link } from 'react-router-dom';
import type { Ticket } from '../api/types';
import { StatusBadge } from './StatusBadge';

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  return (
    <article className="ticket-card">
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

      <dl className="resource-meta">
        <div>
          <dt>Resource</dt>
          <dd>{ticket.resourceName ?? '-'}</dd>
        </div>
        <div>
          <dt>Reporter</dt>
          <dd>{ticket.reporterName}</dd>
        </div>
        <div>
          <dt>Assignee</dt>
          <dd>{ticket.assigneeName ?? 'Unassigned'}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatDate(ticket.createdAt)}</dd>
        </div>
        <div>
          <dt>First response</dt>
          <dd>
            {ticket.firstResponseMinutes != null ? `${ticket.firstResponseMinutes} min` : '-'}
          </dd>
        </div>
        <div>
          <dt>Resolution</dt>
          <dd>{ticket.resolutionMinutes != null ? `${ticket.resolutionMinutes} min` : '-'}</dd>
        </div>
      </dl>

      <footer>
        <Link className="ghost-button" to={`/tickets/${ticket.id}`}>
          View details
        </Link>
      </footer>
    </article>
  );
}
