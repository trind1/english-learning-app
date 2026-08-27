import type {
  VocabularyRecord,
  VocabularyRepository,
} from "../vocabulary/vocabulary-repository";
import { HttpError } from "../../http/errors";
import { signSnapshot } from "./test-token";
import type { Clock, RandomSource } from "./test-ports";

const shuffle = <T>(items: readonly T[], random: RandomSource): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random.next() * (i + 1));
    const current = result[i];
    result[i] = result[j] as T;
    result[j] = current as T;
  }
  return result;
};

export class TestService {
  public constructor(
    private readonly repository: VocabularyRepository,
    private readonly secret: string,
    private readonly clock: Clock,
    private readonly random: RandomSource,
  ) {}

  public async generate(folderId: string) {
    const vocabulary = await this.repository.listByFolderId(folderId);
    const meanings = new Set(vocabulary.map((item) => item.meaning));
    if (vocabulary.length < 4 || meanings.size < 4)
      throw new HttpError(
        409,
        "TEST_INELIGIBLE",
        "At least four vocabulary items with distinct meanings are required.",
      );
    const questions = shuffle(vocabulary, this.random).map(
      (item: VocabularyRecord) => {
        const distractors = shuffle(
          vocabulary.filter(
            (candidate) =>
              candidate.id !== item.id && candidate.meaning !== item.meaning,
          ),
          this.random,
        )
          .slice(0, 3)
          .map((candidate) => candidate.meaning);
        return {
          vocabularyId: item.id,
          word: item.word,
          ipa: item.ipa,
          correctMeaning: item.meaning,
          choices: shuffle([item.meaning, ...distractors], this.random),
        };
      },
    );
    const issuedAt = this.clock.now();
    const expiresAt = new Date(issuedAt.getTime() + 30 * 60 * 1000);
    const snapshot = {
      version: "v1" as const,
      folderId,
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      questions,
    };
    return {
      testToken: signSnapshot(snapshot, this.secret),
      expiresAt: snapshot.expiresAt,
      questions: questions.map((question) => ({
        vocabularyId: question.vocabularyId,
        word: question.word,
        ipa: question.ipa,
        choices: question.choices,
      })),
    };
  }
}
