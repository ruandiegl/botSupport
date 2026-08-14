import { z } from "zod";

export const MediaAccessPurposeSchema = z.enum(["content", "thumbnail", "download"]);

export const MediaAccessBodySchema = z
  .object({
    purpose: MediaAccessPurposeSchema.default("content"),
  })
  .strict();

export type MediaAccessPurpose = z.infer<typeof MediaAccessPurposeSchema>;
