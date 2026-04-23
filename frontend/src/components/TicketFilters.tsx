import type { TicketPriority, TicketQueryFilters, TicketStatus } from '../api/types';

const STATUS_OPTIONS: Array<TicketStatus | 'ALL'> = [
  'ALL',
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED',
  'CLOSED',
];

const PRIORITY_OPTIONS: Array<TicketPriority | 'ALL'> = [
  'ALL',
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
];

interface TicketFiltersProps {
  filters: TicketQueryFilters;
  onChange: (next: Partial<TicketQueryFilters>) => void;
  resourceOptions: Array<{ value: string; label: string }>;
}

export function TicketFilters({ filters, onChange, resourceOptions }: TicketFiltersProps) {
  return (
    <section className="section-card booking-filters-card">
      <header className="section-card__header">
        <h3>Filter tickets</h3>
      </header>

      <div className="booking-filters-grid">
        <label>
          Search title
          <input
            placeholder="search by title"
            type="text"
            value={filters.search ?? ''}
            onChange={(event) => onChange({ search: event.target.value })}
          />
        </label>

        <label>
          Status
          <select
            value={filters.status ?? 'ALL'}
            onChange={(event) => onChange({ status: event.target.value as TicketStatus | 'ALL' })}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Priority
          <select
            value={filters.priority ?? 'ALL'}
            onChange={(event) =>
              onChange({
                priority: event.target.value as TicketPriority | 'ALL',
              })
            }
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Resource
          <select
            value={filters.resourceId ?? 'ALL'}
            onChange={(event) => onChange({ resourceId: event.target.value })}
          >
            <option value="ALL">ALL</option>
            {resourceOptions.map((resource) => (
              <option key={resource.value} value={resource.value}>
                {resource.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
