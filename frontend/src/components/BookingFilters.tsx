import type { BookingStatus, BookingUiFilters, Resource, ResourceType } from '../api/types';

interface BookingFiltersProps {
  filters: BookingUiFilters;
  resources: Resource[];
  onChange: (next: Partial<BookingUiFilters>) => void;
}

const STATUS_OPTIONS: Array<BookingStatus | 'ALL'> = [
  'ALL',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
];
const TYPE_OPTIONS: Array<ResourceType | 'ALL'> = [
  'ALL',
  'LECTURE_HALL',
  'LAB',
  'STUDY_ROOM',
  'STUDY_AREA',
  'BOOK',
  'DOCUMENT',
];

export function BookingFilters({ filters, resources, onChange }: BookingFiltersProps) {
  const usedTypes = new Set(resources.map((resource) => resource.type));
  const typeOptions = TYPE_OPTIONS.filter((type) => type === 'ALL' || usedTypes.has(type));

  return (
    <section className="section-card booking-filters-card">
      <header className="section-card__header">
        <h3>Filter bookings</h3>
      </header>
      <div className="booking-filters-grid">
        <label>
          Search
          <input
            onChange={(event) => onChange({ search: event.target.value || undefined })}
            placeholder="resource, requester, purpose"
            type="text"
            value={filters.search ?? ''}
          />
        </label>

        <label>
          Status
          <select
            onChange={(event) =>
              onChange({
                status: event.target.value as BookingStatus | 'ALL',
              })
            }
            value={filters.status ?? 'ALL'}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label>
          Resource type
          <select
            onChange={(event) =>
              onChange({
                resourceType: event.target.value as ResourceType | 'ALL',
              })
            }
            value={filters.resourceType ?? 'ALL'}
          >
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          From date
          <input
            onChange={(event) => onChange({ fromDate: event.target.value || undefined })}
            type="date"
            value={filters.fromDate ?? ''}
          />
        </label>

        <label>
          To date
          <input
            onChange={(event) => onChange({ toDate: event.target.value || undefined })}
            type="date"
            value={filters.toDate ?? ''}
          />
        </label>
      </div>
    </section>
  );
}
