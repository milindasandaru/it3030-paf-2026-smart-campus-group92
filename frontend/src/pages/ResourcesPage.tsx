import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Resource, ResourceQueryFilters } from '../api/types';
import { ResourceFilters } from '../components/ResourceFilters';
import { ResourceList } from '../components/ResourceList';
import { SectionCard } from '../components/SectionCard';
import { resourceService } from '../services/resourceService';

export function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ResourceQueryFilters>({});
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    void resourceService
      .list(filters)
      .then(setResources)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load resources'))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <>
      <ResourceFilters
        filters={filters}
        onChange={(next) => setFilters((current) => ({ ...current, ...next }))}
      />

      <SectionCard title="Campus resources">
        {loading ? <p>Loading resources...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        {!loading ? (
          <ResourceList
            resources={resources}
            renderAction={(resource) => (
              <button
                className="ghost-button"
                type="button"
                onClick={() => navigate(`/resources/${resource.id}`)}
              >
                View details
              </button>
            )}
          />
        ) : null}
      </SectionCard>
    </>
  );
}
