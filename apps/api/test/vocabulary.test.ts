import { createVocabularyRequestSchema } from "@english-learning/contracts";
import { PrismaClient } from "@prisma/client";
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
import type {
  FolderRecord,
  FolderRepository,
} from "../src/modules/folders/folder-repository";
import { FolderService } from "../src/modules/folders/folder-service";
import type {
  CreateVocabularyRecord,
  VocabularyRecord,
  VocabularyRepository,
} from "../src/modules/vocabulary/vocabulary-repository";
import { createVocabularyRouter } from "../src/modules/vocabulary/vocabulary-router";
import { VocabularyService } from "../src/modules/vocabulary/vocabulary-service";
import {
  createMigratedTestDatabase,
  type TestDatabase,
} from "./support/database";

const webOrigin = "http://localhost:5173";

describe("TEST-005 vocabulary backend", () => {
  let database: TestDatabase;

  beforeAll(async () => {
    database = await createMigratedTestDatabase();
  });

  afterEach(async () => {
    await database.client.vocabulary.deleteMany();
    await database.client.folder.deleteMany();
  });

  afterAll(async () => {
    await database.dispose();
  });

  const createFolder = (name = "Travel") =>
    database.client.folder.create({
      data: { name, normalizedName: name.toLowerCase() },
    });

  it("returns an explicit empty list for an existing folder", async () => {
    const folder = await createFolder();
    const response = await request(
      createApiApp({ webOrigin }, database.client),
    ).get(`/api/v1/folders/${folder.id}/vocabulary`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      folder: { id: folder.id, name: "Travel", vocabularyCount: 0 },
      vocabulary: [],
    });
  });

  it.each([
    [{ meaning: "a trip", word: "" }, "word"],
    [{ meaning: "a trip", word: "   " }, "word"],
    [{ meaning: "a trip", word: "x".repeat(101) }, "word"],
    [{ meaning: "", word: "Journey" }, "meaning"],
    [{ meaning: " ", word: "Journey" }, "meaning"],
    [{ meaning: "x".repeat(501), word: "Journey" }, "meaning"],
    [{ ipa: "x".repeat(101), meaning: "a trip", word: "Journey" }, "ipa"],
  ])("rejects invalid vocabulary field boundaries", async (body, path) => {
    const folder = await createFolder();
    const response = await request(createApiApp({ webOrigin }, database.client))
      .post(`/api/v1/folders/${folder.id}/vocabulary`)
      .send(body);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(
      response.body.error.fieldErrors.some(
        (error: { path: string }) => error.path === path,
      ),
    ).toBe(true);
    await expect(database.client.vocabulary.count()).resolves.toBe(0);
  });

  it("rejects unknown fields", async () => {
    const folder = await createFolder();
    const response = await request(createApiApp({ webOrigin }, database.client))
      .post(`/api/v1/folders/${folder.id}/vocabulary`)
      .send({ meaning: "a trip", unknown: true, word: "Journey" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("trims and persists word and meaning boundaries with Unicode", async () => {
    const folder = await createFolder();
    const app = createApiApp({ webOrigin }, database.client);
    const minimum = await request(app)
      .post(`/api/v1/folders/${folder.id}/vocabulary`)
      .send({ meaning: " y ", word: " é " });
    const maximum = await request(app)
      .post(`/api/v1/folders/${folder.id}/vocabulary`)
      .send({ meaning: ` ${"m".repeat(500)} `, word: ` ${"w".repeat(100)} ` });

    expect(minimum.status).toBe(201);
    expect(minimum.body.data).toMatchObject({
      ipa: null,
      meaning: "y",
      word: "é",
    });
    expect(maximum.status).toBe(201);
    expect(maximum.body.data.word).toHaveLength(100);
    expect(maximum.body.data.meaning).toHaveLength(500);
  });

  it.each([
    [undefined, null],
    [null, null],
    ["   ", null],
    [`/${"a".repeat(98)}/`, `/${"a".repeat(98)}/`],
  ])(
    "normalizes optional IPA without fabricating a value",
    async (ipa, expected) => {
      const folder = await createFolder();
      const body = {
        meaning: "a trip",
        word: "Journey",
        ...(ipa === undefined ? {} : { ipa }),
      };
      const response = await request(
        createApiApp({ webOrigin }, database.client),
      )
        .post(`/api/v1/folders/${folder.id}/vocabulary`)
        .send(body);

      expect(response.status).toBe(201);
      expect(response.body.data.ipa).toBe(expected);
    },
  );

  it("rejects same-folder duplicates and allows the normalized word in another folder", async () => {
    const travel = await createFolder("Travel");
    const work = await createFolder("Work");
    const app = createApiApp({ webOrigin }, database.client);
    await request(app)
      .post(`/api/v1/folders/${travel.id}/vocabulary`)
      .send({ meaning: "a trip", word: "Journey" });
    const duplicate = await request(app)
      .post(`/api/v1/folders/${travel.id}/vocabulary`)
      .send({ meaning: "another trip", word: " journey " });
    const crossFolder = await request(app)
      .post(`/api/v1/folders/${work.id}/vocabulary`)
      .send({ meaning: "a trip", word: "JOURNEY" });

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error).toMatchObject({
      code: "VOCABULARY_DUPLICATE",
      fieldErrors: [{ path: "word" }],
    });
    expect(JSON.stringify(duplicate.body)).not.toContain("Prisma");
    expect(crossFolder.status).toBe(201);
    await expect(database.client.vocabulary.count()).resolves.toBe(2);
  });

  it("returns safe missing-folder errors for list and create", async () => {
    const missingId = "00000000-0000-4000-8000-000000000000";
    const app = createApiApp({ webOrigin }, database.client);
    const list = await request(app).get(
      `/api/v1/folders/${missingId}/vocabulary`,
    );
    const create = await request(app)
      .post(`/api/v1/folders/${missingId}/vocabulary`)
      .send({ meaning: "a trip", word: "Journey" });

    expect(list.status).toBe(404);
    expect(list.body.error.code).toBe("FOLDER_NOT_FOUND");
    expect(create.status).toBe(404);
    expect(create.body.error.code).toBe("FOLDER_NOT_FOUND");
  });

  it("persists vocabulary across a new Prisma client connection", async () => {
    const folder = await createFolder();
    await request(createApiApp({ webOrigin }, database.client))
      .post(`/api/v1/folders/${folder.id}/vocabulary`)
      .send({ ipa: "/ˈdʒɜːni/", meaning: "a trip", word: "Journey" });
    const reloadedClient = new PrismaClient({
      datasourceUrl: database.databaseUrl,
    });

    try {
      const response = await request(
        createApiApp({ webOrigin }, reloadedClient),
      ).get(`/api/v1/folders/${folder.id}/vocabulary`);
      expect(response.status).toBe(200);
      expect(response.body.data.vocabulary).toEqual([
        expect.objectContaining({
          ipa: "/ˈdʒɜːni/",
          meaning: "a trip",
          word: "Journey",
        }),
      ]);
    } finally {
      await reloadedClient.$disconnect();
    }
  });
});

describe("TEST-005 vocabulary unit and failure boundaries", () => {
  const date = new Date("2026-08-27T00:00:00.000Z");
  const folderRecord: FolderRecord = {
    createdAt: date,
    id: "00000000-0000-4000-8000-000000000001",
    name: "Travel",
    updatedAt: date,
    vocabularyCount: 0,
  };
  const vocabularyRecord: VocabularyRecord = {
    createdAt: date,
    folderId: folderRecord.id,
    id: "vocabulary-id",
    ipa: null,
    meaning: "a trip",
    updatedAt: date,
    word: "Journey",
  };

  const folderRepository: FolderRepository = {
    create: vi.fn(),
    findById: vi.fn(async () => folderRecord),
    list: vi.fn(),
  };

  it("keeps shared request parsing strict and normalizes blank IPA", () => {
    expect(
      createVocabularyRequestSchema.parse({
        ipa: " ",
        meaning: " a trip ",
        word: " Journey ",
      }),
    ).toEqual({ ipa: null, meaning: "a trip", word: "Journey" });
    expect(() =>
      createVocabularyRequestSchema.parse({
        meaning: "a trip",
        unknown: true,
        word: "Journey",
      }),
    ).toThrow();
  });

  it("maps repository records and owns normalization", async () => {
    const repository: VocabularyRepository = {
      create: vi.fn(async (input: CreateVocabularyRecord) => {
        void input;
        return vocabularyRecord;
      }),
      listByFolderId: vi.fn(async () => [vocabularyRecord]),
    };
    const service = new VocabularyService(
      repository,
      new FolderService(folderRepository),
    );

    await expect(
      service.create({
        folderId: folderRecord.id,
        ipa: " ",
        meaning: " a trip ",
        word: " Journey ",
      }),
    ).resolves.toMatchObject({ ipa: null, meaning: "a trip", word: "Journey" });
    expect(repository.create).toHaveBeenCalledWith({
      folderId: folderRecord.id,
      ipa: null,
      meaning: "a trip",
      normalizedWord: "journey",
      word: "Journey",
    });
    await expect(service.list(folderRecord.id)).resolves.toMatchObject({
      folder: { id: folderRecord.id },
      vocabulary: [{ id: "vocabulary-id" }],
    });
  });

  it("maps unexpected repository failures to a safe generic error envelope", async () => {
    const rawError = new Error("raw database address");
    const repository: VocabularyRepository = {
      create: vi.fn().mockRejectedValue(rawError),
      listByFolderId: vi.fn().mockRejectedValue(rawError),
    };
    const service = new VocabularyService(
      repository,
      new FolderService(folderRepository),
    );
    const app = createHttpApp({ webOrigin }, (expressApp) => {
      expressApp.use(
        "/api/v1/folders/:folderId/vocabulary",
        createVocabularyRouter(service),
      );
    });
    const response = await request(app).get(
      `/api/v1/folders/${folderRecord.id}/vocabulary`,
    );

    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe("INTERNAL_ERROR");
    expect(JSON.stringify(response.body)).not.toContain("raw database address");
  });
});
