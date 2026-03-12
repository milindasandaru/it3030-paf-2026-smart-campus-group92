import { useParams } from 'react-router-dom';
import { SectionCard } from '../components/SectionCard';

export function TicketDetailsPage() {
  const { ticketId } = useParams();

  return (
    <SectionCard title={`Ticket ${ticketId}`}>
      <div className="details-grid">
        <div>
          <h3>Issue summary</h3>
          <p>Example detail view for assignment history, comments, and attachment references.</p>
        </div>
        <div>
          <h3>Next actions</h3>
          <ul className="timeline-list">
            <li>Confirm technician availability</li>
            <li>Post update to requester</li>
            <li>Close ticket once verification passes</li>
          </ul>
        </div>
      </div>
    </SectionCard>
  );
}
