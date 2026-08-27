import { Router } from "express";
import type { DashboardService } from "./dashboard-service";

export const createDashboardRouter = (service: DashboardService) => {
  const router = Router();
  router.get("/", async (_request, response, next) => {
    try {
      response.json({ data: await service.get() });
    } catch (error) {
      next(error);
    }
  });
  return router;
};
