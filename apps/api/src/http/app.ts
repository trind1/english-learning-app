import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";

import type { ApiConfig } from "../config/environment";
import { errorHandler, notFoundHandler } from "./error-handler";
import { requestIdMiddleware } from "./request-id";

export type RegisterRoutes = (app: Express) => void;

export const createHttpApp = (
  config: Pick<ApiConfig, "webOrigin">,
  registerRoutes: RegisterRoutes = () => undefined,
): Express => {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      methods: ["GET", "POST"],
      origin: config.webOrigin,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(requestIdMiddleware);

  registerRoutes(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
