import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AlertTriangle, Download, FileText, Headphones, Image as ImageIcon, Move, Video, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import type { ConversationMedia } from "@/types";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { requestMediaAccess, resolveMediaUrl, useMediaAccess } from "../hooks/use-media-access";
import { VideoPlayerDialog } from "./VideoPlayerDialog";

type Props = {
  conversationId: string;
  messageId: string;
  media: ConversationMedia;
};

function mediaLabel(media: ConversationMedia) {
  if (media.type === "IMAGE") return "Imagem";
  if (media.type === "AUDIO") return media.ptt ? "Mensagem de voz" : "Áudio";
  if (media.type === "VIDEO") return "Vídeo";
  return media.fileName || media.title || "Documento";
}

function metaLabel(media: ConversationMedia) {
  const details: string[] = [];
  if (media.seconds) details.push(`${Math.floor(media.seconds / 60)}:${String(media.seconds % 60).padStart(2, "0")}`);
  if (media.pageCount) details.push(`${media.pageCount} página${media.pageCount === 1 ? "" : "s"}`);
  details.push(`disponível até ${new Date(media.expiresAt).toLocaleDateString("pt-BR")}`);
  return details.join(" · ");
}

function mediaExtension(media: ConversationMedia) {
  const mime = media.mimeType?.split(";")[0].trim().toLowerCase();
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
    "text/csv": "csv",
    "application/zip": "zip",
  };
  return extensions[mime] || (media.type === "VIDEO" ? "mp4" : media.type === "AUDIO" ? "ogg" : media.type === "IMAGE" ? "jpg" : "bin");
}

function downloadFileName(media: ConversationMedia, messageId: string) {
  const provided = (media.fileName || media.title || "").trim();
  const baseName = provided || `${media.type.toLowerCase()}-${messageId}`;
  return /\.[a-z0-9]{1,8}$/i.test(baseName) ? baseName : `${baseName}.${mediaExtension(media)}`;
}

function unavailableMessage(media: ConversationMedia) {
  if (media.status === "EXPIRED") return "A mídia expirou após a janela de retenção de 30 dias.";
  if (media.viewOnce) return "Mídias de visualização única não ficam disponíveis na plataforma.";
  return "A Z-API não conseguiu disponibilizar este arquivo.";
}

function MediaUnavailable({ media }: { media: ConversationMedia }) {
  return (
    <Attachment state="error" className="w-full">
      <AttachmentMedia><AlertTriangle data-icon="inline-start" /></AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{mediaLabel(media)}</AttachmentTitle>
        <AttachmentDescription>{unavailableMessage(media)}</AttachmentDescription>
      </AttachmentContent>
    </Attachment>
  );
}

export function MessageMedia({ conversationId, messageId, media }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, imageX: 0, imageY: 0 });
  const purpose = media.type === "IMAGE" && media.hasThumbnail ? "thumbnail" : "content";
  const shouldLoad = media.available && media.type !== "DOCUMENT";
  const access = useMediaAccess(conversationId, messageId, purpose, shouldLoad);
  const source = access.data ? resolveMediaUrl(access.data.url) : null;
  const fullImageAccess = useMediaAccess(
    conversationId,
    messageId,
    "content",
    media.type === "IMAGE" && previewOpen && purpose === "thumbnail",
  );
  const fullImageSource = fullImageAccess.data ? resolveMediaUrl(fullImageAccess.data.url) : source;
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const clampPosition = useCallback((next: { x: number; y: number }, nextZoom = zoom) => {
    const stage = stageRef.current;
    const image = imageRef.current;
    if (!stage || !image || nextZoom <= 1) return { x: 0, y: 0 };

    const maxX = Math.max(0, (image.clientWidth * nextZoom - stage.clientWidth) / 2);
    const maxY = Math.max(0, (image.clientHeight * nextZoom - stage.clientHeight) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  }, [zoom]);

  useEffect(() => {
    if (previewOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [previewOpen]);

  useEffect(() => {
    setPosition((current) => clampPosition(current, zoom));
  }, [clampPosition, zoom]);

  useEffect(() => {
    const handleResize = () => setPosition((current) => clampPosition(current));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [clampPosition]);

  const beginPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (zoom <= 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      imageX: position.x,
      imageY: position.y,
    };
    setDragging(true);
  };

  const movePan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const start = dragStartRef.current;
    setPosition(clampPosition({
      x: start.imageX + event.clientX - start.pointerX,
      y: start.imageY + event.clientY - start.pointerY,
    }));
  };

  const endPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  };

  const download = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      const result = await requestMediaAccess(conversationId, messageId, "download");
      const anchor = document.createElement("a");
      anchor.href = resolveMediaUrl(result.url);
      // Incoming videos frequently do not include a filename in the Z-API
      // payload. Always provide a real extension so the downloaded bytes are
      // recognized by WhatsApp, Windows and media players.
      anchor.download = downloadFileName(media, messageId);
      anchor.rel = "noreferrer";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : `Não foi possível baixar ${mediaLabel(media).toLowerCase()}.`);
    } finally {
      setDownloading(false);
    }
  };

  if (!media.available) return <MediaUnavailable media={media} />;

  if (media.type === "DOCUMENT") {
    return (
      <Attachment className="w-full">
        <AttachmentMedia><FileText data-icon="inline-start" /></AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>{mediaLabel(media)}</AttachmentTitle>
          <AttachmentDescription>{downloadError || metaLabel(media)}</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Baixar documento" onClick={download} disabled={downloading}>
            <Download data-icon="icon" />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    );
  }

  if (access.isLoading) return <Skeleton className="h-20 w-64 max-w-full" />;
  if (access.isError || !source) return <MediaUnavailable media={{ ...media, status: "UNAVAILABLE", available: false }} />;

  if (media.type === "AUDIO") {
    return (
      <Attachment className="w-full">
        <AttachmentMedia><Headphones data-icon="inline-start" /></AttachmentMedia>
        <AttachmentContent className="min-w-52">
          <AttachmentTitle>{mediaLabel(media)}</AttachmentTitle>
          <audio className="mt-2 w-full" controls preload="metadata" src={source}>Seu navegador não reproduz áudio.</audio>
          <AttachmentDescription>{metaLabel(media)}</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    );
  }

  if (media.type === "VIDEO") {
    return (
      <>
        <Attachment orientation="vertical" className="w-72 max-w-full">
          <AttachmentMedia variant="image" className="relative aspect-video w-full bg-black">
            <video className="aspect-video w-full object-cover" muted playsInline preload="metadata" src={source} aria-label="Prévia do vídeo recebido" />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/15">
              <span className="flex size-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg">
                <Video className="size-5" aria-hidden="true" />
              </span>
            </span>
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle className="flex items-center gap-2"><Video data-icon="inline-start" /> Vídeo</AttachmentTitle>
            <AttachmentDescription>{metaLabel(media)}</AttachmentDescription>
          </AttachmentContent>
          <AttachmentTrigger aria-label="Abrir player de vídeo" onClick={() => setVideoOpen(true)} />
        </Attachment>
        <VideoPlayerDialog
          open={videoOpen}
          onOpenChange={setVideoOpen}
          source={source}
          media={media}
          onDownload={download}
          downloading={downloading}
          downloadError={downloadError}
        />
      </>
    );
  }

  return (
    <>
      <Attachment orientation="vertical" className="w-96 max-w-full">
        <AttachmentMedia variant="image" className="aspect-[4/3] w-full bg-muted">
          <img className="h-full w-full object-contain" src={source} alt={media.caption || "Imagem recebida no WhatsApp"} loading="lazy" />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle className="flex items-center gap-2"><ImageIcon data-icon="inline-start" /> Imagem</AttachmentTitle>
          <AttachmentDescription>{metaLabel(media)}</AttachmentDescription>
        </AttachmentContent>
        <AttachmentTrigger aria-label="Ampliar imagem" onClick={() => setPreviewOpen(true)} />
      </Attachment>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="!grid !h-[88dvh] !w-[94vw] !max-w-[1200px] grid-rows-[auto_minmax(0,1fr)_auto] gap-3 overflow-hidden bg-card p-4 text-card-foreground ring-border sm:!max-w-[1200px]">
          <DialogHeader className="shrink-0 pr-10">
            <DialogTitle>Imagem recebida</DialogTitle>
            <DialogDescription>Prévia protegida pela sessão do atendimento.</DialogDescription>
          </DialogHeader>
          <div
            ref={stageRef}
            className={cn(
              "relative flex min-h-0 items-center justify-center overflow-hidden rounded-xl bg-muted p-3",
              zoom > 1 ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in",
            )}
            onWheel={(event) => {
              event.preventDefault();
              setZoom((current) => Math.min(4, Math.max(1, current + (event.deltaY < 0 ? 0.15 : -0.15))));
            }}
            onDoubleClick={() => {
              setZoom((current) => current === 1 ? 2 : 1);
              if (zoom > 1) setPosition({ x: 0, y: 0 });
            }}
            onPointerDown={beginPan}
            onPointerMove={movePan}
            onPointerUp={endPan}
            onPointerCancel={endPan}
            style={{ touchAction: "none" }}
            aria-label="Área de zoom da imagem"
          >
            {fullImageAccess.isLoading ? (
              <Skeleton className="size-full" />
            ) : (
              <img
                ref={imageRef}
                className="max-h-full max-w-full select-none rounded-lg object-contain"
                style={{
                  transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${zoom})`,
                  transformOrigin: "center",
                  transition: dragging ? "none" : "transform 150ms ease-out",
                  pointerEvents: "none",
                }}
                src={fullImageSource || source}
                alt={media.caption || "Imagem recebida no WhatsApp"}
                draggable={false}
                onLoad={() => setPosition((current) => clampPosition(current))}
              />
            )}
            <Badge className="pointer-events-none absolute bottom-3 left-3" variant="secondary">
              <Move data-icon="inline-start" />
              {zoom > 1 ? "Arraste para navegar" : "Amplie para navegar pela imagem"}
            </Badge>
          </div>
          <DialogFooter className="!mx-0 !mb-0 !flex-row flex-wrap items-center justify-between rounded-lg border bg-muted/50 p-2 sm:justify-between">
            <div className="flex items-center gap-1" aria-label="Controles de zoom">
              <Button variant="outline" size="icon-sm" aria-label="Reduzir zoom" title="Reduzir zoom" disabled={zoom <= 1} onClick={() => setZoom((current) => Math.max(1, current - 0.25))}><ZoomOut data-icon="icon" /></Button>
              <span className="min-w-12 text-center text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
              <Button variant="outline" size="icon-sm" aria-label="Aumentar zoom" title="Aumentar zoom" disabled={zoom >= 4} onClick={() => setZoom((current) => Math.min(4, current + 0.25))}><ZoomIn data-icon="icon" /></Button>
              <Button variant="ghost" size="icon-sm" aria-label="Redefinir zoom" title="Redefinir zoom" disabled={zoom === 1} onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }); }}><RotateCcw data-icon="icon" /></Button>
            </div>
            <Badge variant="secondary">Expira em {new Date(media.expiresAt).toLocaleDateString("pt-BR")}</Badge>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
