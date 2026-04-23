import type { ResourceQueryFilters, ResourceStatus, ResourceType } from '../api/types';

const RESOURCE_TYPES: ResourceType[] = [
  'LECTURE_HALL',
  'LAB',
  'STUDY_ROOM',
  'BOOK',
  'STUDY_AREA',
  'DOCUMENT',
];

const RESOURCE_STATUSES: ResourceStatus[] = ['ACTIVE', 'AVAILABLE', 'RESERVED', 'OUT_OF_SERVICE'];

interface ResourceFiltersProps {
  filters: ResourceQueryFilters;
  onChange: (next: Partial<ResourceQueryFilters>) => void;
}

export function ResourceFilters({ filters, onChange }: ResourceFiltersProps) {
  return (
    <section className="section-card booking-filters-card">
      <header className="section-card__header">
        <h3>Filter resources</h3>
      </header>
      <div className="booking-filters-grid">
        <label className="filter-field">
          Search
          <input
            type="text"
            placeholder="name or description"
            value={filters.search ?? ''}
            onChange={(event) => onChange({ search: event.target.value || undefined })}
          />
        </label>

        <label className="filter-field">
          Type
          <select
            value={filters.type ?? 'ALL'}
            onChange={(event) =>
              onChange({
                type:
                  event.target.value === 'ALL' ? undefined : (event.target.value as ResourceType),
              })
            }
          >
            <option value="ALL">ALL</option>
            {RESOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          Min capacity
          <input
            type="number"
            min={1}
            value={filters.capacityMin ?? ''}
            onChange={(event) =>
              onChange({
                capacityMin: event.target.value ? Number(event.target.value) : undefined,
              })
            }
          />
        </label>

        <label className="filter-field">
          Location
          <input
            type="text"
            value={filters.location ?? ''}
            onChange={(event) => onChange({ location: event.target.value || undefined })}
          />
        </label>

        <label className="filter-field">
          Status
          <select
            value={filters.status ?? 'ALL'}
            onChange={(event) =>
              onChange({
                status:
                  event.target.value === 'ALL' ? undefined : (event.target.value as ResourceStatus),
              })
            }
          >
            <option value="ALL">ALL</option>
            {RESOURCE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
