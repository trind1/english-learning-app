import { describe, expect, it } from "vitest";
import {
  signSnapshot,
  type TestSnapshot,
} from "../src/modules/tests/test-token";
import { SessionService } from "../src/modules/tests/session-service";
import { createSessionRouter } from "../src/modules/tests/session-router";
import { createHttpApp } from "../src/http/app";
import request from "supertest";
import { createApiApp } from "../src/app";
import type {
  SessionRepository,
  SessionPublic,
} from "../src/modules/tests/session-repository";
import { PrismaSessionRepository } from "../src/modules/tests/session-repository";
import type {
  VocabularyRepository,
  VocabularyRecord,
} from "../src/modules/vocabulary/vocabulary-repository";

const folderId = "00000000-0000-4000-8000-000000000001";
const now = new Date("2026-08-27T00:00:00.000Z");
const secret = "s".repeat(32);
const vocab: VocabularyRecord[] = ["one", "two", "three", "four"].map(
  (word, i) => ({
    id: `00000000-0000-4000-8000-00000000000${i + 1}`,
    folderId,
    word,
    meaning: `${word} meaning`,
    ipa: null,
    createdAt: now,
    updatedAt: now,
  }),
);
const snapshot: TestSnapshot = {
  version: "v1",
  folderId,
  issuedAt: now.toISOString(),
  expiresAt: new Date(now.getTime() + 1800000).toISOString(),
  questions: vocab.map((v) => ({
    vocabularyId: v.id,
    word: v.word,
    ipa: v.ipa,
    correctMeaning: v.meaning,
    choices: [v.meaning, "other 1", "other 2", "other 3"],
  })),
};
const token = signSnapshot(snapshot, secret);
const vr: VocabularyRepository = {
  create: async () => {
    throw new Error("unused");
  },
  listByFolderId: async () => vocab,
};
class FakeRepo implements SessionRepository {
  sessions = new Map<string, SessionPublic>();
  async complete(input: Parameters<SessionRepository["complete"]>[0]) {
    if ([...this.sessions.values()].some((s) => s.folderId === input.folderId))
      throw new Error("Unique constraint");
    const s = {
      sessionId: "session-1",
      folderId: input.folderId,
      correctCount: input.answers.filter((a) => a.isCorrect).length,
      incorrectCount: input.answers.filter((a) => !a.isCorrect).length,
      totalCount: input.answers.length,
      completedAt: input.completedAt,
      answers: input.answers,
    };
    this.sessions.set(s.sessionId, s);
    return s;
  }
  async findById(id: string) {
    return this.sessions.get(id) ?? null;
  }
}
const answers = (mixed = false) =>
  snapshot.questions.map((q, i) => ({
    vocabularyId: q.vocabularyId,
    selectedMeaning: mixed && i % 2 ? q.choices[1]! : q.correctMeaning,
  }));
describe("TEST-008 session completion", () => {
  it("completes all-correct and mixed sessions", async () => {
    const repo = new FakeRepo();
    const s = new SessionService(repo, vr, secret, { now: () => now });
    await expect(s.complete(token, answers())).resolves.toMatchObject({
      correctCount: 4,
      totalCount: 4,
    });
    const mixedRepo = new FakeRepo();
    await expect(
      new SessionService(mixedRepo, vr, secret, { now: () => now }).complete(
        token,
        answers(true),
      ),
    ).resolves.toMatchObject({ correctCount: 2, incorrectCount: 2 });
  });
  it("rejects invalid submissions without persistence", async () => {
    const repo = new FakeRepo();
    const s = new SessionService(repo, vr, secret, { now: () => now });
    await expect(s.complete(undefined, [])).rejects.toMatchObject({
      code: "TEST_SUBMISSION_INVALID",
    });
    await expect(s.complete(token, answers().slice(1))).rejects.toMatchObject({
      code: "TEST_SUBMISSION_INVALID",
    });
    expect(repo.sessions.size).toBe(0);
  });
  it("rejects replay and retrieves the completed session", async () => {
    const repo = new FakeRepo();
    const s = new SessionService(repo, vr, secret, { now: () => now });
    await s.complete(token, answers());
    await expect(s.complete(token, answers())).rejects.toMatchObject({
      code: "TEST_ALREADY_COMPLETED",
    });
    await expect(s.get("session-1")).resolves.toMatchObject({
      correctCount: 4,
    });
    await expect(s.get("missing")).rejects.toMatchObject({
      code: "TEST_SESSION_NOT_FOUND",
    });
  });
  it("rejects stale snapshots and expired tokens", async () => {
    const repo = new FakeRepo();
    const stale = { ...vocab[0]!, meaning: "changed" };
    const staleService = new SessionService(
      repo,
      { ...vr, listByFolderId: async () => [stale, ...vocab.slice(1)] },
      secret,
      { now: () => now },
    );
    await expect(staleService.complete(token, answers())).rejects.toMatchObject(
      { code: "TEST_SNAPSHOT_STALE" },
    );
    const expired = new SessionService(repo, vr, secret, {
      now: () => new Date(now.getTime() + 1800000),
    });
    await expect(expired.complete(token, answers())).rejects.toMatchObject({
      code: "TEST_TOKEN_EXPIRED",
    });
  });
  it("propagates unexpected persistence failures", async () => {
    const failingRepository: SessionRepository = {
      complete: async () => {
        throw new Error("database unavailable");
      },
      findById: async () => null,
    };
    await expect(
      new SessionService(failingRepository, vr, secret, {
        now: () => now,
      }).complete(token, answers()),
    ).rejects.toThrow("database unavailable");
  });
});

describe("TEST-008 Prisma repository adapter", () => {
  it("persists and reconstructs session answers transactionally", async () => {
    const stored = {
      id: "session-1",
      folderId,
      completionKeyHash: "hash",
      totalQuestions: 1,
      correctCount: 1,
      incorrectCount: 0,
      completedAt: now,
    };
    const answer = {
      vocabularyId: vocab[0]!.id,
      questionWord: "one",
      selectedMeaning: "one meaning",
      correctMeaning: "one meaning",
      isCorrect: true,
      answeredAt: now,
    };
    const tx = {
      testSession: { create: async () => stored },
      testAnswer: { createMany: async () => undefined },
    };
    const client = {
      $transaction: async (fn: (value: typeof tx) => Promise<unknown>) =>
        fn(tx),
      testSession: {
        findUnique: async () => ({ ...stored, answers: [answer] }),
      },
    };
    const repo = new PrismaSessionRepository(client as never);
    await expect(
      repo.complete({
        folderId,
        completionKeyHash: "hash",
        completedAt: now,
        answers: [
          {
            vocabularyId: answer.vocabularyId,
            questionWord: answer.questionWord,
            selectedMeaning: answer.selectedMeaning,
            correctMeaning: answer.correctMeaning,
            isCorrect: true,
          },
        ],
      }),
    ).resolves.toMatchObject({ sessionId: "session-1", correctCount: 1 });
    await expect(repo.findById("session-1")).resolves.toMatchObject({
      sessionId: "session-1",
      answers: [{ vocabularyId: answer.vocabularyId }],
    });
    const missingClient = { testSession: { findUnique: async () => null } };
    await expect(
      new PrismaSessionRepository(missingClient as never).findById("missing"),
    ).resolves.toBeNull();
  });
});

describe("TEST-008 session router", () => {
  it("composes the approved session routes when configured", () => {
    expect(
      createApiApp(
        { webOrigin: "http://localhost:5173", testTokenSecret: secret },
        {} as never,
      ),
    ).toBeDefined();
  });
  it("serves completion and retrieval routes", async () => {
    const result = {
      sessionId: "session-1",
      folderId,
      correctCount: 1,
      incorrectCount: 0,
      totalCount: 1,
      completedAt: now,
      answers: [],
    };
    const app = createHttpApp({ webOrigin: "http://localhost:5173" }, (http) =>
      http.use(
        "/api/v1/test-sessions",
        createSessionRouter({
          complete: async () => result,
          get: async () => result,
        } as unknown as SessionService),
      ),
    );
    await expect(
      request(app)
        .post("/api/v1/test-sessions")
        .send({ testToken: token, answers: [] }),
    ).resolves.toMatchObject({ status: 201 });
    await expect(
      request(app).get("/api/v1/test-sessions/session-1"),
    ).resolves.toMatchObject({ status: 200 });
  });
  it("forwards completion and retrieval errors", async () => {
    const app = createHttpApp({ webOrigin: "http://localhost:5173" }, (http) =>
      http.use(
        "/api/v1/test-sessions",
        createSessionRouter({
          complete: async () => {
            throw new Error("failure");
          },
          get: async () => {
            throw new Error("failure");
          },
        } as unknown as SessionService),
      ),
    );
    await expect(
      request(app).post("/api/v1/test-sessions").send({}),
    ).resolves.toMatchObject({ status: 500 });
    await expect(
      request(app).get("/api/v1/test-sessions/session-1"),
    ).resolves.toMatchObject({ status: 500 });
  });
});
