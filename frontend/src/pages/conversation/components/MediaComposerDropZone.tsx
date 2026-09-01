import type { ReactNode } from "react";
import { Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaClipboardDrop, type MediaInputSource } from "../hooks/use-media-clipboard-drop";

type Props = {
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  onFile: (file: File, source: MediaInputSource) => void;
  onError?: (message: string) => void;
};

export function MediaComposerDropZone({ children, disabled = false, className, onFile, onError }: Props) {
  const { isDragActive, onPaste, onDragEnter, onDragOver, onDragLeave, onDrop } = useMediaClipboardDrop({
    disabled,
    onFile,
    onError,
  });

  return (
    <div
      className={cn("relative", className)}
      role="group"
      aria-label="Área da conversa para arrastar arquivos"
      onPaste={onPaste}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      data-drag-active={isDragActive ? "true" : "false"}
    >
      {children}
      {isDragActive ? (
        <div
          className="pointer-events-none absolute inset-0 z-30 grid place-items-center rounded-xl border-2 border-dashed border-primary bg-primary/10 text-primary backdrop-blur-[1px]"
          aria-live="polite"
        >
          <span className="flex items-center gap-2 rounded-full border border-primary/30 bg-background/95 px-4 py-2 text-sm font-medium shadow-sm">
            <Paperclip data-icon="inline-start" />
            Solte um arquivo para anexar
          </span>
        </div>
      ) : null}
    </div>
  );
}
