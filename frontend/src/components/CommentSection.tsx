import { type FormEvent, useState } from 'react';
import type { TicketComment } from '../api/types';
import { CommentItem } from './CommentItem';

interface CommentSectionProps {
  comments: TicketComment[];
  currentUserId: string;
  onCreate: (message: string) => Promise<void>;
  onUpdate: (commentId: string, message: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

export function CommentSection({
  comments,
  currentUserId,
  onCreate,
  onUpdate,
  onDelete,
}: CommentSectionProps) {
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }

    setSaving(true);
    try {
      await onCreate(message.trim());
      setMessage('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section-card" style={{ marginTop: '1rem' }}>
      <h3>Comments</h3>
      <form className="booking-form" onSubmit={create}>
        <textarea
          placeholder="Add a comment"
          rows={3}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button className="primary-button" disabled={saving || !message.trim()} type="submit">
          Add comment
        </button>
      </form>

      <div className="notification-list" style={{ marginTop: '1rem' }}>
        {comments.length === 0 ? <p className="empty-state">No comments yet.</p> : null}
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            canEditOrDelete={comment.authorId === currentUserId}
            comment={comment}
            onDelete={onDelete}
            onSave={onUpdate}
          />
        ))}
      </div>
    </section>
  );
}
