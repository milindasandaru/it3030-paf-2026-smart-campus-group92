import { useEffect, useState, type FormEvent } from 'react';
import { createUser, fetchUsers } from '../api/authApi';
import { createNotification } from '../api/notificationsApi';
import type { UserRole, UserSummary } from '../api/types';
import { SectionCard } from '../components/SectionCard';

const roles: UserRole[] = ['ADMIN', 'LECTURER', 'STUDENT', 'STAFF', 'TECHNICIAN'];

export function AdminPanel() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');

  const [notificationUserId, setNotificationUserId] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  async function loadUsers() {
    try {
      const data = await fetchUsers();
      setUsers(data);
      if (!notificationUserId && data.length > 0) {
        setNotificationUserId(data[0].userId);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function onCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createUser({ email, fullName, role });
      setEmail('');
      setFullName('');
      setRole('STUDENT');
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  }

  async function onSendNotification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createNotification({
        userId: notificationUserId,
        message: notificationMessage,
        type: 'BOOKING_CREATED',
      });
      setNotificationMessage('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send notification');
    }
  }

  return (
    <SectionCard title="Admin control room">
      {loading ? <p>Loading admin data...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      <div className="details-grid admin-grid">
        <div>
          <h3>Users</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.userId}>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3>Create user</h3>
          <form className="booking-form" onSubmit={onCreateUser}>
            <label>
              Email
              <input
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
            <label>
              Full name
              <input
                onChange={(event) => setFullName(event.target.value)}
                required
                type="text"
                value={fullName}
              />
            </label>
            <label>
              Role
              <select onChange={(event) => setRole(event.target.value as UserRole)} value={role}>
                {roles.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleOption}
                  </option>
                ))}
              </select>
            </label>
            <button className="primary-button" type="submit">
              Create user
            </button>
          </form>

          <h3>Send notification</h3>
          <form className="booking-form" onSubmit={onSendNotification}>
            <label>
              Recipient
              <select
                onChange={(event) => setNotificationUserId(event.target.value)}
                required
                value={notificationUserId}
              >
                {users.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.fullName} ({user.role})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Message
              <input
                onChange={(event) => setNotificationMessage(event.target.value)}
                required
                type="text"
                value={notificationMessage}
              />
            </label>
            <button className="primary-button" type="submit">
              Send
            </button>
          </form>
        </div>
      </div>
    </SectionCard>
  );
}
