import type { PrismaClient } from "@prisma/client";
import express from "express";
import { resolve } from "node:path";

import type { ApiConfig } from "./config/environment";
import { createHttpApp } from "./http/app";
import { createFolderRouter } from "./modules/folders/folder-router";
import { FolderService } from "./modules/folders/folder-service";
import { PrismaFolderRepository } from "./modules/folders/prisma-folder-repository";
import { PrismaVocabularyRepository } from "./modules/vocabulary/prisma-vocabulary-repository";
import { createVocabularyRouter } from "./modules/vocabulary/vocabulary-router";
import { VocabularyService } from "./modules/vocabulary/vocabulary-service";
import { createTestRouter } from "./modules/tests/test-router";
import { TestService } from "./modules/tests/test-service";
import { systemClock, systemRandom } from "./modules/tests/test-ports";
import { createSessionRouter } from "./modules/tests/session-router";
import { PrismaSessionRepository } from "./modules/tests/session-repository";
import { SessionService } from "./modules/tests/session-service";
import { createDashboardRouter } from "./modules/dashboard/dashboard-router";
import { DashboardService } from "./modules/dashboard/dashboard-service";
import { PrismaDashboardRepository } from "./modules/dashboard/prisma-dashboard-repository";
import { createAiRouter } from "./modules/ai/ai-router";
import { AiService } from "./modules/ai/ai-service";

export const createApiApp = (
  config: Pick<ApiConfig, "webOrigin"> &
    Partial<Pick<ApiConfig, "testTokenSecret">>,
  client: PrismaClient,
  serveWeb = false,
) =>
  createHttpApp(config, (app) => {
    const folderService = new FolderService(new PrismaFolderRepository(client));
    app.use("/api/v1/folders", createFolderRouter(folderService));
    app.use(
      "/api/v1/dashboard",
      createDashboardRouter(
        new DashboardService(new PrismaDashboardRepository(client)),
      ),
    );
    app.use(
      "/api/v1/ai",
      createAiRouter(
        new AiService(
          {
            findByIds: async (ids) =>
              client.vocabulary.findMany({
                where: { id: { in: [...ids] } },
                select: { id: true, word: true },
              }),
          },
          undefined,
          10_000,
        ),
      ),
    );
    const vocabularyRepository = new PrismaVocabularyRepository(client);
    app.use(
      "/api/v1/folders/:folderId/vocabulary",
      createVocabularyRouter(
        new VocabularyService(vocabularyRepository, folderService),
        vocabularyRepository,
      ),
    );
    if (config.testTokenSecret) {
      app.use(
        "/api/v1/folders/:folderId/tests",
        createTestRouter(
          new TestService(
            vocabularyRepository,
            config.testTokenSecret,
            systemClock,
            systemRandom,
          ),
        ),
      );
      app.use(
        "/api/v1/test-sessions",
        createSessionRouter(
          new SessionService(
            new PrismaSessionRepository(client),
            vocabularyRepository,
            config.testTokenSecret,
            systemClock,
          ),
        ),
      );
    }
    if (serveWeb) {
      const webDist = resolve(process.cwd(), "../web/dist");
      app.use(express.static(webDist));
      app.get("*", (request, response, next) => {
        if (request.path.startsWith("/api/")) {
          next();
          return;
        }
        response.sendFile(resolve(webDist, "index.html"));
      });
    }
  });
