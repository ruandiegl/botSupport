import { z } from "zod";

export const UpdateZApiConfigSchema = z.object({
  instanceId: z.string().min(1, "ID da Instância é obrigatório"),
  token: z.string().min(1, "Token da Instância é obrigatório").optional(),
  clientToken: z.string().optional(),
  webhookUrl: z.string().optional(),
  isActive: z.boolean().optional(),
  autoReply: z.boolean().optional(),
  groupsEnabled: z.boolean().optional(),
  groupCooldownSeconds: z.number().int().min(5).max(3600).optional(),
  groupConfirmInGroup: z.boolean().optional(),
  groupConfirmMessage: z.string().trim().max(1000).nullable().optional().superRefine((value, context) => {
    const unknown = value?.match(/{{\s*([^}]+)\s*}}/g)?.filter((item) => !/^{{\s*(nome|grupo)\s*}}$/.test(item));
    if (unknown?.length) context.addIssue({ code: z.ZodIssueCode.custom, message: "Use somente as variáveis {{nome}} e {{grupo}}." });
  }),
}).strict();

export const TestZApiConnectionSchema = z.object({
  instanceId: z.string().optional(),
  token: z.string().optional(),
});

const HttpsUrlSchema = z
  .string()
  .url("URL de mídia inválida")
  .max(4096)
  .refine((value) => value.startsWith("https://"), "A URL de mídia deve usar HTTPS");

const ImageMimeSchema = z.string().min(1).max(160).refine(
  (value) => value.toLowerCase().startsWith("image/") && !value.toLowerCase().startsWith("image/svg"),
  "MIME incompatível com imagem",
);
const AudioMimeSchema = z.string().min(1).max(160).refine(
  (value) => value.toLowerCase().startsWith("audio/"),
  "MIME incompatível com áudio",
);
const VideoMimeSchema = z.string().min(1).max(160).refine(
  (value) => value.toLowerCase().startsWith("video/"),
  "MIME incompatível com vídeo",
);
const DocumentMimeSchema = z.string().min(1).max(160).refine((value) => {
  const mime = value.split(";")[0].trim().toLowerCase();
  return mime === "application/pdf" || mime === "application/msword" || mime.startsWith("application/vnd.") || mime === "application/zip" || mime === "text/plain" || mime === "text/csv";
}, "MIME incompatível com documento");

const ImageMediaSchema = z
  .object({
    mimeType: ImageMimeSchema,
    imageUrl: HttpsUrlSchema.optional(),
    thumbnailUrl: HttpsUrlSchema.optional(),
    downloadError: z.string().max(500).nullable().optional(),
    caption: z.string().max(4096).optional().default(""),
    width: z.number().int().nonnegative().max(100_000).optional(),
    height: z.number().int().nonnegative().max(100_000).optional(),
    viewOnce: z.boolean().optional().default(false),
  })
  .passthrough()
  .superRefine((value, context) => {
    if (!value.downloadError && !value.imageUrl) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["imageUrl"], message: "imageUrl é obrigatória" });
    }
  });

const AudioMediaSchema = z
  .object({
    ptt: z.boolean().optional(),
    seconds: z.number().int().nonnegative().max(86_400).optional(),
    audioUrl: HttpsUrlSchema,
    mimeType: AudioMimeSchema,
    viewOnce: z.boolean().optional().default(false),
  })
  .passthrough();

const VideoMediaSchema = z
  .object({
    videoUrl: HttpsUrlSchema,
    caption: z.string().max(4096).optional().default(""),
    mimeType: VideoMimeSchema,
    seconds: z.number().int().nonnegative().max(86_400).optional(),
    viewOnce: z.boolean().optional().default(false),
  })
  .passthrough();

const DocumentMediaSchema = z
  .object({
    documentUrl: HttpsUrlSchema,
    mimeType: DocumentMimeSchema,
    title: z.string().max(300).optional(),
    fileName: z.string().max(300).optional(),
    pageCount: z.number().int().nonnegative().max(100_000).optional(),
  })
  .passthrough();

const MentionItemSchema = z.union([z.string().max(200), z.record(z.unknown())]);
const MentionFieldSchema = z.union([MentionItemSchema, z.array(MentionItemSchema).max(100)]);

export const ZApiReceivedWebhookSchema = z
  .object({
    messageId: z.string().min(1).max(300),
    phone: z.union([z.string(), z.number()]).transform(String),
    momment: z.number().int().nonnegative(),
    fromMe: z.boolean(),
    type: z.literal("ReceivedCallback"),
    isGroup: z.boolean().optional(),
    isNewsletter: z.boolean().optional(),
    isStatusReply: z.boolean().optional(),
    broadcast: z.boolean().optional(),
    notification: z.unknown().optional(),
    instanceId: z.string().max(300).optional(),
    connectedPhone: z.string().max(200).optional(),
    connectedLid: z.string().max(200).nullable().optional(),
    senderName: z.string().max(300).optional(),
    pushName: z.string().max(300).optional(),
    chatName: z.string().max(300).optional(),
    participant: z.string().max(200).optional(),
    participantPhone: z.string().max(200).nullable().optional(),
    participantLid: z.string().max(200).nullable().optional(),
    mentionedJids: MentionFieldSchema.optional(),
    mentionedJid: MentionFieldSchema.optional(),
    mentions: MentionFieldSchema.optional(),
    mentioned: MentionFieldSchema.optional(),
    text: z.union([z.string(), z.object({ message: z.string().max(4096).optional() }).passthrough()]).optional(),
    body: z.string().max(4096).optional(),
    caption: z.string().max(4096).optional(),
    message: z.string().max(4096).optional(),
    buttonsResponseMessage: z
      .object({ buttonId: z.union([z.string(), z.number()]).optional(), message: z.string().max(4096).optional() })
      .passthrough()
      .optional(),
    listResponseMessage: z
      .object({ selectedRowId: z.union([z.string(), z.number()]).optional(), title: z.string().max(4096).optional(), message: z.string().max(4096).optional() })
      .passthrough()
      .optional(),
    image: ImageMediaSchema.optional(),
    audio: AudioMediaSchema.optional(),
    video: VideoMediaSchema.optional(),
    document: DocumentMediaSchema.optional(),
  })
  .passthrough()
  .superRefine((value, context) => {
    const mediaCount = [value.image, value.audio, value.video, value.document].filter(Boolean).length;
    if (mediaCount > 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["media"],
        message: "O callback pode conter no máximo uma mídia",
      });
    }
  });

export type UpdateZApiConfig = z.infer<typeof UpdateZApiConfigSchema>;
export type TestZApiConnection = z.infer<typeof TestZApiConnectionSchema>;
export type ZApiReceivedWebhook = z.infer<typeof ZApiReceivedWebhookSchema>;
