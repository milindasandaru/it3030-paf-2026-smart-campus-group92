import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ResourceStatus, ResourceType } from '../api/types';
import { SectionCard } from '../components/SectionCard';
import { resourceService } from '../services/resourceService';

const resourceTypes: ResourceType[] = ['LECTURE_HALL', 'LAB', 'BOOK', 'STUDY_AREA', 'DOCUMENT'];
const resourceStatuses: ResourceStatus[] = ['AVAILABLE', 'RESERVED', 'OUT_OF_SERVICE'];

interface ResourceFormState {
  name: string;
  description: string;
  location: string;
  capacity: number;
  type: ResourceType;
  availabilityWindows: string;
  status: ResourceStatus;
}

const initialState: ResourceFormState = {
  name: '',
  description: '',
  location: '',
  capacity: 1,
  type: 'LECTURE_HALL',
  availabilityWindows: '',
  status: 'AVAILABLE',
};

export function AdminResourceFormPage() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();
  const isEdit = useMemo(() => Boolean(resourceId), [resourceId]);
  const [form, setForm] = useState<ResourceFormState>(initialState);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!resourceId) {
      return;
    }

    void resourceService
      .getById(resourceId)
      .then((resource) => {
        setForm({
          name: resource.name,
          description: resource.description || '',
          location: resource.location,
          capacity: resource.capacity,
          type: resource.type,
          availabilityWindows: resource.availabilityWindows || '',
          status: resource.status,
        });
      })
      .finally(() => setLoading(false));
  }, [resourceId]);

  const updateField = <K extends keyof ResourceFormState>(key: K, value: ResourceFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      description: form.description.trim() || undefined,
      availabilityWindows: form.availabilityWindows.trim() || undefined,
    };

    try {
      if (resourceId) {
        await resourceService.update(resourceId, payload);
      } else {
        await resourceService.create(payload);
      }
      navigate('/admin/resources');
    } catch {
      alert('Could not save resource.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SectionCard title="Resource form">Loading resource...</SectionCard>;
  }

  return (
    <SectionCard title={isEdit ? 'Edit resource' : 'Create resource'}>
      <form className="booking-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            required
            type="text"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
          />
        </label>

        <label>
          Description
          <textarea
            rows={3}
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
          />
        </label>

        <label>
          Location
          <input
            required
            type="text"
            value={form.location}
            onChange={(event) => updateField('location', event.target.value)}
          />
        </label>

        <label>
          Capacity
          <input
            required
            min={1}
            type="number"
            value={form.capacity}
            onChange={(event) => updateField('capacity', Number(event.target.value))}
          />
        </label>

        <label>
          Type
          <select
            value={form.type}
            onChange={(event) => updateField('type', event.target.value as ResourceType)}
          >
            {resourceTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>

        <label>
          Availability windows
          <input
            type="text"
            placeholder="Mon-Fri 08:00 - 18:00"
            value={form.availabilityWindows}
            onChange={(event) => updateField('availabilityWindows', event.target.value)}
          />
        </label>

        <label>
          Status
          <select
            value={form.status}
            onChange={(event) => updateField('status', event.target.value as ResourceStatus)}
          >
            {resourceStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button className="primary-button" disabled={saving} type="submit">
            {saving ? 'Saving...' : isEdit ? 'Update resource' : 'Create resource'}
          </button>
          <button
            className="ghost-button"
            type="button"
            disabled={saving}
            onClick={() => navigate('/admin/resources')}
          >
            Cancel
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
