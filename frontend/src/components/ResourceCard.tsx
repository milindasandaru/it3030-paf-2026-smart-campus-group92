import type { ReactNode } from 'react';
import type { Resource } from '../api/types';
import { StatusBadge } from './StatusBadge';

interface ResourceCardProps {
  resource: Resource;
  action?: ReactNode;
}

export function ResourceCard({ resource, action }: ResourceCardProps) {
  return (
    <article className="resource-card">
      <div className="resource-card__header">
        <h3>{resource.name}</h3>
        <StatusBadge value={resource.status} />
      </div>
      <p>{resource.description || 'No description available.'}</p>
      <dl className="resource-meta">
        <div>
          <dt>Type</dt>
          <dd>{resource.type.replace(/_/g, ' ')}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{resource.location}</dd>
        </div>
        <div>
          <dt>Capacity</dt>
          <dd>{resource.capacity}</dd>
        </div>
      </dl>
      {action ? <footer>{action}</footer> : null}
    </article>
  );
}
