import { useEffect, useState } from 'react';
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
    status: 'AVAILABLE',
  },
  {
    id: '2',
    name: 'Seminar Hall 2',
    description: 'Presentation room optimized for faculty events.',
    location: 'Administration Wing',
    capacity: 120,
    status: 'RESERVED',
  },
];

export function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>(fallbackResources);

  useEffect(() => {
    void fetchResources().then(setResources).catch(() => setResources(fallbackResources));
  }, []);

  return (
    <SectionCard
      title="Campus resources"
      action={<button className="primary-button" type="button">Add resource</button>}
    >
      <div className="resource-grid">
        {resources.map((resource) => (
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
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
