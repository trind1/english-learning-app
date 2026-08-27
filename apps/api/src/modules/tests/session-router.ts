import { Router } from "express";
import { z } from "zod";
import type { SessionService } from "./session-service";
export const createSessionRouter = (service: SessionService) => {
  const router = Router();
  router.post("/", async (req, res, next) => {
    try {
      const body = req.body as { testToken?: unknown; answers?: unknown };
      res
        .status(201)
        .json({ data: await service.complete(body.testToken, body.answers) });
    } catch (e) {
      next(e);
    }
  });
  router.get("/:sessionId", async (req, res, next) => {
    try {
      const id = z.string().min(1).parse(req.params.sessionId);
      res.json({ data: await service.get(id) });
    } catch (e) {
      next(e);
    }
  });
  return router;
};
