import { useEffect, useState } from "react";
import { AlertTriangle, Download, FileText, Headphones, Image as ImageIcon, Video, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { requestMediaAccess, resolveMediaUrl, useMediaAccess } from "../hooks/use-media-access";

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
  const [zoom, setZoom] = useState(1);
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

  useEffect(() => {
    if (previewOpen) setZoom(1);
  }, [previewOpen]);

  if (!media.available) return <MediaUnavailable media={media} />;

  if (media.type === "DOCUMENT") {
    const download = async () => {
      setDownloading(true);
      setDownloadError(null);
      try {
        const result = await requestMediaAccess(conversationId, messageId, "download");
        window.location.assign(resolveMediaUrl(result.url));
      } catch (error) {
        setDownloadError(error instanceof Error ? error.message : "Não foi possível baixar o documento.");
      } finally {
        setDownloading(false);
      }
    };
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
      <Attachment orientation="vertical" className="w-72 max-w-full">
        <AttachmentMedia variant="image" className="aspect-video w-full">
          <video className="aspect-video w-full object-cover" controls preload="metadata" src={source}>
            Seu navegador não reproduz vídeo.
          </video>
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle className="flex items-center gap-2"><Video data-icon="inline-start" /> Vídeo</AttachmentTitle>
          <AttachmentDescription>{metaLabel(media)}</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    );
  }

  return (
    <>
      <Attachment orientation="vertical" className="w-80 max-w-full">
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
        <DialogContent className="w-[calc(100vw-2rem)] sm:w-[60vw] max-w-[720px] aspect-square bg-card p-4 text-card-foreground ring-border">
          <DialogHeader>
            <DialogTitle>Imagem recebida</DialogTitle>
            <DialogDescription>Prévia protegida pela sessão do atendimento.</DialogDescription>
          </DialogHeader>
          <div
            className="flex min-h-0 aspect-square items-center justify-center overflow-hidden rounded-xl bg-muted p-2"
            onWheel={(event) => {
              event.preventDefault();
              setZoom((current) => Math.min(4, Math.max(1, current + (event.deltaY < 0 ? 0.15 : -0.15))));
            }}
            onDoubleClick={() => setZoom((current) => current === 1 ? 2 : 1)}
            aria-label="Área de zoom da imagem"
          >
            {fullImageAccess.isLoading ? (
              <Skeleton className="size-full" />
            ) : (
              <img
                className="max-h-full max-w-full rounded-lg object-contain transition-transform duration-150"
                style={{ transform: `scale(${zoom})` }}
                src={fullImageSource || source}
                alt={media.caption || "Imagem recebida no WhatsApp"}
              />
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1" aria-label="Controles de zoom">
              <Button variant="outline" size="icon-sm" aria-label="Reduzir zoom" title="Reduzir zoom" disabled={zoom <= 1} onClick={() => setZoom((current) => Math.max(1, current - 0.25))}><ZoomOut /></Button>
              <span className="min-w-12 text-center text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
              <Button variant="outline" size="icon-sm" aria-label="Aumentar zoom" title="Aumentar zoom" disabled={zoom >= 4} onClick={() => setZoom((current) => Math.min(4, current + 0.25))}><ZoomIn /></Button>
              <Button variant="ghost" size="icon-sm" aria-label="Redefinir zoom" title="Redefinir zoom" disabled={zoom === 1} onClick={() => setZoom(1)}><RotateCcw /></Button>
            </div>
            <Badge variant="secondary">Expira em {new Date(media.expiresAt).toLocaleDateString("pt-BR")}</Badge>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
