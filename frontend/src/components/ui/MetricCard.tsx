import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: ReactNode;
  note: ReactNode;
  tone?: "primary" | "success" | "warning" | "info";
  onClick?: () => void;
  selected?: boolean;
  ariaLabel?: string;
  testId?: string;
};

export function MetricCard({ label, value, note, tone = "primary", onClick, selected = false, ariaLabel, testId }: MetricCardProps) {
  const clickable = Boolean(onClick);
  return (
    <article
      className={`panel stat stat-${tone}${clickable ? " stat-clickable" : ""}${selected ? " stat-selected" : ""}`}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? ariaLabel ?? label : undefined}
      aria-pressed={clickable ? selected : undefined}
      data-testid={testId}
      onClick={onClick}
      onKeyDown={clickable ? (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </article>
  );
}
