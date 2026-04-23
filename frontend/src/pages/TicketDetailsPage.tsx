import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  assignTicket,
  closeTicket,
  createTicketComment,
  deleteTicketComment,
  fetchTicketById,
  fetchTicketComments,
  rejectTicket,
  resolveTicket,
  startTicketWork,
  updateTicketComment,
} from '../api/ticketApi';
import type { Ticket, TicketComment } from '../api/types';
import { AssignModal } from '../components/AssignModal';
import { CommentSection } from '../components/CommentSection';
import { ResolveModal } from '../components/ResolveModal';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { ToastMessage } from '../components/ToastMessage';
import { useAuth } from '../hooks/useAuth';

function formatTimestamp(value?: string | null) {
  if (!value) {
    return '-';
  }
  return new Date(value).toLocaleString();
}

export function TicketDetailsPage() {
  const { ticketId } = useParams();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';
  const isReporter = Boolean(user?.userId && ticket?.reporterId === user.userId);
  const isAssignedTechnician = Boolean(
    isTechnician && user?.userId && ticket?.assigneeId && ticket.assigneeId === user.userId,
  );

  const canStart = isAssignedTechnician && ticket?.status === 'OPEN';
  const canResolve = isAssignedTechnician && ticket?.status === 'IN_PROGRESS';
  const canClose = isReporter && ticket?.status === 'RESOLVED';
  const canAssign = isAdmin;
  const canReject = isAdmin && ticket?.status === 'OPEN';

  const pageTitle = useMemo(() => `Ticket ${ticketId ?? ''}`, [ticketId]);

  const loadTicket = async () => {
    if (!ticketId) {
      return;
    }

    const [ticketData, commentData] = await Promise.all([
      fetchTicketById(ticketId),
      fetchTicketComments(ticketId),
    ]);
    setTicket(ticketData);
    setComments(commentData);
  };

  useEffect(() => {
    if (!ticketId) {
      return;
    }

    setLoading(true);
    void loadTicket()
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load ticket details');
      })
      .finally(() => setLoading(false));
  }, [ticketId]);

  if (!user) {
    return (
      <SectionCard title={pageTitle}>
        <p className="error-text">You must be signed in to manage tickets.</p>
      </SectionCard>
    );
  }

  const runAction = async (action: () => Promise<void>, message: string) => {
    setError(null);
    try {
      await action();
      await loadTicket();
      setToast(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ticket action failed');
    }
  };

  return (
    <>
      <SectionCard title={pageTitle}>
        {toast ? <ToastMessage message={toast} /> : null}
        {error ? <ToastMessage message={error} tone="error" /> : null}
        {loading ? <p>Loading ticket details...</p> : null}

        {!loading && !ticket ? <p className="empty-state">Ticket not found.</p> : null}

        {!loading && ticket ? (
          <>
            <div className="details-grid">
              <div>
                <h3>{ticket.title}</h3>
                <p>{ticket.description}</p>
                <dl className="resource-meta">
                  <div>
                    <dt>Status</dt>
                    <dd>
                      <StatusBadge value={ticket.status} />
                    </dd>
                  </div>
                  <div>
                    <dt>Priority</dt>
                    <dd>
                      <StatusBadge value={ticket.priority} />
                    </dd>
                  </div>
                  <div>
                    <dt>Resource</dt>
                    <dd>{ticket.resourceName ?? '-'}</dd>
                  </div>
                  <div>
                    <dt>Reporter</dt>
                    <dd>{ticket.reporterName}</dd>
                  </div>
                  <div>
                    <dt>Assignee</dt>
                    <dd>{ticket.assigneeName ?? 'Unassigned'}</dd>
                  </div>
                  <div>
                    <dt>Created</dt>
                    <dd>{formatTimestamp(ticket.createdAt)}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3>Actions</h3>
                <div className="booking-card__actions">
                  {canAssign ? (
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => setAssignModalOpen(true)}
                    >
                      Assign
                    </button>
                  ) : null}

                  {canReject ? (
                    <button
                      className="ghost-button"
                      type="button"
                      disabled={rejecting}
                      onClick={() =>
                        void runAction(async () => {
                          const rejectionReason = window.prompt('Enter rejection reason');
                          if (!rejectionReason || !rejectionReason.trim()) {
                            throw new Error('Rejection reason is required');
                          }
                          setRejecting(true);
                          try {
                            await rejectTicket(ticket.id, {
                              actorUserId: user.userId,
                              rejectionReason: rejectionReason.trim(),
                            });
                          } finally {
                            setRejecting(false);
                          }
                        }, 'Ticket rejected')
                      }
                    >
                      Reject
                    </button>
                  ) : null}

                  {canStart ? (
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() =>
                        void runAction(async () => {
                          await startTicketWork(ticket.id, { actorUserId: user.userId });
                        }, 'Ticket moved to IN_PROGRESS')
                      }
                    >
                      Start
                    </button>
                  ) : null}

                  {canResolve ? (
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => setResolveModalOpen(true)}
                    >
                      Resolve
                    </button>
                  ) : null}

                  {canClose ? (
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() =>
                        void runAction(async () => {
                          await closeTicket(ticket.id, { actorUserId: user.userId });
                        }, 'Ticket closed')
                      }
                    >
                      Close
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <CommentSection
              comments={comments}
              currentUserId={user.userId}
              onCreate={async (message) => {
                await runAction(async () => {
                  await createTicketComment(ticket.id, {
                    authorId: user.userId,
                    message,
                  });
                }, 'New comment added');
              }}
              onDelete={async (commentId) => {
                await runAction(async () => {
                  await deleteTicketComment(ticket.id, commentId, user.userId);
                }, 'Comment deleted');
              }}
              onUpdate={async (commentId, message) => {
                await runAction(async () => {
                  await updateTicketComment(ticket.id, commentId, {
                    actorUserId: user.userId,
                    message,
                  });
                }, 'Comment updated');
              }}
            />
          </>
        ) : null}
      </SectionCard>

      <AssignModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssign={async (assigneeId) => {
          if (!ticket) {
            return;
          }

          await runAction(async () => {
            await assignTicket(ticket.id, {
              actorUserId: user.userId,
              assigneeId,
            });
          }, `Ticket '${ticket.title}' assigned to technician`);
        }}
      />

      <ResolveModal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        onResolve={async (resolutionNotes) => {
          if (!ticket) {
            return;
          }

          await runAction(async () => {
            await resolveTicket(ticket.id, {
              actorUserId: user.userId,
              resolutionNotes,
            });
          }, 'Ticket resolved');
        }}
      />
    </>
  );
}
