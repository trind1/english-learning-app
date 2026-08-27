import { z } from "zod";

export const folderNameSchema = z
  .string()
  .trim()
  .min(1, "Folder name must contain 1 to 50 characters.")
  .max(50, "Folder name must contain 1 to 50 characters.");

export const createFolderRequestSchema = z
  .object({ name: folderNameSchema })
  .strict();

export const folderSummarySchema = z
  .object({
    createdAt: z.string().datetime(),
    id: z.string().min(1),
    name: z.string(),
    updatedAt: z.string().datetime(),
    vocabularyCount: z.number().int().nonnegative(),
  })
  .strict();

export const folderResponseSchema = z
  .object({ data: folderSummarySchema })
  .strict();

export const folderListResponseSchema = z
  .object({
    data: z.object({ folders: z.array(folderSummarySchema) }).strict(),
  })
  .strict();

export type CreateFolderRequest = z.infer<typeof createFolderRequestSchema>;
export type FolderSummary = z.infer<typeof folderSummarySchema>;
