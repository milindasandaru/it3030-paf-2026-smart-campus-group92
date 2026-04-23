import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Resource } from '../api/types';
import { SectionCard } from '../components/SectionCard';
import { resourceService } from '../services/resourceService';

export function ResourceDetailPage() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resourceId) {
      setLoading(false);
      return;
    }

    void resourceService
      .getById(resourceId)
      .then(setResource)
      .catch(() => setResource(null))
      .finally(() => setLoading(false));
  }, [resourceId]);

  if (loading) {
    return <SectionCard title="Resource details">Loading resource details...</SectionCard>;
  }

  if (!resource) {
    return (
      <SectionCard title="Resource details">
        <h3>Resource not found</h3>
        <button className="primary-button" type="button" onClick={() => navigate('/resources')}>
          Back to resources
        </button>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title={resource.name}
      action={
        <button className="ghost-button" type="button" onClick={() => navigate('/resources')}>
          Back
        </button>
      }
    >
      <p>Type: {resource.type.replace('_', ' ')}</p>

      <div className="resource-grid" style={{ marginTop: '1rem' }}>
        <article className="resource-card">
          <h3>Description</h3>
          <p>{resource.description || 'No description available.'}</p>
        </article>

        <article className="resource-card">
          <h3>Location</h3>
          <p>{resource.location}</p>
        </article>

        <article className="resource-card">
          <h3>Capacity</h3>
          <p>{resource.capacity}</p>
        </article>

        <article className="resource-card">
          <h3>Status</h3>
          <p>{resource.status.replace('_', ' ')}</p>
        </article>

        <article className="resource-card">
          <h3>Booking slot interval</h3>
          <p>{resource.bookingSlotIntervalMinutes ?? 'N/A'} minutes</p>
        </article>

        <article className="resource-card">
          <h3>Minimum booking duration</h3>
          <p>{resource.minBookingDurationMinutes ?? 'N/A'} minutes</p>
        </article>

        <article className="resource-card">
          <h3>Maximum booking duration</h3>
          <p>{resource.maxBookingDurationMinutes ?? 'N/A'} minutes</p>
        </article>

        <article className="resource-card">
          <h3>Minimum advance booking</h3>
          <p>{resource.minAdvanceBookingMinutes ?? 'N/A'} minutes</p>
        </article>

        <article className="resource-card">
          <h3>Total units</h3>
          <p>{resource.totalUnits ?? 'N/A'}</p>
        </article>

        <article className="resource-card">
          <h3>Availability windows</h3>
          <p>{resource.availabilityWindows || 'Standard hours'}</p>
        </article>
      </div>
    </SectionCard>
  );
}
