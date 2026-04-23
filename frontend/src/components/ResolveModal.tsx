import { useState } from 'react';

interface ResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve: (notes: string) => Promise<void>;
}

export function ResolveModal({ isOpen, onClose, onResolve }: ResolveModalProps) {
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isOpen) {
    return null;
  }

  const submit = async () => {
    if (!notes.trim()) {
      return;
    }

    setBusy(true);
    try {
      await onResolve(notes.trim());
      setNotes('');
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resolve-modal-title"
      >
        <h3 id="resolve-modal-title">Resolve ticket</h3>
        <label>
          Resolution notes
          <textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
        </label>

        <div className="row-actions">
          <button
            className="primary-button"
            disabled={busy || !notes.trim()}
            type="button"
            onClick={() => void submit()}
          >
            Resolve
          </button>
          <button className="ghost-button" disabled={busy} type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
