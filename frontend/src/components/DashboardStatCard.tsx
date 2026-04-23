interface DashboardStatCardProps {
  title: string;
  value: number;
  description: string;
}

export function DashboardStatCard({ title, value, description }: DashboardStatCardProps) {
  return (
    <article className="dashboard-stat-card">
      <p className="dashboard-stat-card__title">{title}</p>
      <strong className="dashboard-stat-card__value">{value}</strong>
      <p className="dashboard-stat-card__description">{description}</p>
    </article>
  );
}
