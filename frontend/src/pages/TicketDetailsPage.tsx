import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  assignTicket,
  closeTicket,
  createTicketComment,
  deleteTicketComment,
  fetchTicketById,
  fetchTicketComments,
  rejectTicket,
  reopenTicket,
  resolveTicket,
  startTicketWork,
  updateTicketComment,
} from '../api/ticketsApi';
import type { Ticket, TicketComment } from '../api/types';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
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
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isPrivileged = useMemo(
    () => user?.role === 'ADMIN' || user?.role === 'TECHNICIAN',
    [user?.role],
  );

  const isReporter = Boolean(user && ticket && user.userId === ticket.reporterId);
  const isAssignee = Boolean(user && ticket?.assigneeId && user.userId === ticket.assigneeId);

  useEffect(() => {
    if (!ticketId) {
      return;
    }

    const load = async () => {
      try {
        const [ticketData, commentData] = await Promise.all([
          fetchTicketById(ticketId),
          fetchTicketComments(ticketId),
        ]);
        setTicket(ticketData);
        setComments(commentData);
      } catch {
        setError('Unable to load ticket details right now.');
      }
    };

    void load();
  }, [ticketId]);

  const refreshTicket = async () => {
    if (!ticketId) {
      return;
    }
    const updated = await fetchTicketById(ticketId);
    setTicket(updated);
  };

  const refreshComments = async () => {
    if (!ticketId) {
      return;
    }
    const rows = await fetchTicketComments(ticketId);
    setComments(rows);
  };

  const runAction = async (action: () => Promise<void>, message: string) => {
    setError(null);
    setSuccess(null);
    try {
      await action();
      await refreshTicket();
      setSuccess(message);
    } catch {
      setError('Ticket action failed. Please verify role and status preconditions.');
    }
  };

  const handleAddComment = async (event: FormEvent) => {
    event.preventDefault();
    if (!ticketId || !user?.userId || !newComment.trim()) {
      return;
    }

    try {
      setError(null);
      await createTicketComment(ticketId, {
        message: newComment.trim(),
        authorId: user.userId,
      });
      setNewComment('');
      await refreshComments();
      setSuccess('Comment added.');
    } catch {
      setError('Unable to add comment.');
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!user?.userId || !editingMessage.trim()) {
      return;
    }

    try {
      setError(null);
      await updateTicketComment(commentId, {
        message: editingMessage.trim(),
        actorUserId: user.userId,
      });
      setEditingCommentId(null);
      setEditingMessage('');
      await refreshComments();
      setSuccess('Comment updated.');
    } catch {
      setError('Unable to update comment. Only owner or admin can update.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user?.userId) {
      return;
    }

    try {
      setError(null);
      await deleteTicketComment(commentId, user.userId);
      await refreshComments();
      setSuccess('Comment deleted.');
    } catch {
      setError('Unable to delete comment. Only ticket owner or admin can delete.');
    }
  };

  if (!ticket) {
    return (
      <SectionCard title={`Ticket ${ticketId ?? ''}`}>
        <p className="empty-state">Loading ticket details...</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title={`Ticket ${ticketId}`}>
      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}
      <div className="details-grid">
        <div>
          <h3>Issue summary</h3>
          <p>{ticket.description}</p>
          <dl className="resource-meta">
            <div>
              <dt>Category</dt>
              <dd>{ticket.category}</dd>
            </div>
            <div>
              <dt>Priority</dt>
              <dd>
                <StatusBadge value={ticket.priority} />
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge value={ticket.status} />
              </dd>
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
              <dt>Resource</dt>
              <dd>{ticket.resourceName ?? '-'}</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>{ticket.contactDetails ?? '-'}</dd>
            </div>
            <div>
              <dt>Resolution</dt>
              <dd>{ticket.resolutionNotes ?? '-'}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{formatTimestamp(ticket.createdAt)}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{formatTimestamp(ticket.updatedAt)}</dd>
            </div>
          </dl>
        </div>
        <div>
          <h3>Next actions</h3>
          <div className="booking-card__actions">
            {isPrivileged && ticket.status === 'OPEN' && (
              <>
                <input
                  placeholder="Assignee user ID"
                  value={assigneeId}
                  onChange={(event) => setAssigneeId(event.target.value)}
                />
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() =>
                    void runAction(async () => {
                      if (!user?.userId || !assigneeId.trim()) {
                        throw new Error('missing-assignee');
                      }
                      await assignTicket(ticket.id, {
                        assigneeId: assigneeId.trim(),
                        actorUserId: user.userId,
                      });
                    }, 'Ticket assigned.')
                  }
                >
                  Assign
                </button>
              </>
            )}

            {(isAssignee || isPrivileged) && ticket.status === 'OPEN' && (
              <button
                className="ghost-button"
                type="button"
                onClick={() =>
                  void runAction(async () => {
                    if (!user?.userId) {
                      throw new Error('missing-user');
                    }
                    await startTicketWork(ticket.id, { actorUserId: user.userId });
                  }, 'Work started.')
                }
              >
                Start Work
              </button>
            )}

            {(isAssignee || isPrivileged) && ticket.status === 'IN_PROGRESS' && (
              <>
                <textarea
                  placeholder="Resolution notes"
                  value={resolutionNotes}
                  onChange={(event) => setResolutionNotes(event.target.value)}
                />
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() =>
                    void runAction(async () => {
                      if (!user?.userId || !resolutionNotes.trim()) {
                        throw new Error('missing-resolution');
                      }
                      await resolveTicket(ticket.id, {
                        actorUserId: user.userId,
                        resolutionNotes: resolutionNotes.trim(),
                      });
                    }, 'Ticket resolved.')
                  }
                >
                  Resolve
                </button>
              </>
            )}

            {(isReporter || isPrivileged) && ticket.status === 'RESOLVED' && (
              <button
                className="ghost-button"
                type="button"
                onClick={() =>
                  void runAction(async () => {
                    if (!user?.userId) {
                      throw new Error('missing-user');
                    }
                    await closeTicket(ticket.id, { actorUserId: user.userId });
                  }, 'Ticket closed.')
                }
              >
                Close Ticket
              </button>
            )}

            {isPrivileged && (ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
              <>
                <textarea
                  placeholder="Rejection reason"
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                />
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() =>
                    void runAction(async () => {
                      if (!user?.userId || !rejectionReason.trim()) {
                        throw new Error('missing-rejection');
                      }
                      await rejectTicket(ticket.id, {
                        actorUserId: user.userId,
                        rejectionReason: rejectionReason.trim(),
                      });
                    }, 'Ticket rejected.')
                  }
                >
                  Reject
                </button>
              </>
            )}

            {(isReporter || isPrivileged) &&
              (ticket.status === 'CLOSED' || ticket.status === 'REJECTED') && (
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() =>
                    void runAction(async () => {
                      if (!user?.userId) {
                        throw new Error('missing-user');
                      }
                      await reopenTicket(ticket.id, { actorUserId: user.userId });
                    }, 'Ticket reopened.')
                  }
                >
                  Reopen
                </button>
              )}
          </div>
        </div>
      </div>

      <div className="section-card" style={{ marginTop: '1rem' }}>
        <h3>Comments</h3>
        <form className="booking-form" onSubmit={handleAddComment}>
          <textarea
            placeholder="Add a comment"
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
          />
          <button className="primary-button" type="submit">
            Add Comment
          </button>
        </form>

        <div className="notification-list" style={{ marginTop: '1rem' }}>
          {comments.map((comment) => {
            const canEdit = user && (user.userId === comment.authorId || user.role === 'ADMIN');
            const canDelete = user && (user.userId === ticket.reporterId || user.role === 'ADMIN');
            const isEditing = editingCommentId === comment.id;

            return (
              <article className="notification-card" key={comment.id}>
                <p className="notification-headline">{comment.authorName}</p>
                {isEditing ? (
                  <textarea
                    value={editingMessage}
                    onChange={(event) => setEditingMessage(event.target.value)}
                  />
                ) : (
                  <p>{comment.message}</p>
                )}
                <p className="notification-meta">{formatTimestamp(comment.updatedAt)}</p>
                <div className="row-actions">
                  {isEditing ? (
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => void handleUpdateComment(comment.id)}
                    >
                      Save
                    </button>
                  ) : (
                    canEdit && (
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditingMessage(comment.message);
                        }}
                      >
                        Edit
                      </button>
                    )
                  )}
                  {canDelete && (
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => void handleDeleteComment(comment.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}
