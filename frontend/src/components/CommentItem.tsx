import { useState } from 'react';
import type { TicketComment } from '../api/types';

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

interface CommentItemProps {
  comment: TicketComment;
  canEditOrDelete: boolean;
  onSave: (commentId: string, message: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

export function CommentItem({ comment, canEditOrDelete, onSave, onDelete }: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(comment.message);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await onSave(comment.id, message.trim());
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await onDelete(comment.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="notification-card">
      <p className="notification-headline">{comment.authorName}</p>
      {editing ? (
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} />
      ) : (
        <p>{comment.message}</p>
      )}
      <p className="notification-meta">{formatDate(comment.updatedAt)}</p>

      {canEditOrDelete ? (
        <div className="row-actions">
          {editing ? (
            <button
              className="ghost-button"
              disabled={busy || !message.trim()}
              type="button"
              onClick={() => void save()}
            >
              Save
            </button>
          ) : (
            <button
              className="ghost-button"
              disabled={busy}
              type="button"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
          )}
          <button
            className="ghost-button"
            disabled={busy}
            type="button"
            onClick={() => void remove()}
          >
            Delete
          </button>
        </div>
      ) : null}
    </article>
  );
}
