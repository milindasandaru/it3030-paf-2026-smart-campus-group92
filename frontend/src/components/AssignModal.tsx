import { useEffect, useState } from 'react';
import { fetchUsers } from '../api/authApi';
import type { UserSummary } from '../api/types';

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (assigneeId: string) => Promise<void>;
}

export function AssignModal({ isOpen, onClose, onAssign }: AssignModalProps) {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void fetchUsers().then((rows) => {
      const technicians = rows.filter((user) => user.role === 'TECHNICIAN');
      setUsers(technicians);
      setSelectedUserId(technicians[0]?.userId ?? '');
    });
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const submit = async () => {
    if (!selectedUserId) {
      return;
    }

    setBusy(true);
    try {
      await onAssign(selectedUserId);
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
        aria-labelledby="assign-modal-title"
      >
        <h3 id="assign-modal-title">Assign technician</h3>
        <label>
          Technician
          <select
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
          >
            {users.map((user) => (
              <option key={user.userId} value={user.userId}>
                {user.fullName}
              </option>
            ))}
          </select>
        </label>
        <div className="row-actions">
          <button
            className="primary-button"
            disabled={busy || !selectedUserId}
            type="button"
            onClick={() => void submit()}
          >
            Assign
          </button>
          <button className="ghost-button" disabled={busy} type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
