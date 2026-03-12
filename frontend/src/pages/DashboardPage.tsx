import { useEffect, useState } from 'react';
import { MetricCard } from '../components/MetricCard';
import { SectionCard } from '../components/SectionCard';
import { loadDashboardMetrics, type DashboardMetric } from '../services/dashboardService';

const queueItems = [
  'North Hall projector maintenance due at 13:00',
  'Lab 3 energy spike detected above threshold',
  'Five room reservations pending admin review',
];

export function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);

  useEffect(() => {
    void loadDashboardMetrics().then(setMetrics);
  }, []);

  return (
    <div className="page-grid">
      <section className="hero-card">
        <p className="eyebrow">Operations snapshot</p>
        <h2>Keep facilities responsive, visible, and easy to coordinate.</h2>
        <p>
          The dashboard consolidates booking pressure, incident handling, and system health so
          teams can act early instead of reacting late.
        </p>
      </section>

      <section className="metrics-grid">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <SectionCard title="Priority queue">
        <ul className="timeline-list">
          {queueItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
