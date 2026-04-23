import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Resource, ResourceQueryFilters } from '../api/types';
import { ResourceFilters } from '../components/ResourceFilters';
import { ResourceList } from '../components/ResourceList';
import { SectionCard } from '../components/SectionCard';
import { resourceService } from '../services/resourceService';

export function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filters, setFilters] = useState<ResourceQueryFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    void resourceService
      .list(filters)
      .then(setResources)
      .catch((err) => {
        setResources([]);
        setError(err instanceof Error ? err.message : 'Could not load resources');
      })
      .finally(() => setLoading(false));
  }, [filters]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this resource?')) {
      return;
    }

    try {
      await resourceService.delete(id);
      setResources((current) => current.filter((resource) => resource.id !== id));
    } catch {
      alert('Could not delete resource.');
    }
  };

  return (
    <>
      <ResourceFilters
        filters={filters}
        onChange={(next) => setFilters((current) => ({ ...current, ...next }))}
      />

      <SectionCard
        title="Manage resources"
        action={
          <button
            className="primary-button"
            type="button"
            onClick={() => navigate('/admin/resources/new')}
          >
            Add resource
          </button>
        }
      >
        {loading ? <p>Loading resources...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        {!loading ? (
          <ResourceList
            resources={resources}
            renderAction={(resource) => (
              <>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => navigate(`/admin/resources/${resource.id}/edit`)}
                >
                  Edit
                </button>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => void handleDelete(resource.id)}
                >
                  Delete
                </button>
              </>
            )}
          />
        ) : null}
      </SectionCard>
    </>
  );
}
