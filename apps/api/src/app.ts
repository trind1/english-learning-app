import type { PrismaClient } from "@prisma/client";

import type { ApiConfig } from "./config/environment";
import { createHttpApp } from "./http/app";
import { createFolderRouter } from "./modules/folders/folder-router";
import { FolderService } from "./modules/folders/folder-service";
import { PrismaFolderRepository } from "./modules/folders/prisma-folder-repository";
import { PrismaVocabularyRepository } from "./modules/vocabulary/prisma-vocabulary-repository";
import { createVocabularyRouter } from "./modules/vocabulary/vocabulary-router";
import { VocabularyService } from "./modules/vocabulary/vocabulary-service";

export const createApiApp = (
  config: Pick<ApiConfig, "webOrigin">,
  client: PrismaClient,
) =>
  createHttpApp(config, (app) => {
    const folderService = new FolderService(new PrismaFolderRepository(client));
    app.use("/api/v1/folders", createFolderRouter(folderService));
    app.use(
      "/api/v1/folders/:folderId/vocabulary",
      createVocabularyRouter(
        new VocabularyService(
          new PrismaVocabularyRepository(client),
          folderService,
        ),
      ),
    );
  });
