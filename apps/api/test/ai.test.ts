import { describe, expect, it } from "vitest";
import { AiService } from "../src/modules/ai/ai-service";

const source = {
  findByIds: async (ids: readonly string[]) =>
    ids.map((id) => ({ id, word: `word-${id}` })),
};
describe("TEST-010 optional AI boundary", () => {
  it("rejects invalid selections and disabled AI", async () => {
    const disabled = new AiService(source, undefined, 10);
    await expect(disabled.generate([])).rejects.toMatchObject({
      code: "AI_SELECTION_INVALID",
    });
    await expect(disabled.generate(["a"])).rejects.toMatchObject({
      code: "AI_UNAVAILABLE",
    });
    await expect(
      disabled.generate(Array.from({ length: 11 }, (_, i) => String(i))),
    ).rejects.toMatchObject({ code: "AI_SELECTION_INVALID" });
  });
  it("generates selected words without persistence", async () => {
    const provider = {
      generate: async (words: readonly string[]) => words.join(" "),
    };
    await expect(
      new AiService(source, provider, 100).generate(["a", "b"]),
    ).resolves.toEqual({ text: "word-a word-b", vocabularyIds: ["a", "b"] });
  });
  it("maps missing and timeout failures safely", async () => {
    const missing = { findByIds: async () => [] };
    await expect(
      new AiService(missing, { generate: async () => "x" }, 100).generate([
        "a",
      ]),
    ).rejects.toMatchObject({ code: "AI_SELECTION_INVALID" });
    const slow = {
      generate: async (_: readonly string[], signal: AbortSignal) =>
        await new Promise<string>((_, reject) => {
          signal.addEventListener("abort", () => reject(new Error("aborted")));
        }),
    };
    await expect(
      new AiService(source, slow, 1).generate(["a"]),
    ).rejects.toMatchObject({ code: "AI_UNAVAILABLE" });
  });
});
