import { FileAudio, FileText, Film, Image as ImageIcon, RefreshCw } from "lucide-react";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Badge } from "@/components/ui/badge";
import type { OutgoingMedia } from "@/types";

function label(type: OutgoingMedia["type"]) {
  if (type === "IMAGE") return "Imagem enviada";
  if (type === "VIDEO") return "Vídeo enviado";
  if (type === "AUDIO") return "Áudio enviado";
  return "Documento enviado";
}

function Icon({ type }: { type: OutgoingMedia["type"] }) {
  if (type === "IMAGE") return <ImageIcon />;
  if (type === "VIDEO") return <Film />;
  if (type === "AUDIO") return <FileAudio />;
  return <FileText />;
}

export function OutgoingMediaCard({ media }: { media: OutgoingMedia }) {
  const failed = media.status === "FAILED";
  const sending = media.status === "PENDING" || media.status === "SENDING";
  return (
    <Attachment state={failed ? "error" : sending ? "uploading" : "done"} size="sm" className="max-w-full">
      <AttachmentMedia><Icon type={media.type} /></AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{media.fileName || label(media.type)}</AttachmentTitle>
        <AttachmentDescription>
          {failed ? "Falha ao enviar para o WhatsApp" : sending ? "Enviando para o WhatsApp…" : "Enviado · arquivo não retido por política de privacidade"}
        </AttachmentDescription>
      </AttachmentContent>
      <Badge variant={failed ? "destructive" : sending ? "outline" : "secondary"}>
        {failed ? "Falhou" : sending ? <><RefreshCw className="animate-spin" /> Enviando</> : "Enviado"}
      </Badge>
    </Attachment>
  );
}
