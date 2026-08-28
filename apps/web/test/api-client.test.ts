import { createSuccessEnvelopeSchema } from "@english-learning/contracts";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { ApiClientError, createApiClient } from "../src/api/client";

const responseSchema = createSuccessEnvelopeSchema(
  z.object({ ready: z.boolean() }).strict(),
);

describe("TEST-002 frontend API client boundary", () => {
  it("parses a successful response and supplies JSON headers", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ data: { ready: true } }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );
    const client = createApiClient("http://localhost:3000/api/v1/", fetcher);

    await expect(
      client.request("/status", responseSchema, { body: "{}", method: "POST" }),
    ).resolves.toEqual({
      data: { ready: true },
    });
    expect(fetcher).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/status",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("throws the typed safe API error", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Review the highlighted values.",
            requestId: "request-1",
          },
        }),
        { status: 400 },
      ),
    );
    const client = createApiClient("http://localhost:3000", fetcher);

    await expect(client.request("status", responseSchema)).rejects.toEqual(
      new ApiClientError({
        code: "VALIDATION_ERROR",
        message: "Review the highlighted values.",
        requestId: "request-1",
      }),
    );
  });

  it("preserves multipart boundaries for FormData uploads", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ data: { ready: true } }), {
        status: 200,
      }),
    );
    const client = createApiClient("http://localhost:3000", fetcher);
    const form = new FormData();
    form.append("csv", new File(["word,meaning\nhello,greeting"], "words.csv"));
    await expect(
      client.request("folders/folder/vocabulary/import", responseSchema, {
        method: "POST",
        body: form,
      }),
    ).resolves.toEqual({ data: { ready: true } });
    const request = fetcher.mock.calls[0]?.[1] as RequestInit;
    expect(request.headers).toEqual({ Accept: "application/json" });
  });

  it("rejects invalid base URLs and malformed response contracts", async () => {
    expect(() => createApiClient("not-a-url", vi.fn())).toThrow();

    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ data: { ready: true, secret: "raw" } })),
      );
    await expect(
      createApiClient("http://localhost:3000", fetcher).request(
        "status",
        responseSchema,
      ),
    ).rejects.toThrow();
  });
});
