import { useRef, useState } from 'react';
import {
  deleteTicketAttachment,
  uploadTicketAttachments,
} from '../api/ticketApi';
import type { TicketAttachment } from '../api/types';

interface Props {
  ticketId: string;
  attachments: TicketAttachment[];
  currentUserId: string;
  isAdminOrTechnician: boolean;
  isReporter: boolean;
  onRefresh: () => Promise<void>;
}

export function TicketAttachmentsPanel({
  ticketId,
  attachments,
  currentUserId,
  isAdminOrTechnician,
  isReporter,
  onRefresh,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canUpload = isReporter || isAdminOrTechnician;
  const remaining = 3 - attachments.length;

  const handleUpload = async () => {
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) {
      setError('Please select at least one image file.');
      return;
    }
    if (files.length > remaining) {
      setError(`You can only add ${remaining} more attachment(s). Max 3 per ticket.`);
      return;
    }
    setError(null);
    setUploading(true);
    try {
      await uploadTicketAttachments(ticketId, currentUserId, Array.from(files));
      if (fileInputRef.current) fileInputRef.current.value = '';
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!window.confirm('Delete this attachment?')) return;
    setError(null);
    try {
      await deleteTicketAttachment(ticketId, attachmentId, currentUserId);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const canDeleteAttachment = (att: TicketAttachment) =>
    att.uploadedById === currentUserId || isAdminOrTechnician || isReporter;

  return (
    <div className="attachment-panel">
      <h3 style={{ margin: 0 }}>Attachments ({attachments.length}/3)</h3>

      {error ? <p className="error-text">{error}</p> : null}

      {attachments.length === 0 ? (
        <p className="empty-state">No attachments yet.</p>
      ) : (
        <div className="attachment-list">
          {attachments.map((att) => (
            <div className="attachment-item" key={att.id}>
              <div>
                <p className="attachment-item__name">{att.fileName}</p>
                <p className="attachment-item__meta">
                  Uploaded by {att.uploadedByName} &middot;{' '}
                  {new Date(att.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="attachment-item__actions">
                <a
                  className="ghost-button"
                  href={att.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={att.fileName}
                >
                  Download
                </a>
                {canDeleteAttachment(att) ? (
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => void handleDelete(att.id)}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {canUpload && remaining > 0 ? (
        <div className="attachment-upload-row">
          <input
            ref={fileInputRef}
            className="attachment-file-input"
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
          />
          <button
            className="primary-button"
            type="button"
            disabled={uploading}
            onClick={() => void handleUpload()}
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      ) : null}

      {canUpload && remaining === 0 ? (
        <p className="empty-state" style={{ fontSize: '0.85rem' }}>
          Maximum 3 attachments reached.
        </p>
      ) : null}
    </div>
  );
}
