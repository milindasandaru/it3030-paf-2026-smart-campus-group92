import { type FormEvent, useState } from 'react';
import type { CreateTicketRequest, Resource, TicketPriority } from '../api/types';

const PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

interface TicketFormProps {
  resources: Resource[];
  reporterId: string;
  onSubmit: (payload: CreateTicketRequest) => Promise<void>;
  submitting: boolean;
}

export function TicketForm({ resources, reporterId, onSubmit, submitting }: TicketFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [contactDetails, setContactDetails] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [resourceId, setResourceId] = useState('');

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      contactDetails: contactDetails.trim() || undefined,
      priority,
      resourceId: resourceId || undefined,
      reporterId,
    });

    setTitle('');
    setDescription('');
    setCategory('GENERAL');
    setContactDetails('');
    setPriority('MEDIUM');
    setResourceId('');
  };

  return (
    <form className="booking-form" onSubmit={submitForm}>
      <label>
        Title
        <input
          required
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>

      <label>
        Description
        <textarea
          required
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>

      <label>
        Category
        <input
          required
          type="text"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        />
      </label>

      <label>
        Contact details
        <input
          type="text"
          value={contactDetails}
          onChange={(event) => setContactDetails(event.target.value)}
        />
      </label>

      <label>
        Priority
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value as TicketPriority)}
        >
          {PRIORITIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        Resource
        <select value={resourceId} onChange={(event) => setResourceId(event.target.value)}>
          <option value="">Not linked</option>
          {resources.map((resource) => (
            <option key={resource.id} value={resource.id}>
              {resource.name}
            </option>
          ))}
        </select>
      </label>

      <button className="primary-button" disabled={submitting} type="submit">
        {submitting ? 'Creating...' : 'Create ticket'}
      </button>
    </form>
  );
}
