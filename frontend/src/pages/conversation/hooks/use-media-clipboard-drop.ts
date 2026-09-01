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
  const subtype = mimeType.split("/")[1]?.split(";")[0]?.toLowerCase();
  if (subtype === "jpeg" || subtype === "jpg") return "jpg";
  if (subtype === "webp") return "webp";
  if (subtype === "gif") return "gif";
  return "png";
}

function mimeForName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase();
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "webp") return "image/webp";
  if (extension === "gif") return "image/gif";
  if (extension === "png") return "image/png";
  return "";
}

function ensureNamedImage(file: File) {
  const name = file.name?.trim();
  const mimeType = file.type?.toLowerCase() || (name ? mimeForName(name) : "") || "image/png";
  if (name && file.type) return file;
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  return new File([file], name || `captura-${stamp}.${extensionForMime(mimeType)}`, { type: mimeType });
}

function normalizeDroppedFile(file: File) {
  if (file.type || mimeForName(file.name || "")) return ensureNamedImage(file);
  return file;
}

function validateImage(file: File | null) {
  if (!file || file.size <= 0) return "Não foi possível ler a imagem. Copie ou arraste o arquivo novamente.";
  const mimeType = file.type.toLowerCase();
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mimeType)) {
    return "Este chat aceita imagens PNG, JPG, WebP ou GIF por colagem e arrastar e soltar. Use Anexar arquivo para outros formatos.";
  }
  return null;
}

function clipboardImages(event: ClipboardEvent) {
  const items = Array.from(event.clipboardData?.items ?? []);
  const images: File[] = [];
  for (const item of items) {
    if (item.kind !== "file" || !item.type.toLowerCase().startsWith("image/")) continue;
    const file = item.getAsFile();
    if (file) images.push(ensureNamedImage(file));
  }
  return images;
}

export function useMediaClipboardDrop({ disabled = false, onFile, onError }: Options): Handlers {
  const [isDragActive, setIsDragActive] = useState(false);
  const dragDepthRef = useRef(0);

  const reportError = useCallback((message: string) => {
    onError?.(message);
  }, [onError]);

  const onPaste = useCallback<ClipboardEventHandler<HTMLElement>>((event) => {
    if (disabled) return;
    const images = clipboardImages(event.nativeEvent);
    if (!images.length) return;
    event.preventDefault();
    if (images.length !== 1) {
      reportError("Envie uma imagem por vez para revisar e adicionar a legenda.");
      return;
    }
    const image = images[0];
    const error = validateImage(image);
    if (error) {
      reportError(error);
      return;
    }
    onFile(image, "clipboard");
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
      reportError("Envie uma imagem por vez para revisar e adicionar a legenda.");
      return;
    }

    const file = normalizeDroppedFile(files[0]);
    const error = validateImage(file);
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
