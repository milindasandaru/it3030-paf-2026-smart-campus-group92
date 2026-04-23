import { Link } from 'react-router-dom';
import { SectionCard } from '../components/SectionCard';
import { TicketFilters } from '../components/TicketFilters';
import { TicketList } from '../components/TicketList';
import { useAuth } from '../hooks/useAuth';
import { useTickets } from '../hooks/useTickets';

export function TicketsPage() {
  const { user } = useAuth();
  const { tickets, loading, error, filters, setFilters, availableResourceOptions, role } =
    useTickets(user);

  const canCreateTicket = role !== 'ADMIN' && role !== 'TECHNICIAN';

  return (
    <>
      <TicketFilters
        filters={filters}
        onChange={setFilters}
        resourceOptions={availableResourceOptions}
      />

      <SectionCard
        title="Ticket management"
        action={
          canCreateTicket ? (
            <Link className="primary-button" to="/tickets/new">
              Create ticket
            </Link>
          ) : undefined
        }
      >
        {loading ? <p>Loading tickets...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        {!loading ? <TicketList tickets={tickets} /> : null}
      </SectionCard>
    </>
  );
}
