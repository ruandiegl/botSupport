import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * The queue search is intentionally only a controlled filter. Results are
 * rendered by the same ConversationRow list as every other queue filter;
 * this component must never create a modal, popover, or second result list.
 */
export function GlobalConversationSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      const isEditing = Boolean(active && (["INPUT", "TEXTAREA"].includes(active.tagName) || active.isContentEditable));
      const isSearchShortcut = event.key === "/" || (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey));
      if (isSearchShortcut && !isEditing) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  return (
    <div className="global-search-field" role="search">
      <Search aria-hidden="true" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) {
            event.preventDefault();
            onChange("");
          }
        }}
        placeholder="Buscar em todas as conversas e mensagens"
        aria-label="Buscar em todas as conversas e mensagens"
        data-testid="input-global-search"
        className="h-8 border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Limpar busca"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
        >
          <X data-icon="inline-start" />
        </Button>
      ) : null}
    </div>
  );
}
