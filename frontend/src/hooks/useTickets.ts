import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchTickets } from '../api/ticketApi';
import type { Ticket, TicketQueryFilters, UserRole } from '../api/types';
import type { AuthUser } from '../context/auth-context';

function filterByRole(tickets: Ticket[], user: AuthUser | null): Ticket[] {
  if (!user) {
    return [];
  }

  if (user.role === 'ADMIN') {
    return tickets;
  }

  if (user.role === 'TECHNICIAN') {
    return tickets.filter((ticket) => ticket.assigneeId === user.userId);
  }

  return tickets.filter((ticket) => ticket.reporterId === user.userId);
}

function applyFilters(tickets: Ticket[], filters: TicketQueryFilters): Ticket[] {
  return tickets.filter((ticket) => {
    if (filters.status && filters.status !== 'ALL' && ticket.status !== filters.status) {
      return false;
    }

    if (filters.priority && filters.priority !== 'ALL' && ticket.priority !== filters.priority) {
      return false;
    }

    if (
      filters.resourceId &&
      filters.resourceId !== 'ALL' &&
      (ticket.resourceId || 'UNLINKED') !== filters.resourceId
    ) {
      return false;
    }

    const query = filters.search?.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return (
      ticket.title.toLowerCase().includes(query) ||
      ticket.description.toLowerCase().includes(query) ||
      (ticket.resourceName || '').toLowerCase().includes(query)
    );
  });
}

export interface UseTicketsState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setFilters: (next: Partial<TicketQueryFilters>) => void;
  filters: TicketQueryFilters;
  availableResourceOptions: Array<{ value: string; label: string }>;
  role: UserRole | null;
}

export function useTickets(user: AuthUser | null): UseTicketsState {
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<TicketQueryFilters>({
    status: 'ALL',
    priority: 'ALL',
    resourceId: 'ALL',
    search: '',
  });

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTickets();
      setAllTickets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
      setAllTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const roleScopedTickets = useMemo(() => filterByRole(allTickets, user), [allTickets, user]);
  const tickets = useMemo(
    () => applyFilters(roleScopedTickets, filters),
    [roleScopedTickets, filters],
  );

  const availableResourceOptions = useMemo(() => {
    const options = new Map<string, string>();
    roleScopedTickets.forEach((ticket) => {
      if (ticket.resourceId && ticket.resourceName) {
        options.set(ticket.resourceId, ticket.resourceName);
      }
    });

    return Array.from(options.entries()).map(([value, label]) => ({ value, label }));
  }, [roleScopedTickets]);

  const setFilters = (next: Partial<TicketQueryFilters>) => {
    setFiltersState((current) => ({ ...current, ...next }));
  };

  return {
    tickets,
    loading,
    error,
    reload,
    filters,
    setFilters,
    availableResourceOptions,
    role: user?.role ?? null,
  };
}
