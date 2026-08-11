import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: ReactNode;
  note: ReactNode;
  tone?: "primary" | "success" | "warning" | "info";
};

export function MetricCard({ label, value, note, tone = "primary" }: MetricCardProps) {
  return (
    <article className={`panel stat stat-${tone}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </article>
  );
}
