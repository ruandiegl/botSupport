import { useCallback, useEffect, useRef, useState } from "react";
import type { ClipboardEventHandler, DragEventHandler } from "react";

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

function extensionForMime(mimeType: string) {
  const normalized = mimeType.split(";")[0].trim().toLowerCase();
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/3gpp": "3gp",
    "video/quicktime": "mov",
    "audio/ogg": "ogg",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/mp4": "m4a",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/webm": "webm",
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "text/plain": "txt",
  };
  if (extensions[normalized]) return extensions[normalized];
  if (normalized === "application/octet-stream") return "bin";
  const subtype = normalized.split("/")[1]?.replace(/[^a-z0-9]+/g, "");
  return subtype || "bin";
}

function mimeForName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase();
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "webp") return "image/webp";
  if (extension === "gif") return "image/gif";
  if (extension === "png") return "image/png";
  if (extension === "mp4") return "video/mp4";
  if (extension === "webm") return "video/webm";
  if (extension === "3gp" || extension === "3gpp") return "video/3gpp";
  if (extension === "mov") return "video/quicktime";
  if (extension === "ogg" || extension === "oga") return "audio/ogg";
  if (extension === "mp3" || extension === "mpeg") return "audio/mpeg";
  if (extension === "m4a") return "audio/mp4";
  if (extension === "wav") return "audio/wav";
  if (extension === "pdf") return "application/pdf";
  if (extension === "doc") return "application/msword";
  if (extension === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (extension === "xls") return "application/vnd.ms-excel";
  if (extension === "xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (extension === "ppt") return "application/vnd.ms-powerpoint";
  if (extension === "pptx") return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  if (extension === "txt") return "text/plain";
  return "";
}

function normalizeFile(file: File) {
  const name = file.name?.trim();
  const declaredMime = file.type?.split(";")[0].trim().toLowerCase();
  const inferredMime = name ? mimeForName(name) : "";
  // Chromium can expose a pasted file as application/octet-stream (or with no
  // MIME at all). Prefer the extension in that case so PDFs and office files
  // reach the same attachment flow as files selected with the picker.
  const mimeType = declaredMime && declaredMime !== "application/octet-stream"
    ? declaredMime
    : inferredMime || declaredMime || "application/octet-stream";
  if (name && declaredMime === mimeType) return file;
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const prefix = mimeType.startsWith("image/") ? "captura" : "arquivo";
  return new File([file], name || `${prefix}-${stamp}.${extensionForMime(mimeType)}`, { type: mimeType });
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
    files.push(normalizeFile(file));
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

    const file = normalizeFile(files[0]);
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
