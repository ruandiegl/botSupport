import type { ConversationLabel } from "@/types";
import { Badge } from "@/components/ui/badge";

export function ConversationLabelBadge({ label }: { label: ConversationLabel }) {
  return (
    <Badge
      variant="outline"
      className="border-transparent font-semibold"
      style={{ color: label.color, backgroundColor: `${label.color}14`, boxShadow: `inset 0 0 0 1px ${label.color}35` }}
      title={label.name}
    >
      {label.name}
    </Badge>
  );
}
