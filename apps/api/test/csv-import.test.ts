import { describe, expect, it, vi } from "vitest";
import request from "supertest";

import { importCsv, parseCsv } from "../src/modules/vocabulary/csv-import";
import { createHttpApp } from "../src/http/app";
import { createVocabularyRouter } from "../src/modules/vocabulary/vocabulary-router";
import type { VocabularyService } from "../src/modules/vocabulary/vocabulary-service";
import type {
  ImportVocabularyRecord,
  VocabularyImportRepository,
} from "../src/modules/vocabulary/vocabulary-repository";

const makeService = () =>
  ({ getFolder: vi.fn(async () => undefined) }) as unknown as VocabularyService;
const record = (word: string) => ({
  createdAt: new Date(),
  folderId: "folder",
  id: word,
  ipa: null,
  meaning: "meaning",
  updatedAt: new Date(),
  word,
});
const repo = (existing: string[] = []): VocabularyImportRepository => ({
  create: vi.fn(),
  listByFolderId: vi.fn(async () => existing.map(record)),
  importRows: vi.fn(async (rows: readonly ImportVocabularyRecord[]) =>
    rows.map((row) => record(row.word)),
  ),
});

describe("TEST-006 CSV import contract", () => {
  it("TEST-006-01 imports valid rows", async () =>
    expect(
      (
        await importCsv(
          makeService(),
          repo(),
          "folder",
          Buffer.from("word,meaning\njourney,a trip\ntravel,go"),
        )
      ).importedCount,
    ).toBe(2));
  it("TEST-006-02 accepts BOM and header order", async () =>
    expect(
      (
        await importCsv(
          makeService(),
          repo(),
          "folder",
          Buffer.from("\uFEFFmeaning,word\na trip,journey"),
        )
      ).importedCount,
    ).toBe(1));
  it("TEST-006-03 rejects invalid headers", async () =>
    await expect(
      importCsv(
        makeService(),
        repo(),
        "folder",
        Buffer.from("word,unknown\na,b"),
      ),
    ).rejects.toThrow());
  it("TEST-006-04 handles empty and header-only files", async () =>
    expect(
      (
        await importCsv(
          makeService(),
          repo(),
          "folder",
          Buffer.from("word,meaning\n"),
        )
      ).totalRows,
    ).toBe(0));
  it("TEST-006-05 validates rows and preserves Unicode", async () =>
    expect(
      (
        await importCsv(
          makeService(),
          repo(),
          "folder",
          Buffer.from("word,meaning\né,旅行\n,missing"),
        )
      ).skippedCount,
    ).toBe(1));
  it("TEST-006-06 parses quoted commas", () =>
    expect(parseCsv('word,meaning\n"New York","a, place"')[1]).toEqual([
      "New York",
      "a, place",
    ]));
  it("TEST-006-07 skips within-file duplicates", async () =>
    expect(
      (
        await importCsv(
          makeService(),
          repo(),
          "folder",
          Buffer.from("word,meaning\nJourney,a\n journey ,b"),
        )
      ).skippedCount,
    ).toBe(1));
  it("TEST-006-08 skips stored duplicates", async () =>
    expect(
      (
        await importCsv(
          makeService(),
          repo(["journey"]),
          "folder",
          Buffer.from("word,meaning\nJourney,a"),
        )
      ).skippedCount,
    ).toBe(1));
  it("TEST-006-09 validates the destination folder", async () => {
    const missing = makeService();
    missing.getFolder = vi.fn(async () => {
      throw new Error("missing");
    }) as never;
    await expect(
      importCsv(missing, repo(), "folder", Buffer.from("word,meaning\na,b")),
    ).rejects.toThrow("missing");
  });
  it("TEST-006-10 rejects malformed CSV", () =>
    expect(() => parseCsv('word,meaning\n"unterminated,x')).toThrow());
  it("TEST-006-11 does not report rows when insertion fails", async () => {
    const failing = repo();
    failing.importRows = vi.fn().mockRejectedValue(new Error("rollback"));
    await expect(
      importCsv(
        makeService(),
        failing,
        "folder",
        Buffer.from("word,meaning\na,b"),
      ),
    ).rejects.toThrow("rollback");
  });
  it("TEST-006-12 propagates unexpected failures safely", async () => {
    const failing = repo();
    failing.listByFolderId = vi.fn().mockRejectedValue(new Error("internal"));
    await expect(
      importCsv(
        makeService(),
        failing,
        "folder",
        Buffer.from("word,meaning\na,b"),
      ),
    ).rejects.toThrow("internal");
  });

  it("covers parser quote, CRLF, and empty-buffer branches", async () => {
    expect(parseCsv('word,meaning\r\n"say ""hi""",ok\r\n')).toEqual([
      ["word", "meaning"],
      ['say "hi"', "ok"],
    ]);
    expect(
      (await importCsv(makeService(), repo(), "folder", Buffer.alloc(0)))
        .totalRows,
    ).toBe(0);
  });

  it("covers missing row fields and repository configuration failure", async () => {
    expect(
      (
        await importCsv(
          makeService(),
          repo(),
          "folder",
          Buffer.from("word,meaning\nonly"),
        )
      ).skippedCount,
    ).toBe(1);
    const app = createHttpApp(
      { webOrigin: "http://localhost:5173" },
      (root) => {
        root.use(
          "/api/v1/folders/:folderId/vocabulary",
          createVocabularyRouter(makeService()),
        );
      },
    );
    const response = await request(app)
      .post(
        "/api/v1/folders/00000000-0000-4000-8000-000000000001/vocabulary/import",
      )
      .attach("file", Buffer.from("word,meaning\na,b"), "vocabulary.csv");
    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe("INTERNAL_ERROR");
  });

  it("covers the multipart success path", async () => {
    const app = createHttpApp(
      { webOrigin: "http://localhost:5173" },
      (root) => {
        root.use(
          "/api/v1/folders/:folderId/vocabulary",
          createVocabularyRouter(makeService(), repo()),
        );
      },
    );
    const response = await request(app)
      .post(
        "/api/v1/folders/00000000-0000-4000-8000-000000000001/vocabulary/import",
      )
      .attach(
        "file",
        Buffer.from("word,meaning\njourney,a trip\n"),
        "vocabulary.csv",
      );
    expect(response.status).toBe(200);
    expect(response.body.data.importedCount).toBe(1);
  });

  it("covers multipart content and missing-part failures", async () => {
    const app = createHttpApp(
      { webOrigin: "http://localhost:5173" },
      (root) => {
        root.use(
          "/api/v1/folders/:folderId/vocabulary",
          createVocabularyRouter(makeService(), repo()),
        );
      },
    );
    const path =
      "/api/v1/folders/00000000-0000-4000-8000-000000000001/vocabulary/import";
    expect(
      (await request(app).post(path).send("word,meaning\na,b")).status,
    ).toBe(400);
    expect(
      (
        await request(app)
          .post(path)
          .set("content-type", "multipart/form-data; boundary=x")
          .send("bad")
      ).status,
    ).toBe(400);
  });

  it("covers multipart header and size error mappings", async () => {
    const app = createHttpApp(
      { webOrigin: "http://localhost:5173" },
      (root) => {
        root.use(
          "/api/v1/folders/:folderId/vocabulary",
          createVocabularyRouter(makeService(), repo()),
        );
      },
    );
    const path =
      "/api/v1/folders/00000000-0000-4000-8000-000000000001/vocabulary/import";
    const invalid = await request(app)
      .post(path)
      .attach("file", Buffer.from("bad\na"), "vocabulary.csv");
    expect(invalid.status).toBe(400);
    const oversized = await request(app)
      .post(path)
      .attach("file", Buffer.alloc(1024 * 1024 + 1), "vocabulary.csv");
    expect(oversized.status).toBe(413);
  });
});
