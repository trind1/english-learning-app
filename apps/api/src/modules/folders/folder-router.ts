import {
  createFolderRequestSchema,
  folderListResponseSchema,
  folderResponseSchema,
} from "@english-learning/contracts";
import { Router, type RequestHandler } from "express";
import { z } from "zod";

import { HttpError } from "../../http/errors";
import { FolderDuplicateError, FolderNotFoundError } from "./folder-errors";
import type { FolderService } from "./folder-service";

const folderIdSchema = z.string().uuid("Folder ID must be a valid identifier.");

const asyncHandler =
  (handler: RequestHandler): RequestHandler =>
  (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };

const mapFolderError = (error: unknown): never => {
  if (error instanceof FolderDuplicateError) {
    throw new HttpError(409, "FOLDER_DUPLICATE", error.message, [
      { message: "Choose a different folder name.", path: "name" },
    ]);
  }
  if (error instanceof FolderNotFoundError) {
    throw new HttpError(404, "FOLDER_NOT_FOUND", error.message);
  }
  throw error;
};

export const createFolderRouter = (service: FolderService): Router => {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_request, response) => {
      response.json(
        folderListResponseSchema.parse({
          data: { folders: await service.list() },
        }),
      );
    }),
  );

  router.post(
    "/",
    asyncHandler(async (request, response) => {
      const input = createFolderRequestSchema.parse(request.body);
      try {
        response.status(201).json(
          folderResponseSchema.parse({
            data: await service.create(input.name),
          }),
        );
      } catch (error) {
        mapFolderError(error);
      }
    }),
  );

  router.get(
    "/:folderId",
    asyncHandler(async (request, response) => {
      const folderId = folderIdSchema.parse(request.params.folderId);
      try {
        response.json(
          folderResponseSchema.parse({ data: await service.getById(folderId) }),
        );
      } catch (error) {
        mapFolderError(error);
      }
    }),
  );

  return router;
};
