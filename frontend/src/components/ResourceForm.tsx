import { type FormEvent, useState } from 'react';
import type { ResourceStatus, ResourceType, ResourceUpsertRequest } from '../api/types';

interface ResourceFormProps {
  initialValue: ResourceUpsertRequest;
  submitting: boolean;
  onSubmit: (payload: ResourceUpsertRequest) => Promise<void>;
}

const resourceTypes: ResourceType[] = [
  'LAB',
  'LECTURE_HALL',
  'MEETING_ROOM',
  'PROJECTOR',
  'CAMERA',
  'STUDY_AREA',
  'OTHER',
];
const resourceStatuses: ResourceStatus[] = ['ACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE'];
const slotIntervals = [15, 30];

export function ResourceForm({ initialValue, submitting, onSubmit }: ResourceFormProps) {
  const [form, setForm] = useState<ResourceUpsertRequest>(initialValue);

  const updateField = <K extends keyof ResourceUpsertRequest>(
    key: K,
    value: ResourceUpsertRequest[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      ...form,
      description: form.description?.trim() || undefined,
      availabilityWindows: form.availabilityWindows?.trim() || undefined,
      totalUnits: form.totalUnits,
    });
  };

  return (
    <form className="booking-form" onSubmit={submit}>
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
          value={form.description ?? ''}
          onChange={(event) => updateField('description', event.target.value)}
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
              {type.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
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
        Status
        <select
          value={form.status}
          onChange={(event) => updateField('status', event.target.value as ResourceStatus)}
        >
          {resourceStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </label>

      <label>
        Availability windows
        <input
          type="text"
          placeholder="Mon-Fri 08:00 - 18:00"
          value={form.availabilityWindows ?? ''}
          onChange={(event) => updateField('availabilityWindows', event.target.value)}
        />
      </label>

      <label>
        Slot interval (minutes)
        <select
          value={form.bookingSlotIntervalMinutes ?? 15}
          onChange={(event) =>
            updateField('bookingSlotIntervalMinutes', Number(event.target.value))
          }
        >
          {slotIntervals.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label>
        Minimum booking duration (minutes)
        <input
          type="number"
          min={1}
          value={form.minBookingDurationMinutes ?? ''}
          onChange={(event) =>
            updateField(
              'minBookingDurationMinutes',
              event.target.value ? Number(event.target.value) : undefined,
            )
          }
        />
      </label>

      <label>
        Maximum booking duration (minutes)
        <input
          type="number"
          min={1}
          value={form.maxBookingDurationMinutes ?? ''}
          onChange={(event) =>
            updateField(
              'maxBookingDurationMinutes',
              event.target.value ? Number(event.target.value) : undefined,
            )
          }
        />
      </label>

      <label>
        Minimum advance booking (minutes)
        <input
          type="number"
          min={0}
          value={form.minAdvanceBookingMinutes ?? ''}
          onChange={(event) =>
            updateField(
              'minAdvanceBookingMinutes',
              event.target.value ? Number(event.target.value) : undefined,
            )
          }
        />
      </label>

      <label>
        Total units
        <input
          type="number"
          min={1}
          value={form.totalUnits ?? ''}
          onChange={(event) =>
            updateField('totalUnits', event.target.value ? Number(event.target.value) : undefined)
          }
        />
      </label>

      <button className="primary-button" disabled={submitting} type="submit">
        {submitting ? 'Saving...' : 'Save resource'}
      </button>
    </form>
  );
}
