import { useCallback, useEffect, useRef, useState } from "react";
import type { ClipboardEventHandler, DragEventHandler } from "react";
import { normalizeMediaFile } from "../components/media-file";

export type MediaInputSource = "clipboard" | "drop";

type Options = {
  disabled?: boolean;
  onFile: (file: File, source: MediaInputSource) => void;
  onError?: (message: string) => void;
};

type Handlers = {
  isDragActive: boolean;
  onPaste: ClipboardEventHandler<HTMLElement>;
  onDragEnter: DragEventHandler<HTMLElement>;
  onDragOver: DragEventHandler<HTMLElement>;
  onDragLeave: DragEventHandler<HTMLElement>;
  onDrop: DragEventHandler<HTMLElement>;
};

function hasFiles(dataTransfer: DataTransfer | null) {
  return Boolean(dataTransfer?.types?.includes("Files") || dataTransfer?.files?.length);
}

function validateFile(file: File | null) {
  if (!file || file.size <= 0) return "Não foi possível ler o arquivo. Copie ou arraste o arquivo novamente.";
  return null;
}

function clipboardFiles(event: ClipboardEvent) {
  const data = event.clipboardData;
  const files: File[] = [];
  const seen = new Set<string>();
  const addFile = (file: File | null) => {
    if (!file) return;
    const key = `${file.name}|${file.size}|${file.type}`;
    if (seen.has(key)) return;
    seen.add(key);
    files.push(normalizeMediaFile(file));
  };

  // ClipboardItem is the most reliable source for screenshots and copied
  // documents. The files collection is kept as a fallback for browsers that
  // expose a copied PDF only there.
  const items = Array.from(data?.items ?? []);
  for (const item of items) {
    if (item.kind === "file") addFile(item.getAsFile());
  }
  for (const file of Array.from(data?.files ?? [])) addFile(file);
  return files;
}

export function useMediaClipboardDrop({ disabled = false, onFile, onError }: Options): Handlers {
  const [isDragActive, setIsDragActive] = useState(false);
  const dragDepthRef = useRef(0);

  const reportError = useCallback((message: string) => {
    onError?.(message);
  }, [onError]);

  const onPaste = useCallback<ClipboardEventHandler<HTMLElement>>((event) => {
    if (disabled) return;
    const files = clipboardFiles(event.nativeEvent);
    // If the clipboard contains only text, let the focused textarea handle it
    // normally. Files are intercepted so they can open the attachment flow.
    if (!files.length) return;
    event.preventDefault();
    if (files.length !== 1) {
      reportError("Envie um arquivo por vez para anexar.");
      return;
    }
    const file = files[0];
    const error = validateFile(file);
    if (error) {
      reportError(error);
      return;
    }
    onFile(file, "clipboard");
  }, [disabled, onFile, reportError]);

  const onDragEnter = useCallback<DragEventHandler<HTMLElement>>((event) => {
    if (!hasFiles(event.dataTransfer)) return;
    event.preventDefault();
    if (disabled) return;
    dragDepthRef.current += 1;
    setIsDragActive(true);
  }, [disabled]);

  const onDragOver = useCallback<DragEventHandler<HTMLElement>>((event) => {
    if (!hasFiles(event.dataTransfer)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = disabled ? "none" : "copy";
    if (disabled) return;
    setIsDragActive(true);
  }, [disabled]);

  const onDragLeave = useCallback<DragEventHandler<HTMLElement>>((event) => {
    if (!hasFiles(event.dataTransfer)) return;
    event.preventDefault();
    if (disabled) return;
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setIsDragActive(false);
  }, [disabled]);

  const onDrop = useCallback<DragEventHandler<HTMLElement>>((event) => {
    if (!hasFiles(event.dataTransfer)) return;
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDragActive(false);
    if (disabled) return;

    const files = Array.from(event.dataTransfer.files ?? []);
    if (files.length !== 1) {
      reportError("Envie um arquivo por vez para anexar.");
      return;
    }

    const file = normalizeMediaFile(files[0]);
    const error = validateFile(file);
    if (error) {
      reportError(error);
      return;
    }
    onFile(file, "drop");
  }, [disabled, onFile, reportError]);

  useEffect(() => () => {
    dragDepthRef.current = 0;
  }, []);

  useEffect(() => {
    if (!disabled) return;
    dragDepthRef.current = 0;
    setIsDragActive(false);
  }, [disabled]);

  return { isDragActive, onPaste, onDragEnter, onDragOver, onDragLeave, onDrop };
}
