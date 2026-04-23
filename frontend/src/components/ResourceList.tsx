import type { ReactNode } from 'react';
import type { Resource } from '../api/types';
import { ResourceCard } from './ResourceCard';

interface ResourceListProps {
  resources: Resource[];
  renderAction?: (resource: Resource) => ReactNode;
}

export function ResourceList({ resources, renderAction }: ResourceListProps) {
  if (resources.length === 0) {
    return <p className="empty-state">No resources found.</p>;
  }

  return (
    <div className="resource-grid">
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} action={renderAction?.(resource)} />
      ))}
    </div>
  );
}
