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
      ai: { enabled: false, timeoutMs: 10_000 },
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
        AI_ENABLED: "true",
        AI_PROVIDER: "configured-provider",
        AI_TIMEOUT_MS: "5000",
        API_PORT: "4000",
        UNRELATED_PROCESS_VALUE: "allowed",
      }),
    ).toMatchObject({
      ai: {
        apiKey: "provider-key",
        enabled: true,
        provider: "configured-provider",
        timeoutMs: 5_000,
      },
      port: 4_000,
    });
  });

  it.each([
    [{ ...validEnvironment, API_PORT: "0" }, "API_PORT"],
    [{ ...validEnvironment, WEB_ORIGIN: "not-a-url" }, "WEB_ORIGIN"],
    [{ ...validEnvironment, TEST_TOKEN_SECRET: "short" }, "TEST_TOKEN_SECRET"],
    [{ ...validEnvironment, AI_ENABLED: "yes" }, "AI_ENABLED"],
    [{ ...validEnvironment, AI_ENABLED: "true" }, "AI_PROVIDER"],
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
