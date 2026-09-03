import { afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

import { createHttpApp } from "../src/http/app";
import { createAiRouter } from "../src/modules/ai/ai-router";
import { AiService, type AiProvider } from "../src/modules/ai/ai-service";
import {
  createAiProvider,
  GeminiProvider,
  LocalAiProvider,
  OpenAiProvider,
} from "../src/modules/ai/openai-provider";

const source = {
  findByIds: async (_folderId: string, ids: readonly string[]) =>
    ids.map((id) => ({ id, word: `word-${id}`, meaning: `meaning-${id}` })),
};
const provider = (generate: AiProvider["generate"]): AiProvider => ({
  mode: "openai",
  generate,
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("TEST-010 AI story service", () => {
  it.each([
    undefined,
    [],
    Array.from({ length: 11 }, (_, index) => String(index)),
    ["a", "a"],
    [1],
  ])("rejects malformed or out-of-range selection %#", async (selection) => {
    await expect(
      new AiService(source, undefined, 10).generate("folder", selection),
    ).rejects.toMatchObject({
      code: "AI_SELECTION_INVALID",
    });
  });

  it("accepts one and ten unique vocabulary IDs", async () => {
    const complete = provider(async (items) =>
      items.map(({ word }) => word).join(" "),
    );

    await expect(
      new AiService(source, complete, 100).generate("folder", ["a"]),
    ).resolves.toMatchObject({
      story: "word-a",
      usedWords: ["word-a"],
      source: "openai",
    });
    await expect(
      new AiService(source, complete, 100).generate(
        "folder",
        Array.from({ length: 10 }, (_, i) => String(i)),
      ),
    ).resolves.toMatchObject({
      missingWords: [],
      vocabularyIds: expect.any(Array),
    });
  });

  it("rejects a missing folder context before provider access", async () => {
    await expect(
      new AiService(
        source,
        provider(async () => "unused"),
        100,
      ).generate(undefined, ["a"]),
    ).rejects.toMatchObject({ code: "AI_SELECTION_INVALID" });
  });

  it("rejects disabled AI and vocabulary IDs absent from the database", async () => {
    await expect(
      new AiService(source, undefined, 10).generate("folder", ["a"]),
    ).rejects.toMatchObject({
      code: "AI_UNAVAILABLE",
    });
    await expect(
      new AiService(
        { findByIds: async () => [] },
        provider(async () => "word-a"),
        100,
      ).generate("folder", ["a"]),
    ).rejects.toMatchObject({ code: "AI_SELECTION_INVALID" });
  });

  it("retries exactly once when vocabulary is missing and accepts a corrected story", async () => {
    const generate = vi
      .fn()
      .mockResolvedValueOnce("word-a only")
      .mockResolvedValueOnce("word-a word-b together");
    const result = await new AiService(
      source,
      provider(generate),
      100,
    ).generate("folder", ["a", "b"]);
    expect(result.usedWords).toEqual(["word-a", "word-b"]);
    expect(generate).toHaveBeenNthCalledWith(
      2,
      expect.any(Array),
      expect.any(AbortSignal),
      ["word-b"],
    );
  });

  it("maps provider, empty, retry, and timeout failures to a safe error", async () => {
    const cases: AiProvider[] = [
      provider(async () => {
        throw new Error("secret provider detail");
      }),
      provider(async () => "   "),
      provider(async () => "unrelated story"),
      provider(
        async (_items, signal) =>
          await new Promise<string>((_, reject) =>
            signal.addEventListener("abort", () =>
              reject(new Error("aborted")),
            ),
          ),
      ),
    ];
    for (const [index, failingProvider] of cases.entries()) {
      await expect(
        new AiService(source, failingProvider, index === 3 ? 1 : 100).generate(
          "folder",
          ["a"],
        ),
      ).rejects.toMatchObject({
        code: "AI_UNAVAILABLE",
        message:
          index === 3
            ? "AI text generation timed out."
            : "AI text generation failed.",
      });
    }
  });
});

describe("TEST-010 AI story HTTP boundary", () => {
  it("returns a normalized success response and a safe failure response", async () => {
    const successService = new AiService(
      source,
      provider(async (items) => items[0]!.word),
      100,
    );
    const successApp = createHttpApp(
      { webOrigin: "http://localhost:5173" },
      (app) => app.use("/api/v1/ai", createAiRouter(successService)),
    );
    await request(successApp)
      .post("/api/v1/ai/text")
      .send({ folderId: "folder", vocabularyIds: ["a"] })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toMatchObject({
          story: "word-a",
          usedWords: ["word-a"],
        });
      });

    const failureService = new AiService(
      source,
      provider(async () => {
        throw new Error("database-password");
      }),
      100,
    );
    const failureApp = createHttpApp(
      { webOrigin: "http://localhost:5173" },
      (app) => app.use("/api/v1/ai", createAiRouter(failureService)),
    );
    const response = await request(failureApp)
      .post("/api/v1/ai/text")
      .send({ folderId: "folder", vocabularyIds: ["a"] })
      .expect(503);
    expect(JSON.stringify(response.body)).not.toContain("database-password");
    expect(response.body.error).toMatchObject({ code: "AI_UNAVAILABLE" });
  });
});

describe("TEST-010 AI providers", () => {
  it("selects Gemini explicitly without falling back to the local provider", () => {
    const selected = createAiProvider({
      apiKey: "private-key",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
      enabled: true,
      fallbackModel: "gemini-3.5-flash-lite",
      model: "gemini-2.5-flash",
      provider: "gemini",
    });

    expect(selected).toBeInstanceOf(GeminiProvider);
    expect(selected).not.toBeInstanceOf(LocalAiProvider);
    expect(selected?.mode).toBe("gemini");
  });

  it("selects only explicitly configured providers and rejects incomplete external configuration", () => {
    const baseUrl = "https://provider.example/v1";
    expect(
      createAiProvider({ baseUrl, enabled: false, provider: "local" }),
    ).toBeUndefined();
    expect(
      createAiProvider({ baseUrl, enabled: true, provider: "local" }),
    ).toBeInstanceOf(LocalAiProvider);
    expect(
      createAiProvider({ baseUrl, enabled: true, provider: "openai" }),
    ).toBeUndefined();
    expect(
      createAiProvider({
        apiKey: "private-key",
        baseUrl,
        enabled: true,
        model: "story-model",
        provider: "openai",
      }),
    ).toBeInstanceOf(OpenAiProvider);
    expect(
      createAiProvider({
        apiKey: "private-key",
        baseUrl,
        enabled: true,
        model: "story-model",
      }),
    ).toBeUndefined();
  });

  it("uses the primary Gemini model without invoking fallback after success", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "Apple begins the journey." } }],
        }),
        { status: 200 },
      ),
    );
    const adapter = new GeminiProvider(
      "private-key",
      "gemini-primary",
      "https://gemini.example/openai/",
      "gemini-fallback",
    );

    await expect(
      adapter.generate(
        [
          { word: "apple", meaning: "fruit" },
          { word: "journey", meaning: "trip" },
        ],
        new AbortController().signal,
      ),
    ).resolves.toContain("journey");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(fetchMock.mock.calls[0]![1]!.body))).toMatchObject(
      {
        model: "gemini-primary",
      },
    );
  });

  it("retries the primary Gemini model once after 503", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: "The primary recovered." } }],
          }),
          { status: 200 },
        ),
      );
    const adapter = new GeminiProvider(
      "private-key",
      "gemini-primary",
      "https://gemini.example/openai",
      "gemini-fallback",
    );

    const generation = adapter.generate([], new AbortController().signal);
    await vi.runAllTimersAsync();
    await expect(generation).resolves.toContain("primary recovered");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      fetchMock.mock.calls.map(
        ([, request]) => JSON.parse(String(request!.body)).model,
      ),
    ).toEqual(["gemini-primary", "gemini-primary"]);
  });

  it("retries a transient network failure without changing models", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new TypeError("temporary network failure"))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: "The network recovered." } }],
          }),
          { status: 200 },
        ),
      );
    const adapter = new GeminiProvider(
      "private-key",
      "gemini-primary",
      "https://gemini.example/openai",
      "gemini-fallback",
    );

    const generation = adapter.generate([], new AbortController().signal);
    await vi.runAllTimersAsync();
    await expect(generation).resolves.toContain("network recovered");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      fetchMock.mock.calls.map(
        ([, request]) => JSON.parse(String(request!.body)).model,
      ),
    ).toEqual(["gemini-primary", "gemini-primary"]);
  });

  it("falls back after two primary 503 responses and preserves vocabulary", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }))
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [
              { message: { content: "Apple gave courage for the journey." } },
            ],
          }),
          { status: 200 },
        ),
      );
    const adapter = new GeminiProvider(
      "private-key",
      "gemini-primary",
      "https://gemini.example/openai",
      "gemini-fallback",
    );
    const vocabulary = [
      { word: "apple", meaning: "fruit" },
      { word: "journey", meaning: "trip" },
      { word: "courage", meaning: "bravery" },
    ];

    const generation = adapter.generate(
      vocabulary,
      new AbortController().signal,
    );
    await vi.runAllTimersAsync();
    await expect(generation).resolves.toContain("courage");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const primaryBody = JSON.parse(String(fetchMock.mock.calls[0]![1]!.body));
    const fallbackBody = JSON.parse(String(fetchMock.mock.calls[2]![1]!.body));
    expect(primaryBody.model).toBe("gemini-primary");
    expect(fallbackBody.model).toBe("gemini-fallback");
    expect(primaryBody.messages[1].content).toContain(
      JSON.stringify(vocabulary),
    );
    expect(fallbackBody.messages[1].content).toContain(
      JSON.stringify(vocabulary),
    );
  });

  it("retries the fallback Gemini model once after its first 503", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }))
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }))
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: "The fallback recovered." } }],
          }),
          { status: 200 },
        ),
      );
    const adapter = new GeminiProvider(
      "private-key",
      "gemini-primary",
      "https://gemini.example/openai",
      "gemini-fallback",
    );

    const generation = adapter.generate([], new AbortController().signal);
    await vi.runAllTimersAsync();
    await expect(generation).resolves.toContain("fallback recovered");
    expect(
      fetchMock.mock.calls.map(
        ([, request]) => JSON.parse(String(request!.body)).model,
      ),
    ).toEqual([
      "gemini-primary",
      "gemini-primary",
      "gemini-fallback",
      "gemini-fallback",
    ]);
  });

  it("does not fallback for authentication or malformed-response failures", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const adapter = new GeminiProvider(
      "private-key",
      "gemini-primary",
      "https://gemini.example/openai",
      "gemini-fallback",
    );

    fetchMock.mockResolvedValueOnce(
      new Response("unauthorized", { status: 401 }),
    );
    await expect(
      adapter.generate([], new AbortController().signal),
    ).rejects.toThrow("HTTP 401");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ choices: [] }), { status: 200 }),
    );
    await expect(
      adapter.generate([], new AbortController().signal),
    ).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("stops after all four transient Gemini attempts fail", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("provider detail", { status: 503 }));
    const adapter = new GeminiProvider(
      "private-key",
      "gemini-primary",
      "https://gemini.example/openai",
      "gemini-fallback",
    );

    const generation = adapter.generate([], new AbortController().signal);
    const rejection = expect(generation).rejects.toThrow("HTTP 503");
    await vi.runAllTimersAsync();
    await rejection;
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("calls an OpenAI-compatible API and parses normalized text", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "A journey begins." } }],
        }),
        { status: 200 },
      ),
    );
    const adapter = new OpenAiProvider(
      "private-key",
      "story-model",
      "https://ai.example/v1/",
    );
    await expect(
      adapter.generate(
        [{ word: "journey", meaning: "trip" }],
        new AbortController().signal,
      ),
    ).resolves.toBe("A journey begins.");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://ai.example/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        signal: expect.any(AbortSignal),
      }),
    );
    const request = fetchMock.mock.calls[0]![1]!;
    expect(JSON.parse(String(request.body))).toMatchObject({
      model: "story-model",
    });
    expect(String(request.body)).not.toContain("private-key");
    expect(request.headers).toMatchObject({
      Authorization: "Bearer private-key",
    });
  });

  it("adds controlled retry instructions and rejects HTTP or malformed responses", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ choices: [{ message: { content: "word-a" } }] }),
          { status: 200 },
        ),
      );
    const adapter = new OpenAiProvider("key", "model", "https://ai.example/v1");
    await adapter.generate(
      [{ word: "word-a", meaning: "meaning" }],
      new AbortController().signal,
      ["word-a"],
    );
    expect(String(fetchMock.mock.calls[0]![1]!.body)).toContain("only retry");

    fetchMock.mockResolvedValueOnce(
      new Response("rate limited", { status: 429 }),
    );
    await expect(
      adapter.generate([], new AbortController().signal),
    ).rejects.toThrow("HTTP 429");
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ choices: [] }), { status: 200 }),
    );
    await expect(
      adapter.generate([], new AbortController().signal),
    ).rejects.toThrow();
  });

  it("labels deterministic local output and uses every selected word", async () => {
    const local = new LocalAiProvider();
    expect(local.mode).toBe("local");
    await expect(
      local.generate([{ word: "airport", meaning: "terminal" }]),
    ).resolves.toContain("airport");
  });
});
