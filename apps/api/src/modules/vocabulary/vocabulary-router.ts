import {
  createVocabularyRequestSchema,
  vocabularyListResponseSchema,
  vocabularyResponseSchema,
} from "@english-learning/contracts";
import { Router, type RequestHandler } from "express";
import { z } from "zod";

import { HttpError } from "../../http/errors";
import { FolderNotFoundError } from "../folders/folder-errors";
import { VocabularyDuplicateError } from "./vocabulary-errors";
import type { VocabularyService } from "./vocabulary-service";

const folderIdSchema = z.string().uuid("Folder ID must be a valid identifier.");

const asyncHandler =
  (handler: RequestHandler): RequestHandler =>
  (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };

const mapVocabularyError = (error: unknown): never => {
  if (error instanceof VocabularyDuplicateError) {
    throw new HttpError(409, "VOCABULARY_DUPLICATE", error.message, [
      { message: "Choose a different word for this folder.", path: "word" },
    ]);
  }
  if (error instanceof FolderNotFoundError) {
    throw new HttpError(404, "FOLDER_NOT_FOUND", error.message);
  }
  throw error;
};

export const createVocabularyRouter = (service: VocabularyService): Router => {
  const router = Router({ mergeParams: true });

  router.get(
    "/",
    asyncHandler(async (request, response) => {
      const folderId = folderIdSchema.parse(request.params.folderId);
      try {
        response.json(
          vocabularyListResponseSchema.parse({
            data: await service.list(folderId),
          }),
        );
      } catch (error) {
        mapVocabularyError(error);
      }
    }),
  );

  router.post(
    "/",
    asyncHandler(async (request, response) => {
      const folderId = folderIdSchema.parse(request.params.folderId);
      const input = createVocabularyRequestSchema.parse(request.body);
      try {
        response.status(201).json(
          vocabularyResponseSchema.parse({
            data: await service.create({ folderId, ...input }),
          }),
        );
      } catch (error) {
        mapVocabularyError(error);
      }
    }),
  );

  return router;
};
