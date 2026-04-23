import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../api/ticketApi';
import { fetchResources } from '../api/resourcesApi';
import type { Resource } from '../api/types';
import { SectionCard } from '../components/SectionCard';
import { TicketForm } from '../components/TicketForm';
import { ToastMessage } from '../components/ToastMessage';
import { useAuth } from '../hooks/useAuth';

export function CreateTicketPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);

  useEffect(() => {
    let active = true;
    void fetchResources()
      .then((rows) => {
        if (!active) {
          return;
        }
        setResources(rows);
      })
      .catch((err) => {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Unable to load resources');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!user) {
    return (
      <SectionCard title="Create ticket">
        <p className="error-text">You must be signed in to create tickets.</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Create ticket">
      {toast ? <ToastMessage message={toast.message} tone={toast.tone} /> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p>Loading ticket form...</p> : null}

      {!loading ? (
        <TicketForm
          reporterId={user.userId}
          resources={resources}
          submitting={submitting}
          onSubmit={async (payload) => {
            setError(null);
            setToast(null);
            setSubmitting(true);
            try {
              const ticket = await createTicket(payload);
              setToast({ message: `Ticket '${ticket.title}' created`, tone: 'success' });
              navigate(`/tickets/${ticket.id}`);
            } catch (err) {
              console.error(
                'Ticket creation failed',
                isAxiosError(err) ? err.response?.data ?? err.message : err,
              );

              const message = isAxiosError<{ message?: string }>(err)
                ? err.response?.data?.message ?? err.message ?? 'Ticket creation failed'
                : err instanceof Error
                  ? err.message
                  : 'Ticket creation failed';

              setError(message);
              setToast({ message, tone: 'error' });
              throw err;
            } finally {
              setSubmitting(false);
            }
          }}
        />
      ) : null}
    </SectionCard>
  );
}
