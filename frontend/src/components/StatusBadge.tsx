// interface StatusBadgeProps {
//   value: string;
// }

// export function StatusBadge({ value }: StatusBadgeProps) {
//   return (
//     <span className={`status-badge status-${value.toLowerCase().replace(/_/g, '-')}`}>{value}</span>
//   );
// }

type Status = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

const statusConfig: Record<Status, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'status-badge--pending' },
  APPROVED: { label: 'Approved', className: 'status-badge--approved' },
  REJECTED: { label: 'Rejected', className: 'status-badge--rejected' },
  CANCELLED: { label: 'Cancelled', className: 'status-badge--cancelled' },
};

export function StatusBadge({ value }: { value: string }) {
  const config = statusConfig[value as Status] ?? { label: value, className: '' };
  return <span className={`status-badge ${config.className}`}>{config.label}</span>;
}
