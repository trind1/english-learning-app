import { createHash } from "node:crypto";
import { HttpError } from "../../http/errors";
import type { VocabularyRepository } from "../vocabulary/vocabulary-repository";
import { verifySnapshot } from "./test-token";
import type { Clock } from "./test-ports";
import type { SessionRepository } from "./session-repository";

export class SessionService {
  public constructor(
    private readonly repository: SessionRepository,
    private readonly vocabulary: VocabularyRepository,
    private readonly secret: string,
    private readonly clock: Clock,
  ) {}
  public async complete(token: unknown, answers: unknown) {
    if (typeof token !== "string")
      throw new HttpError(
        400,
        "TEST_SUBMISSION_INVALID",
        "A test token is required.",
      );
    const snapshot = verifySnapshot(token, this.secret, this.clock.now());
    if (!Array.isArray(answers) || answers.length !== snapshot.questions.length)
      throw new HttpError(
        400,
        "TEST_SUBMISSION_INVALID",
        "Submit exactly one answer for every question.",
      );
    const seen = new Set<string>();
    const current = await this.vocabulary.listByFolderId(snapshot.folderId);
    for (const question of snapshot.questions) {
      const record = current.find((item) => item.id === question.vocabularyId);
      if (
        !record ||
        record.word !== question.word ||
        record.meaning !== question.correctMeaning ||
        record.ipa !== question.ipa ||
        record.folderId !== snapshot.folderId
      )
        throw new HttpError(
          409,
          "TEST_SNAPSHOT_STALE",
          "The test snapshot is no longer current.",
        );
    }
    const prepared = snapshot.questions.map((question) => {
      const answer = answers.find(
        (
          candidate,
        ): candidate is { vocabularyId: unknown; selectedMeaning: unknown } =>
          typeof candidate === "object" &&
          candidate !== null &&
          "vocabularyId" in candidate &&
          "selectedMeaning" in candidate &&
          (candidate as { vocabularyId: unknown }).vocabularyId ===
            question.vocabularyId,
      );
      if (
        !answer ||
        typeof answer.selectedMeaning !== "string" ||
        seen.has(question.vocabularyId) ||
        !question.choices.includes(answer.selectedMeaning)
      )
        throw new HttpError(
          400,
          "TEST_SUBMISSION_INVALID",
          "Answers must match the issued test questions.",
        );
      seen.add(question.vocabularyId);
      return {
        vocabularyId: question.vocabularyId,
        questionWord: question.word,
        selectedMeaning: answer.selectedMeaning,
        correctMeaning: question.correctMeaning,
        isCorrect: answer.selectedMeaning === question.correctMeaning,
      };
    });
    if (seen.size !== snapshot.questions.length)
      throw new HttpError(
        400,
        "TEST_SUBMISSION_INVALID",
        "Answers must cover every question.",
      );
    try {
      return await this.repository.complete({
        folderId: snapshot.folderId,
        completionKeyHash: createHash("sha256").update(token).digest("hex"),
        completedAt: this.clock.now(),
        answers: prepared,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unique constraint"))
        throw new HttpError(
          409,
          "TEST_ALREADY_COMPLETED",
          "This test has already been completed.",
        );
      throw error;
    }
  }
  public async get(id: string) {
    const result = await this.repository.findById(id);
    if (!result)
      throw new HttpError(
        404,
        "TEST_SESSION_NOT_FOUND",
        "The test session was not found.",
      );
    return result;
  }
}
