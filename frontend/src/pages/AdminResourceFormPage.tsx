import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ResourceUpsertRequest } from '../api/types';
import { ResourceForm } from '../components/ResourceForm';
import { SectionCard } from '../components/SectionCard';
import { resourceService } from '../services/resourceService';

const initialState: ResourceUpsertRequest = {
  name: '',
  description: undefined,
  location: '',
  capacity: 1,
  type: 'LAB',
  availabilityWindows: undefined,
  bookingSlotIntervalMinutes: 15,
  minBookingDurationMinutes: 15,
  maxBookingDurationMinutes: 120,
  minAdvanceBookingMinutes: 30,
  totalUnits: undefined,
  status: 'ACTIVE',
};

export function AdminResourceFormPage() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();
  const isEdit = useMemo(() => Boolean(resourceId), [resourceId]);
  const [form, setForm] = useState<ResourceUpsertRequest>(initialState);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!resourceId) {
      return;
    }

    void resourceService
      .getById(resourceId)
      .then((resource) => {
        setForm({
          name: resource.name,
          description: resource.description || undefined,
          location: resource.location,
          capacity: resource.capacity,
          type: resource.type,
          availabilityWindows: resource.availabilityWindows || undefined,
          bookingSlotIntervalMinutes: resource.bookingSlotIntervalMinutes ?? 15,
          minBookingDurationMinutes: resource.minBookingDurationMinutes ?? 15,
          maxBookingDurationMinutes: resource.maxBookingDurationMinutes ?? 120,
          minAdvanceBookingMinutes: resource.minAdvanceBookingMinutes ?? 30,
          totalUnits: resource.totalUnits ?? undefined,
          status: resource.status,
        });
      })
      .finally(() => setLoading(false));
  }, [resourceId]);

  const handleSubmit = async (payload: ResourceUpsertRequest) => {
    setSaving(true);
    setSaveError(null);
    try {
      if (resourceId) {
        await resourceService.update(resourceId, payload);
      } else {
        await resourceService.create(payload);
      }
      navigate('/admin/resources');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save resource.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SectionCard title="Resource form">Loading resource...</SectionCard>;
  }

  return (
    <SectionCard title={isEdit ? 'Edit resource' : 'Create resource'}>
      {saveError ? <p className="error-text" style={{ marginBottom: '0.75rem' }}>{saveError}</p> : null}
      <ResourceForm initialValue={form} submitting={saving} onSubmit={handleSubmit} />
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
        <button
          className="ghost-button"
          type="button"
          disabled={saving}
          onClick={() => navigate('/admin/resources')}
        >
          Cancel
        </button>
      </div>
    </SectionCard>
  );
}
