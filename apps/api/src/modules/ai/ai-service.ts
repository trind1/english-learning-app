import { HttpError } from "../../http/errors";

export interface AiVocabularySource {
  findByIds(
    folderId: string,
    ids: readonly string[],
  ): Promise<readonly { id: string; word: string; meaning: string }[]>;
}
export type AiVocabulary = Readonly<{ word: string; meaning: string }>;
export interface AiProvider {
  readonly mode: "local" | "openai" | "gemini";
  generate(
    vocabulary: readonly AiVocabulary[],
    signal: AbortSignal,
    missingWords?: readonly string[],
  ): Promise<string>;
}

const usedVocabulary = (story: string, words: readonly string[]) =>
  words.filter((word) =>
    new RegExp(
      `(^|[^\\p{L}\\p{N}])${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}\\p{N}])`,
      "iu",
    ).test(story),
  );

export class AiService {
  public constructor(
    private readonly source: AiVocabularySource,
    private readonly provider: AiProvider | undefined,
    private readonly timeoutMs: number,
  ) {}
  public async generate(folderId: unknown, ids: unknown) {
    if (
      typeof folderId !== "string" ||
      folderId.length === 0 ||
      !Array.isArray(ids) ||
      ids.length < 1 ||
      ids.length > 10 ||
      new Set(ids).size !== ids.length ||
      ids.some((id) => typeof id !== "string")
    )
      throw new HttpError(
        400,
        "AI_SELECTION_INVALID",
        "Select between one and ten unique vocabulary items.",
      );
    if (!this.provider)
      throw new HttpError(
        503,
        "AI_UNAVAILABLE",
        "AI text generation is unavailable.",
      );
    const words = await this.source.findByIds(folderId, ids);
    if (words.length !== ids.length)
      throw new HttpError(
        400,
        "AI_SELECTION_INVALID",
        "One or more vocabulary items were not found.",
      );
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const vocabulary = words.map(({ word, meaning }) => ({ word, meaning }));
      let story = (
        await this.provider.generate(vocabulary, controller.signal)
      ).trim();
      if (!story) throw new Error("The AI provider returned empty text.");

      let usedWords = usedVocabulary(
        story,
        vocabulary.map(({ word }) => word),
      );
      let missingWords = vocabulary
        .map(({ word }) => word)
        .filter((word) => !usedWords.includes(word));
      if (missingWords.length > 0) {
        story = (
          await this.provider.generate(
            vocabulary,
            controller.signal,
            missingWords,
          )
        ).trim();
        usedWords = usedVocabulary(
          story,
          vocabulary.map(({ word }) => word),
        );
        missingWords = vocabulary
          .map(({ word }) => word)
          .filter((word) => !usedWords.includes(word));
      }
      if (!story || missingWords.length > 0)
        throw new Error("The generated story omitted selected vocabulary.");

      return {
        story,
        usedWords,
        missingWords: [],
        vocabularyIds: ids,
        source: this.provider.mode,
      };
    } catch {
      if (controller.signal.aborted)
        throw new HttpError(
          503,
          "AI_UNAVAILABLE",
          "AI text generation timed out.",
        );
      throw new HttpError(503, "AI_UNAVAILABLE", "AI text generation failed.");
    } finally {
      clearTimeout(timer);
    }
  }
}
