import type { FolderSummary } from "@english-learning/contracts";
import { createFolderRequestSchema } from "@english-learning/contracts";
import type { PrismaClient } from "@prisma/client";
import request from "supertest";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { createApiApp } from "../src/app";
import { createHttpApp } from "../src/http/app";
import { FolderDuplicateError } from "../src/modules/folders/folder-errors";
import type {
  CreateFolderRecord,
  FolderRecord,
  FolderRepository,
} from "../src/modules/folders/folder-repository";
import { createFolderRouter } from "../src/modules/folders/folder-router";
import { FolderService } from "../src/modules/folders/folder-service";
import { PrismaFolderRepository } from "../src/modules/folders/prisma-folder-repository";
import {
  createMigratedTestDatabase,
  type TestDatabase,
} from "./support/database";

const webOrigin = "http://localhost:5173";

const createApp = (repository: FolderRepository) =>
  createHttpApp({ webOrigin }, (app) => {
    app.use(
      "/api/v1/folders",
      createFolderRouter(new FolderService(repository)),
    );
  });

describe("TEST-004 folder backend", () => {
  let database: TestDatabase;
  let repository: PrismaFolderRepository;

  beforeAll(async () => {
    database = await createMigratedTestDatabase();
    repository = new PrismaFolderRepository(database.client);
  });

  afterEach(async () => {
    await database.client.vocabulary.deleteMany();
    await database.client.folder.deleteMany();
  });

  afterAll(async () => {
    await database.dispose();
  });

  it("returns an explicit empty folder list", async () => {
    const response = await request(
      createApiApp({ webOrigin }, database.client),
    ).get("/api/v1/folders");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: { folders: [] } });
  });

  it.each(["", "   ", "x".repeat(51)])(
    "rejects invalid folder-name boundaries",
    async (name) => {
      const response = await request(createApp(repository))
        .post("/api/v1/folders")
        .send({ name });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
      expect(await database.client.folder.count()).toBe(0);
    },
  );

  it("rejects unknown request fields", async () => {
    const response = await request(createApp(repository))
      .post("/api/v1/folders")
      .send({ name: "Travel", unknown: true });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("trims and persists names at the 1 and 50 character boundaries", async () => {
    const app = createApp(repository);
    const oneCharacter = await request(app)
      .post("/api/v1/folders")
      .send({ name: " x " });
    const fiftyCharacters = await request(app)
      .post("/api/v1/folders")
      .send({ name: ` ${"y".repeat(50)} ` });

    expect(oneCharacter.status).toBe(201);
    expect(oneCharacter.body.data).toMatchObject({
      name: "x",
      vocabularyCount: 0,
    });
    expect(fiftyCharacters.status).toBe(201);
    expect(fiftyCharacters.body.data.name).toHaveLength(50);
    await expect(database.client.folder.count()).resolves.toBe(2);
  });

  it("rejects trimmed case-insensitive duplicates with a safe conflict", async () => {
    const app = createApp(repository);
    await request(app).post("/api/v1/folders").send({ name: "Travel" });
    const duplicate = await request(app)
      .post("/api/v1/folders")
      .send({ name: " travel " });

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error).toMatchObject({
      code: "FOLDER_DUPLICATE",
      fieldErrors: [{ path: "name" }],
    });
    expect(JSON.stringify(duplicate.body)).not.toContain("Prisma");
  });

  it("lists folders and returns detail with an accurate vocabulary count", async () => {
    const folder = await database.client.folder.create({
      data: { name: "Travel", normalizedName: "travel" },
    });
    await database.client.vocabulary.create({
      data: {
        folderId: folder.id,
        meaning: "a trip",
        normalizedWord: "journey",
        word: "Journey",
      },
    });
    const app = createApp(repository);

    const list = await request(app).get("/api/v1/folders");
    const detail = await request(app).get(`/api/v1/folders/${folder.id}`);

    expect(list.body.data.folders).toHaveLength(1);
    expect(detail.status).toBe(200);
    expect(detail.body.data).toMatchObject({
      id: folder.id,
      name: "Travel",
      vocabularyCount: 1,
    });
  });

  it("returns safe validation and not-found errors for folder IDs", async () => {
    const app = createApp(repository);
    const invalid = await request(app).get("/api/v1/folders/not-a-uuid");
    const missing = await request(app).get(
      "/api/v1/folders/00000000-0000-4000-8000-000000000000",
    );

    expect(invalid.status).toBe(400);
    expect(invalid.body.error.code).toBe("VALIDATION_ERROR");
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe("FOLDER_NOT_FOUND");
  });

  it("maps unexpected repository failures to a generic safe 500", async () => {
    const rawError = new Error("database location and raw query");
    const failingRepository: FolderRepository = {
      create: vi.fn().mockRejectedValue(rawError),
      findById: vi.fn().mockRejectedValue(rawError),
      list: vi.fn().mockRejectedValue(rawError),
    };
    const response = await request(createApp(failingRepository)).get(
      "/api/v1/folders",
    );

    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe("INTERNAL_ERROR");
    expect(JSON.stringify(response.body)).not.toContain("database location");
  });
});

describe("TEST-004 folder unit boundaries", () => {
  it("keeps shared request parsing strict", () => {
    expect(createFolderRequestSchema.parse({ name: " Travel " })).toEqual({
      name: "Travel",
    });
    expect(() =>
      createFolderRequestSchema.parse({ name: "Travel", extra: true }),
    ).toThrow();
  });

  it("maps records to transport-safe ISO timestamps", async () => {
    const date = new Date("2026-08-27T00:00:00.000Z");
    const record: FolderRecord = {
      createdAt: date,
      id: "folder-id",
      name: "Travel",
      updatedAt: date,
      vocabularyCount: 0,
    };
    const repository: FolderRepository = {
      create: vi.fn(async (input: CreateFolderRecord) => {
        void input;
        return record;
      }),
      findById: vi.fn(async () => record),
      list: vi.fn(async () => [record]),
    };
    const service = new FolderService(repository);
    const expected: FolderSummary = {
      createdAt: date.toISOString(),
      id: "folder-id",
      name: "Travel",
      updatedAt: date.toISOString(),
      vocabularyCount: 0,
    };

    await expect(service.create(" Travel ")).resolves.toEqual(expected);
    expect(repository.create).toHaveBeenCalledWith({
      name: "Travel",
      normalizedName: "travel",
    });
    await expect(service.getById("folder-id")).resolves.toEqual(expected);
    await expect(service.list()).resolves.toEqual([expected]);
  });

  it("does not hide an unexpected Prisma adapter failure", async () => {
    const rawError = new Error("connection failed");
    const client = {
      folder: { create: vi.fn().mockRejectedValue(rawError) },
    } as unknown as PrismaClient;

    await expect(
      new PrismaFolderRepository(client).create({
        name: "Travel",
        normalizedName: "travel",
      }),
    ).rejects.toBe(rawError);
  });

  it("maps Prisma duplicate errors without exposing the adapter", async () => {
    const repository: FolderRepository = {
      create: vi.fn().mockRejectedValue(new FolderDuplicateError()),
      findById: vi.fn(),
      list: vi.fn(),
    };

    await expect(
      new FolderService(repository).create("Travel"),
    ).rejects.toBeInstanceOf(FolderDuplicateError);
  });
});
