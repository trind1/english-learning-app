import { Router } from "express";
import type { AiService } from "./ai-service";
export const createAiRouter = (service: AiService) => {
  const router = Router();
  router.post("/text", async (req, res, next) => {
    try {
      res.json({ data: await service.generate(req.body?.vocabularyIds) });
    } catch (e) {
      next(e);
    }
  });
  return router;
};
