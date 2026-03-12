import type { PropsWithChildren, ReactNode } from 'react';

type SectionCardProps = PropsWithChildren<{
  title: string;
  action?: ReactNode;
}>;

export function SectionCard({ title, action, children }: SectionCardProps) {
  return (
    <section className="section-card">
      <header className="section-card__header">
        <h2>{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}
