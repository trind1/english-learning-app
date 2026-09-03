import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import { parseEnvironment } from "../src/config/environment";

const validEnvironment = {
  DATABASE_URL: "file:./dev.db",
  TEST_TOKEN_SECRET: "a-secure-test-secret-with-32-characters",
  WEB_ORIGIN: "http://localhost:5173",
};

describe("TEST-002 environment parsing", () => {
  it("parses required values and applies safe defaults", () => {
    expect(parseEnvironment(validEnvironment)).toEqual({
      ai: {
        baseUrl: "https://api.openai.com/v1",
        enabled: false,
        timeoutMs: 10_000,
      },
      databaseUrl: "file:./dev.db",
      port: 3_000,
      testTokenSecret: validEnvironment.TEST_TOKEN_SECRET,
      webOrigin: "http://localhost:5173",
    });
  });

  it("parses explicit optional configuration", () => {
    expect(
      parseEnvironment({
        ...validEnvironment,
        AI_API_KEY: "provider-key",
        AI_BASE_URL: "https://provider.example/v1",
        AI_ENABLED: "true",
        AI_MODEL: "story-model",
        AI_PROVIDER: "openai",
        AI_TIMEOUT_MS: "5000",
        API_PORT: "4000",
        UNRELATED_PROCESS_VALUE: "allowed",
      }),
    ).toMatchObject({
      ai: {
        apiKey: "provider-key",
        baseUrl: "https://provider.example/v1",
        enabled: true,
        model: "story-model",
        provider: "openai",
        timeoutMs: 5_000,
      },
      port: 4_000,
    });
  });

  it("allows an explicitly labelled local provider without external credentials", () => {
    expect(
      parseEnvironment({
        ...validEnvironment,
        AI_ENABLED: "true",
        AI_PROVIDER: "local",
      }).ai,
    ).toMatchObject({ enabled: true, provider: "local" });
  });

  it("parses Gemini with the shared backend AI_API_KEY convention", () => {
    expect(
      parseEnvironment({
        ...validEnvironment,
        AI_API_KEY: "gemini-provider-key",
        AI_BASE_URL: "https://generativelanguage.googleapis.com/v1beta/openai/",
        AI_ENABLED: "true",
        AI_FALLBACK_MODEL: "gemini-3.5-flash-lite",
        AI_MODEL: "gemini-2.5-flash",
        AI_PROVIDER: "gemini",
      }).ai,
    ).toEqual({
      apiKey: "gemini-provider-key",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
      enabled: true,
      fallbackModel: "gemini-3.5-flash-lite",
      model: "gemini-2.5-flash",
      provider: "gemini",
      timeoutMs: 10_000,
    });
  });

  it.each([
    [{ ...validEnvironment, API_PORT: "0" }, "API_PORT"],
    [{ ...validEnvironment, WEB_ORIGIN: "not-a-url" }, "WEB_ORIGIN"],
    [{ ...validEnvironment, TEST_TOKEN_SECRET: "short" }, "TEST_TOKEN_SECRET"],
    [{ ...validEnvironment, AI_ENABLED: "yes" }, "AI_ENABLED"],
    [{ ...validEnvironment, AI_ENABLED: "true" }, "AI_PROVIDER"],
    [
      {
        ...validEnvironment,
        AI_ENABLED: "true",
        AI_PROVIDER: "openai",
        AI_MODEL: "story-model",
      },
      "AI_API_KEY",
    ],
    [
      {
        ...validEnvironment,
        AI_ENABLED: "true",
        AI_PROVIDER: "openai",
        AI_API_KEY: "key",
      },
      "AI_MODEL",
    ],
  ])("rejects invalid environment configuration", (environment, path) => {
    expect(() => parseEnvironment(environment)).toThrow(ZodError);

    try {
      parseEnvironment(environment);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect(
        (error as ZodError).issues.some((issue) => issue.path.includes(path)),
      ).toBe(true);
    }
  });
});
