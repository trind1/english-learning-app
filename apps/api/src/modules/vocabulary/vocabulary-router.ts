import {
  createVocabularyRequestSchema,
  vocabularyListResponseSchema,
  vocabularyResponseSchema,
} from "@english-learning/contracts";
import { Router, type Request, type RequestHandler } from "express";
import { z } from "zod";

import { HttpError } from "../../http/errors";
import { FolderNotFoundError } from "../folders/folder-errors";
import { VocabularyDuplicateError } from "./vocabulary-errors";
import type { VocabularyService } from "./vocabulary-service";
import { CsvFileError, CsvHeaderError, importCsv } from "./csv-import";
import type { VocabularyImportRepository } from "./vocabulary-repository";

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

const readMultipartFile = async (request: Request): Promise<Buffer> => {
  const contentType = request.get("content-type");
  if (!contentType?.startsWith("multipart/form-data;"))
    throw new CsvFileError("CSV upload must use multipart/form-data.");
  const boundary =
    /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType)?.[1] ??
    /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType)?.[2];
  if (!boundary) throw new CsvFileError("CSV upload boundary is missing.");
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request as unknown as AsyncIterable<
    Buffer | string
  >) {
    size += Buffer.byteLength(chunk);
    if (size > 1024 * 1024)
      throw new HttpError(
        413,
        "CSV_TOO_LARGE",
        "CSV file exceeds the 1 MiB limit.",
      );
    chunks.push(Buffer.from(chunk));
  }
  const body = Buffer.concat(chunks);
  const marker = Buffer.from(`--${boundary}`);
  const start = body.indexOf(Buffer.from("\r\n\r\n"));
  const end = body.lastIndexOf(marker);
  if (start < 0 || end < 0) throw new CsvFileError("CSV file part is missing.");
  return body.subarray(start + 4, end - 2);
};

export const createVocabularyRouter = (
  service: VocabularyService,
  importRepository?: VocabularyImportRepository,
): Router => {
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

  router.post(
    "/import",
    asyncHandler(async (request, response) => {
      if (!importRepository)
        throw new Error("Import repository is not configured.");
      const folderId = folderIdSchema.parse(request.params.folderId);
      try {
        const file = await readMultipartFile(request);
        const report = await importCsv(
          service,
          importRepository,
          folderId,
          file,
        );
        response.json({ data: report });
      } catch (error) {
        if (error instanceof CsvHeaderError)
          throw new HttpError(400, "CSV_HEADER_INVALID", error.message);
        if (error instanceof CsvFileError)
          throw new HttpError(400, "CSV_FILE_INVALID", error.message);
        mapVocabularyError(error);
      }
    }),
  );

  return router;
};
