import { useEffect, useRef, useState } from "react";
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

const ACCEPT = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "video/mp4", "video/webm", "video/3gpp",
  "audio/ogg", "audio/mpeg", "audio/mp3", "audio/mp4", "audio/wav", "audio/webm",
  "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "text/plain",
].join(",");

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mediaLabel(file: File) {
  if (file.type.startsWith("image/")) return "Imagem";
  if (file.type.startsWith("video/")) return "Vídeo";
  if (file.type.startsWith("audio/")) return "Áudio";
  return "Documento";
}

type Props = {
  file: File | null;
  onChange: (file: File | null) => void;
  caption?: string;
  onCaptionChange?: (caption: string) => void;
  disabled?: boolean;
  uploadProgress?: number | null;
};

export function MediaAttachmentPicker({ file, onChange, caption, onCaptionChange, disabled = false, uploadProgress = null }: Props) {
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

  const isUploading = uploadProgress !== null && uploadProgress !== undefined;
  const progressValue = Math.min(100, Math.max(0, uploadProgress ?? 0));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(event) => {
          const nextFile = event.target.files?.[0] ?? null;
          if (nextFile?.type.startsWith("image/")) {
            openEditor(nextFile);
          } else if (nextFile?.type.startsWith("video/")) {
            openVideoEditor(nextFile);
          } else {
            onChange(nextFile);
          }
          event.currentTarget.value = "";
        }}
        disabled={disabled}
        aria-label="Selecionar imagem, vídeo, áudio ou documento"
      />
      <Button type="button" variant="outline" size="sm" onClick={chooseFile} disabled={disabled}>
        <Paperclip data-icon="inline-start" /> Anexar arquivo
      </Button>
      {file ? (
        <Attachment
          state={isUploading ? (progressValue >= 100 ? "processing" : "uploading") : "done"}
          size="sm"
          orientation="horizontal"
          className="max-w-[min(100%,380px)]"
        >
          <AttachmentMedia variant={previewUrl ? "image" : "icon"}>
            {previewUrl && file.type.startsWith("image/") ? <img src={previewUrl} alt="Prévia do arquivo" /> : previewUrl && file.type.startsWith("video/") ? <video src={previewUrl} muted playsInline preload="metadata" aria-label="Prévia do vídeo" /> : file.type.startsWith("image/") ? <ImageIcon /> : <FileText />}
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle title={file.name}>{file.name}</AttachmentTitle>
            <AttachmentDescription>{mediaLabel(file)} · {formatBytes(file.size)}</AttachmentDescription>
            {isUploading ? (
              <div className="mt-1.5 flex min-w-32 flex-col gap-1" aria-live="polite">
                <Progress value={progressValue} aria-label={`Enviando ${mediaLabel(file).toLowerCase()}: ${progressValue}%`} />
                <span className="text-[11px] text-muted-foreground">
                  {progressValue >= 100 ? "Processando mídia…" : `${progressValue}% enviado`}
                </span>
              </div>
            ) : null}
          </AttachmentContent>
          <AttachmentActions>
            <Badge variant="secondary">{isUploading ? "Enviando" : "Pronto"}</Badge>
            {file.type.startsWith("image/") ? (
              <AttachmentAction type="button" size="icon-xs" aria-label="Editar imagem" onClick={() => openEditor(file)} disabled={disabled}>
                <Edit3 />
              </AttachmentAction>
            ) : null}
            {file.type.startsWith("video/") ? (
              <AttachmentAction type="button" size="icon-xs" aria-label="Editar vídeo" onClick={() => openVideoEditor(file)} disabled={disabled}>
                <Edit3 />
              </AttachmentAction>
            ) : null}
            <AttachmentAction type="button" size="icon-xs" aria-label="Remover arquivo" onClick={() => onChange(null)} disabled={disabled}>
              <X />
            </AttachmentAction>
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
        onApply={(editedFile) => {
          onChange(editedFile);
          setVideoEditorFile(null);
        }}
      />
    </div>
  );
}
