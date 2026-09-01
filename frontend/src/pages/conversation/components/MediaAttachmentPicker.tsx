import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Edit3, FileText, Image as ImageIcon, Paperclip, X } from "lucide-react";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ImageEditorDialog } from "./ImageEditorDialog";
import { VideoEditorDialog } from "./VideoEditorDialog";
import type { VideoEdit } from "./video-processing";
import { MEDIA_ACCEPT, normalizeMediaFile, formatMediaBytes } from "./media-file";

function mediaLabel(file: File) {
  if (file.type.startsWith("image/")) return "Imagem";
  if (file.type.startsWith("video/")) return "Vídeo";
  if (file.type.startsWith("audio/")) return "Áudio";
  return "Documento";
}

type Props = {
  file: File | null;
  onChange: (file: File | null, edit?: VideoEdit | null) => void;
  caption?: string;
  onCaptionChange?: (caption: string) => void;
  disabled?: boolean;
  uploadProgress?: number | null;
  processing?: boolean;
  processingProgress?: number | null;
  onCancelUpload?: () => void;
  onValidationError?: (message: string | null) => void;
};

export type MediaAttachmentPickerHandle = {
  openFile: (file: File) => void;
};

export const MediaAttachmentPicker = forwardRef<MediaAttachmentPickerHandle, Props>(function MediaAttachmentPicker({ file, onChange, caption, onCaptionChange, disabled = false, uploadProgress = null, processing = false, processingProgress = null, onCancelUpload, onValidationError }, ref) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorFile, setEditorFile] = useState<File | null>(null);
  const [videoEditorOpen, setVideoEditorOpen] = useState(false);
  const [videoEditorFile, setVideoEditorFile] = useState<File | null>(null);

  useEffect(() => {
    if (!file || (!file.type.startsWith("image/") && !file.type.startsWith("video/"))) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
  }, [file]);

  const chooseFile = () => {
    if (!disabled) inputRef.current?.click();
  };

  const openEditor = (imageFile: File | null) => {
    if (!imageFile || !imageFile.type.startsWith("image/") || disabled) return;
    setEditorFile(imageFile);
    setEditorOpen(true);
  };

  const openVideoEditor = (videoFile: File | null) => {
    if (!videoFile || !videoFile.type.startsWith("video/") || disabled) return;
    setVideoEditorFile(videoFile);
    setVideoEditorOpen(true);
  };

  const handleFileSelection = useCallback((nextFile: File | null) => {
    onValidationError?.(null);
    if (!nextFile) {
      onChange(null);
      return;
    }
    const normalizedFile = normalizeMediaFile(nextFile);
    if (normalizedFile.type.startsWith("image/")) {
      openEditor(normalizedFile);
    } else if (normalizedFile.type.startsWith("video/")) {
      openVideoEditor(normalizedFile);
    } else {
      onChange(normalizedFile);
    }
  }, [disabled, onChange, onValidationError]);

  useImperativeHandle(ref, () => ({
    openFile: (nextFile) => handleFileSelection(nextFile),
  }), [handleFileSelection]);

  const isUploading = uploadProgress !== null && uploadProgress !== undefined;
  const isProcessing = processing;
  const isBusy = isUploading || isProcessing;
  const progressValue = Math.min(100, Math.max(0, isProcessing ? (processingProgress ?? 0) : (uploadProgress ?? 0)));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={MEDIA_ACCEPT}
        className="sr-only"
        onChange={(event) => {
          const nextFile = event.target.files?.[0] ?? null;
          handleFileSelection(nextFile);
          event.currentTarget.value = "";
        }}
        disabled={disabled}
        aria-label="Selecionar imagem, vídeo, áudio, documento ou arquivo ZIP"
      />
      <Button type="button" variant="outline" size="sm" onClick={chooseFile} disabled={disabled}>
        <Paperclip data-icon="inline-start" /> Anexar arquivo
      </Button>
      {file ? (
        <Attachment
          state={isBusy ? (progressValue >= 100 ? "processing" : "uploading") : "done"}
          size="sm"
          orientation="horizontal"
          className="max-w-[min(100%,380px)]"
        >
          <AttachmentMedia variant={previewUrl ? "image" : "icon"}>
            {previewUrl && file.type.startsWith("image/") ? <img src={previewUrl} alt="Prévia do arquivo" /> : previewUrl && file.type.startsWith("video/") ? <video src={previewUrl} muted playsInline preload="metadata" aria-label="Prévia do vídeo" /> : file.type.startsWith("image/") ? <ImageIcon /> : <FileText />}
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle title={file.name}>{file.name}</AttachmentTitle>
            <AttachmentDescription>{mediaLabel(file)} · {formatMediaBytes(file.size)}</AttachmentDescription>
            {isBusy ? (
              <div className="mt-1.5 flex min-w-32 flex-col gap-1" aria-live="polite">
                <Progress value={progressValue} aria-label={`${isProcessing ? "Processando" : "Enviando"} ${mediaLabel(file).toLowerCase()}: ${progressValue}%`} />
                <span className="text-[11px] text-muted-foreground">
                  {isProcessing ? `Preparando vídeo… ${progressValue}%` : progressValue >= 100 ? "Processando mídia…" : `${progressValue}% enviado`}
                </span>
              </div>
            ) : null}
          </AttachmentContent>
          <AttachmentActions>
            <Badge variant="secondary">{isProcessing ? "Preparando" : isUploading ? "Enviando" : "Pronto"}</Badge>
            {isBusy ? (
              <AttachmentAction
                type="button"
                size="icon-xs"
                aria-label="Cancelar envio"
                title="Cancelar envio"
                onClick={onCancelUpload}
                disabled={!onCancelUpload}
              >
                <X />
              </AttachmentAction>
            ) : null}
            {!isBusy && file.type.startsWith("image/") ? (
              <AttachmentAction type="button" size="icon-xs" aria-label="Editar imagem" onClick={() => openEditor(file)} disabled={disabled}>
                <Edit3 />
              </AttachmentAction>
            ) : null}
            {!isBusy && file.type.startsWith("video/") ? (
              <AttachmentAction type="button" size="icon-xs" aria-label="Editar vídeo" onClick={() => openVideoEditor(file)} disabled={disabled}>
                <Edit3 />
              </AttachmentAction>
            ) : null}
            {!isBusy ? (
              <AttachmentAction type="button" size="icon-xs" aria-label="Remover arquivo" onClick={() => onChange(null)} disabled={disabled}>
                <X />
              </AttachmentAction>
            ) : null}
          </AttachmentActions>
        </Attachment>
      ) : null}
      <ImageEditorDialog
        file={editorFile}
        open={editorOpen}
        caption={caption}
        onCaptionChange={onCaptionChange}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open) setEditorFile(null);
        }}
        onApply={(editedFile) => {
          onChange(editedFile);
          setEditorFile(null);
        }}
      />
      <VideoEditorDialog
        file={videoEditorFile}
        open={videoEditorOpen}
        caption={caption}
        onCaptionChange={onCaptionChange}
        onOpenChange={(open) => {
          setVideoEditorOpen(open);
          if (!open) setVideoEditorFile(null);
        }}
        onApply={(editedFile, edit) => {
          onChange(editedFile, edit);
          setVideoEditorFile(null);
        }}
      />
    </div>
  );
});

MediaAttachmentPicker.displayName = "MediaAttachmentPicker";
