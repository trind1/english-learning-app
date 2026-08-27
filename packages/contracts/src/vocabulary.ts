import { z } from "zod";

import { folderSummarySchema } from "./folders";

export const vocabularyWordSchema = z
  .string()
  .trim()
  .min(1, "Word must contain 1 to 100 characters.")
  .max(100, "Word must contain 1 to 100 characters.");

export const vocabularyMeaningSchema = z
  .string()
  .trim()
  .min(1, "Meaning must contain 1 to 500 characters.")
  .max(500, "Meaning must contain 1 to 500 characters.");

export const vocabularyIpaSchema = z
  .union([
    z.string().trim().max(100, "IPA must contain no more than 100 characters."),
    z.null(),
  ])
  .optional()
  .transform((value) => value || null);

export const createVocabularyRequestSchema = z
  .object({
    ipa: vocabularyIpaSchema,
    meaning: vocabularyMeaningSchema,
    word: vocabularyWordSchema,
  })
  .strict();

export const vocabularyItemSchema = z
  .object({
    createdAt: z.string().datetime(),
    folderId: z.string().min(1),
    id: z.string().min(1),
    ipa: z.string().nullable(),
    meaning: z.string(),
    updatedAt: z.string().datetime(),
    word: z.string(),
  })
  .strict();

export const vocabularyResponseSchema = z
  .object({ data: vocabularyItemSchema })
  .strict();

export const vocabularyListResponseSchema = z
  .object({
    data: z
      .object({
        folder: folderSummarySchema,
        vocabulary: z.array(vocabularyItemSchema),
      })
      .strict(),
  })
  .strict();

export type CreateVocabularyRequest = z.infer<
  typeof createVocabularyRequestSchema
>;
export type VocabularyItem = z.infer<typeof vocabularyItemSchema>;
