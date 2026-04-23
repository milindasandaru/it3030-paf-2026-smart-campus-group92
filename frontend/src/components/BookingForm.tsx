import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { createBooking, getBookings } from '../api/bookingsApi';
import { fetchResources } from '../api/resourcesApi';
import type { Booking, Resource, UserRole } from '../api/types';
import { useAuth } from '../hooks/useAuth';

interface BookingFormProps {
  onSuccess?: () => void;
}

interface FormState {
  resourceId: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendeeCount: string;
}

function isRestrictedStudentResource(type: Resource['type'] | undefined): boolean {
  return type === 'LECTURE_HALL' || type === 'LAB';
}

function isStudent(role: UserRole | undefined): boolean {
  return role === 'STUDENT';
}

function toIsoDateTime(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

function overlaps(
  existingStart: string,
  existingEnd: string,
  candidateStart: string,
  candidateEnd: string,
): boolean {
  const aStart = new Date(existingStart).getTime();
  const aEnd = new Date(existingEnd).getTime();
  const bStart = new Date(candidateStart).getTime();
  const bEnd = new Date(candidateEnd).getTime();
  return aStart < bEnd && aEnd > bStart;
}

export function BookingForm({ onSuccess }: BookingFormProps) {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [approvedOnDate, setApprovedOnDate] = useState<Booking[]>([]);
  const [form, setForm] = useState<FormState>({
    resourceId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendeeCount: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [availabilityWarning, setAvailabilityWarning] = useState<string | null>(null);
  const [loadingResources, setLoadingResources] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedResource = useMemo(
    () => resources.find((resource) => resource.id === form.resourceId),
    [form.resourceId, resources],
  );

  const bookingConstraints = useMemo(
    () => ({
      slotInterval: selectedResource?.bookingSlotIntervalMinutes ?? 15,
      minDuration: selectedResource?.minBookingDurationMinutes ?? 15,
      maxDuration: selectedResource?.maxBookingDurationMinutes ?? 480,
      minAdvance: selectedResource?.minAdvanceBookingMinutes ?? 30,
    }),
    [selectedResource],
  );

  useEffect(() => {
    let active = true;
    async function loadResources() {
      try {
        const data = await fetchResources();
        if (!active) {
          return;
        }
        const bookableResources = data.filter((resource) => resource.status !== 'OUT_OF_SERVICE');
        setResources(bookableResources);
        if (bookableResources.length > 0) {
          setForm((current) => ({
            ...current,
            resourceId: current.resourceId || bookableResources[0].id,
          }));
        }
      } catch (err) {
        if (active) {
          setErrors([err instanceof Error ? err.message : 'Failed to load resources']);
        }
      } finally {
        if (active) {
          setLoadingResources(false);
        }
      }
    }
    void loadResources();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAvailability() {
      if (!form.resourceId || !form.date) {
        setApprovedOnDate([]);
        setAvailabilityWarning(null);
        return;
      }

      setLoadingAvailability(true);
      try {
        const data = await getBookings({
          resourceId: form.resourceId,
          date: form.date,
        });
        if (!active) {
          return;
        }
        const approved = data.filter((booking) => booking.status === 'APPROVED');
        setApprovedOnDate(approved);
      } catch (err) {
        if (active) {
          setErrors([err instanceof Error ? err.message : 'Failed to load availability']);
        }
      } finally {
        if (active) {
          setLoadingAvailability(false);
        }
      }
    }

    void loadAvailability();
    return () => {
      active = false;
    };
  }, [form.date, form.resourceId]);

  useEffect(() => {
    const nextErrors: string[] = [];

    if (!form.resourceId) {
      nextErrors.push('Resource is required.');
    }
    if (!form.date || !form.startTime || !form.endTime) {
      nextErrors.push('Date, start time, and end time are required.');
      setErrors(nextErrors);
      return;
    }

    const startIso = toIsoDateTime(form.date, form.startTime);
    const endIso = toIsoDateTime(form.date, form.endTime);
    const start = new Date(startIso);
    const end = new Date(endIso);

    if (start >= end) {
      nextErrors.push('Start time must be earlier than end time.');
    }

    const now = new Date();
    if (start <= now) {
      nextErrors.push('Start time must be in the future.');
    }

    const minAdvanceStart = new Date(now.getTime() + bookingConstraints.minAdvance * 60 * 1000);
    if (start < minAdvanceStart) {
      nextErrors.push(
        `Booking must be at least ${bookingConstraints.minAdvance} minutes in advance.`,
      );
    }

    const durationMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);
    if (
      durationMinutes < bookingConstraints.minDuration ||
      durationMinutes > bookingConstraints.maxDuration
    ) {
      nextErrors.push(
        `Duration must be between ${bookingConstraints.minDuration} and ${bookingConstraints.maxDuration} minutes.`,
      );
    }

    if (start.getMinutes() % bookingConstraints.slotInterval !== 0) {
      nextErrors.push(
        `Start time must align with ${bookingConstraints.slotInterval}-minute slots.`,
      );
    }

    if (end.getMinutes() % bookingConstraints.slotInterval !== 0) {
      nextErrors.push(`End time must align with ${bookingConstraints.slotInterval}-minute slots.`);
    }

    if (durationMinutes % bookingConstraints.slotInterval !== 0) {
      nextErrors.push(
        `Duration must align with ${bookingConstraints.slotInterval}-minute interval.`,
      );
    }

    if (isStudent(user?.role) && isRestrictedStudentResource(selectedResource?.type)) {
      const attendeeCount = Number(form.attendeeCount);
      if (!Number.isFinite(attendeeCount) || attendeeCount < 5) {
        nextErrors.push('Student booking for this resource requires attendee count of at least 5.');
      }

      if (!form.purpose.trim()) {
        nextErrors.push('Purpose is required for student booking of this resource type.');
      }
    }

    const hasConflict = approvedOnDate.some((booking) =>
      overlaps(booking.startTime, booking.endTime, startIso, endIso),
    );
    setAvailabilityWarning(hasConflict ? 'This time slot is already booked' : null);

    setErrors(nextErrors);
  }, [
    approvedOnDate,
    bookingConstraints.maxDuration,
    bookingConstraints.minAdvance,
    bookingConstraints.minDuration,
    bookingConstraints.slotInterval,
    form.attendeeCount,
    form.date,
    form.endTime,
    form.purpose,
    form.resourceId,
    form.startTime,
    selectedResource?.type,
    user?.role,
  ]);

  const formInvalid = errors.length > 0 || Boolean(availabilityWarning);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user?.userId || formInvalid) {
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        resourceId: form.resourceId,
        userId: user.userId,
        startTime: toIsoDateTime(form.date, form.startTime),
        endTime: toIsoDateTime(form.date, form.endTime),
        purpose: form.purpose.trim() || undefined,
        attendeeCount: form.attendeeCount ? Number(form.attendeeCount) : undefined,
      });

      setForm((current) => ({
        ...current,
        startTime: '',
        endTime: '',
        purpose: '',
        attendeeCount: '',
      }));
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Failed to create booking']);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section-card form-card">
      <header className="section-card__header">
        <h2>Book Resource</h2>
      </header>

      {loadingResources ? <p>Loading resources...</p> : null}
      {!loadingResources && resources.length === 0 ? (
        <p className="error-text">No bookable resources are currently available.</p>
      ) : null}
      {selectedResource ? (
        <p className="booking-constraints-text">
          Slot: {bookingConstraints.slotInterval}m | Duration: {bookingConstraints.minDuration}m-
          {bookingConstraints.maxDuration}m | Advance: {bookingConstraints.minAdvance}m
        </p>
      ) : null}

      <form className="booking-form" onSubmit={onSubmit}>
        <label>
          Resource
          <select
            onChange={(event) =>
              setForm((current) => ({ ...current, resourceId: event.target.value }))
            }
            value={form.resourceId}
          >
            {resources.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name} ({resource.type})
              </option>
            ))}
          </select>
        </label>

        <label>
          Date
          <input
            onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
            type="date"
            value={form.date}
          />
        </label>

        <label>
          Start Time
          <input
            onChange={(event) =>
              setForm((current) => ({ ...current, startTime: event.target.value }))
            }
            type="time"
            value={form.startTime}
          />
        </label>

        <label>
          End Time
          <input
            onChange={(event) =>
              setForm((current) => ({ ...current, endTime: event.target.value }))
            }
            type="time"
            value={form.endTime}
          />
        </label>

        <label>
          Purpose
          <textarea
            onChange={(event) =>
              setForm((current) => ({ ...current, purpose: event.target.value }))
            }
            rows={3}
            value={form.purpose}
          />
        </label>

        <label>
          Attendee Count
          <input
            min={1}
            onChange={(event) =>
              setForm((current) => ({ ...current, attendeeCount: event.target.value }))
            }
            type="number"
            value={form.attendeeCount}
          />
        </label>

        {loadingAvailability ? <p>Checking availability...</p> : null}
        {availabilityWarning ? <p className="error-text">{availabilityWarning}</p> : null}

        {errors.length > 0 ? (
          <ul className="validation-list">
            {errors.map((error) => (
              <li className="error-text" key={error}>
                {error}
              </li>
            ))}
          </ul>
        ) : null}

        <button className="primary-button" disabled={submitting || formInvalid} type="submit">
          {submitting ? 'Submitting...' : 'Submit Booking'}
        </button>
      </form>
    </section>
  );
}
