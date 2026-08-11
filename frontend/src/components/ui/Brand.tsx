import { Bot } from "lucide-react";

type BrandProps = {
  compact?: boolean;
};

export function Brand({ compact = false }: BrandProps) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`} aria-label="GTF Bot">
      <div className="brand-mark" aria-hidden="true">
        <Bot size={18} strokeWidth={2.25} />
      </div>
      <div className="brand-copy">
        <div className="brand-name">
          GTF<span>Bot</span>
        </div>
        {!compact && <div className="brand-kicker">Torre Forte / Operação</div>}
      </div>
    </div>
  );
}
