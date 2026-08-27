import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../../http/errors";
import type { TestService } from "./test-service";

export const createTestRouter = (service: TestService) => {
  const router = Router({ mergeParams: true });
  router.post("/", async (request, response, next) => {
    try {
      const folderId = z
        .string()
        .uuid()
        .parse((request.params as { folderId?: unknown }).folderId);
      response.status(201).json({ data: await service.generate(folderId) });
    } catch (error) {
      if (error instanceof HttpError) return next(error);
      next(error);
    }
  });
  return router;
};
