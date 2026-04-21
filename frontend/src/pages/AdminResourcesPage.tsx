import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Resource } from '../api/types';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { resourceService } from '../services/resourceService';

export function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    void resourceService
      .list({ search: search || undefined })
      .then(setResources)
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [search]);

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
    <SectionCard
      title="Manage resources"
      action={
        <button className="primary-button" type="button" onClick={() => navigate('/admin/resources/new')}>
          Add resource
        </button>
      }
    >
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search by name or description"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? <p>Loading resources...</p> : null}

      {!loading && resources.length === 0 ? <p>No resources found.</p> : null}

      <div className="resource-grid">
        {resources.map((resource) => (
          <article className="resource-card" key={resource.id}>
            <div className="resource-card__header">
              <h3>{resource.name}</h3>
              <StatusBadge value={resource.status} />
            </div>
            <p>{resource.description || 'No description'}</p>
            <dl className="resource-meta">
              <div>
                <dt>Type</dt>
                <dd>{resource.type.replace('_', ' ')}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{resource.location}</dd>
              </div>
            </dl>
            <footer>
              <button
                className="ghost-button"
                type="button"
                onClick={() => navigate(`/admin/resources/${resource.id}/edit`)}
              >
                Edit
              </button>
              <button className="ghost-button" type="button" onClick={() => handleDelete(resource.id)}>
                Delete
              </button>
            </footer>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
