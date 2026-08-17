import { ShieldCheck } from "lucide-react";
import type { Conversation } from "@/types";
import type { ConversationMetricCounts } from "../hooks/use-queue";

export function QueueCard({ conversations, fixedCounts }: { conversations: Conversation[]; fixedCounts?: ConversationMetricCounts }) {
  const counts = fixedCounts
    ? { OPEN: fixedCounts.open, IN_PROGRESS: fixedCounts.inProgress, CLOSED: fixedCounts.closed }
    : {
        OPEN: conversations.filter((x) => x.status === "OPEN").length,
        IN_PROGRESS: conversations.filter((x) => x.status === "IN_PROGRESS").length,
        CLOSED: conversations.filter((x) => x.status === "CLOSED").length,
      };
  const total = Math.max(
    fixedCounts ? fixedCounts.all ?? fixedCounts.open + fixedCounts.inProgress + fixedCounts.closed : conversations.length,
    1
  );

  const items = [
    ["OPEN", "Em aberto", "warning"],
    ["IN_PROGRESS", "Em atendimento", "teal"],
    ["CLOSED", "Encerradas", "gold"],
  ] as const;

  return (
    <div className="panel queue-card">
      <div className="panel-title">
        <ShieldCheck size={17} />
        <h3>Pulso da operação</h3>
      </div>
      <div className="queue-list">
        {items.map(([key, label, color]) => (
          <div key={key}>
            <div className="queue-line">
              <span>
                <i className={`dot ${color}`} />
                {label}
              </span>
              <b>{counts[key as keyof typeof counts]}</b>
            </div>
            <div className="bar">
              <span
                style={{
                  width: `${Math.max(5, (counts[key as keyof typeof counts] / total) * 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
