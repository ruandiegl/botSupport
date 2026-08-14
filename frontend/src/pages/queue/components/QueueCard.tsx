import { ShieldCheck } from "lucide-react";
import type { Conversation } from "@/types";
import type { ConversationMetricCounts } from "../hooks/use-queue";

export function QueueCard({ conversations, fixedCounts }: { conversations: Conversation[]; fixedCounts?: ConversationMetricCounts }) {
  const counts = fixedCounts
    ? { QUEUED: fixedCounts.queued, IN_PROGRESS: fixedCounts.inProgress, BOT: fixedCounts.bot, CLOSED: fixedCounts.closed }
    : {
        QUEUED: conversations.filter((x) => x.status === "QUEUED").length,
        IN_PROGRESS: conversations.filter((x) => x.status === "IN_PROGRESS").length,
        BOT: conversations.filter((x) => x.status === "BOT").length,
        CLOSED: conversations.filter((x) => x.status === "CLOSED").length,
      };
  const total = Math.max(fixedCounts ? fixedCounts.queued + fixedCounts.inProgress + fixedCounts.bot + fixedCounts.closed : conversations.length, 1);

  const items = [
    ["QUEUED", "Aguardando", ""],
    ["IN_PROGRESS", "Em atendimento", "teal"],
    ["BOT", "No bot", "slate"],
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
