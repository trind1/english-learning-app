import { HttpError } from "../../http/errors";

export interface AiVocabularySource {
  findByIds(
    ids: readonly string[],
  ): Promise<readonly { id: string; word: string }[]>;
}
export interface AiProvider {
  generate(words: readonly string[], signal: AbortSignal): Promise<string>;
}

export class AiService {
  public constructor(
    private readonly source: AiVocabularySource,
    private readonly provider: AiProvider | undefined,
    private readonly timeoutMs: number,
  ) {}
  public async generate(ids: unknown) {
    if (
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
    const words = await this.source.findByIds(ids);
    if (words.length !== ids.length)
      throw new HttpError(
        400,
        "AI_SELECTION_INVALID",
        "One or more vocabulary items were not found.",
      );
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const text = await this.provider.generate(
        words.map((word) => word.word),
        controller.signal,
      );
      return { text, vocabularyIds: ids };
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
