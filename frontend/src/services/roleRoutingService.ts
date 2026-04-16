import type { UserRole } from '../context/auth-context';

export function roleToDashboardPath(role: UserRole): string {
  if (role === 'ADMIN') {
    return '/admin/dashboard';
  }
  if (role === 'LECTURER') {
    return '/lecturer/dashboard';
  }
  return '/student/dashboard';
}