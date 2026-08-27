import { describe, expect, it } from "vitest";
import request from "supertest";
import { createHttpApp } from "../src/http/app";
import { HttpError } from "../src/http/errors";
import { createTestRouter } from "../src/modules/tests/test-router";
import { TestService } from "../src/modules/tests/test-service";
import { systemClock, systemRandom } from "../src/modules/tests/test-ports";
import {
  signSnapshot,
  verifySnapshot,
  type TestSnapshot,
} from "../src/modules/tests/test-token";
import type {
  VocabularyRecord,
  VocabularyRepository,
} from "../src/modules/vocabulary/vocabulary-repository";

const date = new Date("2026-08-27T00:00:00.000Z");
const records: VocabularyRecord[] = ["one", "two", "three", "four"].map(
  (word, index) => ({
    createdAt: date,
    folderId: "00000000-0000-4000-8000-000000000001",
    id: `00000000-0000-4000-8000-00000000000${index + 1}`,
    ipa: null,
    meaning: `${word} meaning`,
    updatedAt: date,
    word,
  }),
);
const repository: VocabularyRepository = {
  create: async () => {
    throw new Error("unused");
  },
  listByFolderId: async () => records,
};
const service = () =>
  new TestService(
    repository,
    "s".repeat(32),
    { now: () => date },
    { next: () => 0.1 },
  );

describe("TEST-007 test generation and signed tokens", () => {
  it("uses system ports and serves the test-start route", async () => {
    expect(systemClock.now()).toBeInstanceOf(Date);
    expect(systemRandom.next()).toBeGreaterThanOrEqual(0);
    const app = createHttpApp(
      { webOrigin: "http://localhost:5173" },
      (http) => {
        http.use(
          "/tests/:folderId",
          createTestRouter({
            generate: async () => ({
              testToken: "token",
              expiresAt: date.toISOString(),
              questions: [],
            }),
          } as unknown as TestService),
        );
      },
    );
    const response = await request(app).post(`/tests/${records[0]!.folderId}`);
    expect(response.status).toBe(201);
    expect(response.body.data.testToken).toBe("token");
  });
  it("maps unexpected start-route failures through the safe handler", async () => {
    const app = createHttpApp(
      { webOrigin: "http://localhost:5173" },
      (http) => {
        http.use(
          "/tests/:folderId",
          createTestRouter({
            generate: async () => {
              throw new Error("internal");
            },
          } as unknown as TestService),
        );
      },
    );
    const response = await request(app).post(`/tests/${records[0]!.folderId}`);
    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe("INTERNAL_ERROR");
  });
  it("generates one question per eligible word with four choices", async () => {
    const result = await service().generate(records[0]!.folderId);
    expect(result.questions).toHaveLength(4);
    expect(result.questions.every((q) => q.choices).valueOf()).toBe(true);
    expect(new Set(result.questions.map((q) => q.vocabularyId)).size).toBe(4);
    expect(result.questions.every((q) => new Set(q.choices).size === 4)).toBe(
      true,
    );
  });
  it("rejects fewer than four vocabulary items", async () => {
    const repo: VocabularyRepository = {
      ...repository,
      listByFolderId: async () => records.slice(0, 3),
    };
    await expect(
      new TestService(
        repo,
        "s".repeat(32),
        { now: () => date },
        { next: () => 0.1 },
      ).generate(records[0]!.folderId),
    ).rejects.toMatchObject({ status: 409, code: "TEST_INELIGIBLE" });
  });
  it("rejects repeated meanings", async () => {
    const items = records.map((r, i) => ({
      ...r,
      meaning: i < 2 ? "same" : r.meaning,
    }));
    const repo: VocabularyRepository = {
      ...repository,
      listByFolderId: async () => items,
    };
    await expect(
      new TestService(
        repo,
        "s".repeat(32),
        { now: () => date },
        { next: () => 0.1 },
      ).generate(records[0]!.folderId),
    ).rejects.toMatchObject({ status: 409, code: "TEST_INELIGIBLE" });
  });
  it("signs canonically and verifies before expiry", () => {
    const snapshot: TestSnapshot = {
      version: "v1",
      folderId: records[0]!.folderId,
      issuedAt: date.toISOString(),
      expiresAt: new Date(date.getTime() + 1800000).toISOString(),
      questions: [],
    };
    const token = signSnapshot(snapshot, "s".repeat(32));
    expect(token.startsWith("v1.")).toBe(true);
    expect(
      verifySnapshot(token, "s".repeat(32), new Date(date.getTime() + 1799000)),
    ).toEqual(snapshot);
    expect(signSnapshot(snapshot, "s".repeat(32))).toBe(token);
  });
  it("rejects exact expiry, tampering, malformed, and unsupported tokens safely", () => {
    const snapshot: TestSnapshot = {
      version: "v1",
      folderId: records[0]!.folderId,
      issuedAt: date.toISOString(),
      expiresAt: new Date(date.getTime() + 1800000).toISOString(),
      questions: [],
    };
    const token = signSnapshot(snapshot, "s".repeat(32));
    expect(() =>
      verifySnapshot(token, "s".repeat(32), new Date(date.getTime() + 1800000)),
    ).toThrowError(HttpError);
    expect(() =>
      verifySnapshot(`${token}x`, "s".repeat(32), date),
    ).toThrowError(/invalid/i);
    expect(() =>
      verifySnapshot("v2.bad.bad", "s".repeat(32), date),
    ).toThrowError(/invalid/i);
  });
});
