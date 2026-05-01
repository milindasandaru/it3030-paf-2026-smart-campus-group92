import type { UserRole } from '../api/types';

export function roleToDashboardPath(role: UserRole): string {
  if (role === 'ADMIN') {
    return '/admin-dashboard';
  }
  if (role === 'TECHNICIAN') {
    return '/technician-dashboard';
  }
  if (role === 'LECTURER') {
    return '/lecturer-dashboard';
  }
  if (role === 'STAFF') {
    return '/staff-dashboard';
  }
  return '/student-dashboard';
}
