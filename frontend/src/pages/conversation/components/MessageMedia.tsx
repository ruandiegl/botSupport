import { useState } from "react";
import { AlertTriangle, Download, FileText, Headphones, Image as ImageIcon, Video } from "lucide-react";
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
      <Attachment orientation="vertical" className="w-64 max-w-full">
        <AttachmentMedia variant="image" className="aspect-video w-full">
          <img src={source} alt={media.caption || "Imagem recebida no WhatsApp"} loading="lazy" />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle className="flex items-center gap-2"><ImageIcon data-icon="inline-start" /> Imagem</AttachmentTitle>
          <AttachmentDescription>{metaLabel(media)}</AttachmentDescription>
        </AttachmentContent>
        <AttachmentTrigger aria-label="Ampliar imagem" onClick={() => setPreviewOpen(true)} />
      </Attachment>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl bg-background">
          <DialogHeader>
            <DialogTitle>Imagem recebida</DialogTitle>
            <DialogDescription>Prévia protegida pela sessão do atendimento.</DialogDescription>
          </DialogHeader>
          <div className="flex max-h-[70vh] items-center justify-center overflow-auto rounded-xl bg-muted p-2">
            {fullImageAccess.isLoading ? (
              <Skeleton className="h-[60vh] w-full" />
            ) : (
              <img className="max-h-[66vh] max-w-full rounded-lg object-contain" src={fullImageSource || source} alt={media.caption || "Imagem recebida no WhatsApp"} />
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <Badge variant="secondary">Expira em {new Date(media.expiresAt).toLocaleDateString("pt-BR")}</Badge>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
