import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchResources } from '../api/resourcesApi';
import type { Resource } from '../api/types';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';

const fallbackResources: Resource[] = [
  {
    id: '1',
    name: 'Innovation Lab',
    description: 'Flexible maker-space with AV kit and 40 seats.',
    location: 'Engineering Block A',
    capacity: 40,
    type: 'LAB',
    status: 'AVAILABLE',
  },
  {
    id: '2',
    name: 'Seminar Hall 2',
    description: 'Presentation room optimized for faculty events.',
    location: 'Administration Wing',
    capacity: 120,
    type: 'LECTURE_HALL',
    status: 'RESERVED',
  },
];

export function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>(fallbackResources);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    void fetchResources()
      .then(setResources)
      .catch(() => setResources(fallbackResources));
  }, []);

  const visibleResources = resources.filter((resource) => {
    if (!search.trim()) {
      return true;
    }

    const query = search.toLowerCase();
    return (
      resource.name.toLowerCase().includes(query) ||
      resource.description.toLowerCase().includes(query) ||
      resource.location.toLowerCase().includes(query)
    );
  });

  return (
    <SectionCard
      title="Campus resources"
      action={
        <button className="primary-button" type="button">
          Browse facilities
        </button>
      }
    >
      <input
        type="text"
        placeholder="Search by name, description, or location"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="resource-grid">
        {visibleResources.map((resource) => (
          <article className="resource-card" key={resource.id}>
            <div className="resource-card__header">
              <h3>{resource.name}</h3>
              <StatusBadge value={resource.status} />
            </div>
            <p>{resource.description}</p>
            <dl className="resource-meta">
              <div>
                <dt>Location</dt>
                <dd>{resource.location}</dd>
              </div>
              <div>
                <dt>Capacity</dt>
                <dd>{resource.capacity}</dd>
              </div>
            </dl>
            <footer>
              <button
                className="ghost-button"
                type="button"
                onClick={() => navigate(`/resources/${resource.id}`)}
              >
                View details
              </button>
            </footer>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
