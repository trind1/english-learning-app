import { Prisma } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createMigratedTestDatabase,
  type TestDatabase,
} from "./support/database";

describe("TEST-003 Prisma migration and relational constraints", () => {
  let database: TestDatabase;

  beforeEach(async () => {
    database = await createMigratedTestDatabase();
  });

  afterEach(async () => {
    if (database) await database.dispose();
  });

  it("replays the migration into a fresh database with all approved models", async () => {
    await expect(database.client.folder.count()).resolves.toBe(0);
    await expect(database.client.vocabulary.count()).resolves.toBe(0);
    await expect(database.client.testSession.count()).resolves.toBe(0);
    await expect(database.client.testAnswer.count()).resolves.toBe(0);
  });

  it("enforces same-folder normalized vocabulary uniqueness but permits another folder", async () => {
    const firstFolder = await database.client.folder.create({
      data: { name: "Travel", normalizedName: "travel" },
    });
    const secondFolder = await database.client.folder.create({
      data: { name: "Work", normalizedName: "work" },
    });
    await database.client.vocabulary.create({
      data: {
        folderId: firstFolder.id,
        meaning: "a trip",
        normalizedWord: "journey",
        word: "Journey",
      },
    });

    await expect(
      database.client.vocabulary.create({
        data: {
          folderId: firstFolder.id,
          meaning: "another trip",
          normalizedWord: "journey",
          word: "journey",
        },
      }),
    ).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);

    await expect(
      database.client.vocabulary.create({
        data: {
          folderId: secondFolder.id,
          meaning: "a trip",
          normalizedWord: "journey",
          word: "Journey",
        },
      }),
    ).resolves.toMatchObject({
      folderId: secondFolder.id,
      normalizedWord: "journey",
    });
  });

  it("enforces replay-key uniqueness for completed sessions", async () => {
    const folder = await database.client.folder.create({
      data: { name: "Travel", normalizedName: "travel" },
    });
    const completedSession = {
      completedAt: new Date("2026-08-27T00:00:00.000Z"),
      completionKeyHash: "one-use-completion-hash",
      correctCount: 1,
      folderId: folder.id,
      incorrectCount: 0,
      totalQuestions: 1,
    };

    await database.client.testSession.create({ data: completedSession });

    await expect(
      database.client.testSession.create({ data: completedSession }),
    ).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
  });

  it("keeps folder history restrictive and cascades controlled session cleanup", async () => {
    const folder = await database.client.folder.create({
      data: { name: "Travel", normalizedName: "travel" },
    });
    const vocabulary = await database.client.vocabulary.create({
      data: {
        folderId: folder.id,
        meaning: "a trip",
        normalizedWord: "journey",
        word: "Journey",
      },
    });
    const session = await database.client.testSession.create({
      data: {
        completedAt: new Date("2026-08-27T00:00:00.000Z"),
        completionKeyHash: "cleanup-hash",
        correctCount: 1,
        folderId: folder.id,
        incorrectCount: 0,
        totalQuestions: 1,
      },
    });
    await database.client.testAnswer.create({
      data: {
        correctMeaning: "a trip",
        isCorrect: true,
        questionWord: "Journey",
        selectedMeaning: "a trip",
        sessionId: session.id,
        vocabularyId: vocabulary.id,
      },
    });

    await expect(
      database.client.folder.delete({ where: { id: folder.id } }),
    ).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
    await database.client.testSession.delete({ where: { id: session.id } });
    await expect(database.client.testAnswer.count()).resolves.toBe(0);
    await expect(database.client.vocabulary.count()).resolves.toBe(1);
  });

  it("rolls back a completed session when any answer insert fails", async () => {
    const folder = await database.client.folder.create({
      data: { name: "Travel", normalizedName: "travel" },
    });
    const vocabulary = await database.client.vocabulary.create({
      data: {
        folderId: folder.id,
        meaning: "a trip",
        normalizedWord: "journey",
        word: "Journey",
      },
    });

    await expect(
      database.client.$transaction(async (transaction) => {
        const session = await transaction.testSession.create({
          data: {
            completedAt: new Date("2026-08-27T00:00:00.000Z"),
            completionKeyHash: "rollback-hash",
            correctCount: 1,
            folderId: folder.id,
            incorrectCount: 1,
            totalQuestions: 2,
          },
        });
        const answer = {
          correctMeaning: "a trip",
          isCorrect: true,
          questionWord: "Journey",
          selectedMeaning: "a trip",
          sessionId: session.id,
          vocabularyId: vocabulary.id,
        };

        await transaction.testAnswer.create({ data: answer });
        await transaction.testAnswer.create({ data: answer });
      }),
    ).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);

    await expect(database.client.testSession.count()).resolves.toBe(0);
    await expect(database.client.testAnswer.count()).resolves.toBe(0);
  });
});
