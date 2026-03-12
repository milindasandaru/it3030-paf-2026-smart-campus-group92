export interface DashboardMetric {
  label: string;
  value: string;
  trend: string;
}

export async function loadDashboardMetrics(): Promise<DashboardMetric[]> {
  return [
    { label: 'Active bookings', value: '148', trend: '+12% this week' },
    { label: 'Open incidents', value: '23', trend: '4 urgent' },
    { label: 'Resources online', value: '96%', trend: 'Stable' },
  ];
}
