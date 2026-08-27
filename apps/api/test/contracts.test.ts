import {
  apiErrorEnvelopeSchema,
  createSuccessEnvelopeSchema,
  fieldErrorSchema,
} from "@english-learning/contracts";
import { describe, expect, it } from "vitest";
import { z } from "zod";

describe("TEST-002 shared HTTP contracts", () => {
  it("accepts the approved safe error envelope", () => {
    expect(
      apiErrorEnvelopeSchema.parse({
        error: {
          code: "VALIDATION_ERROR",
          fieldErrors: [{ message: "Word is required.", path: "word" }],
          message: "Review the highlighted values.",
          requestId: "request-1",
        },
      }),
    ).toBeTruthy();
  });

  it("rejects unknown fields at every contract boundary", () => {
    expect(() =>
      fieldErrorSchema.parse({
        message: "Invalid",
        path: "word",
        raw: "secret",
      }),
    ).toThrow();
    expect(() =>
      apiErrorEnvelopeSchema.parse({
        error: {
          code: "INTERNAL_ERROR",
          message: "Safe",
          requestId: "id",
          stack: "raw",
        },
      }),
    ).toThrow();
    expect(() =>
      createSuccessEnvelopeSchema(
        z.object({ value: z.string() }).strict(),
      ).parse({ data: { value: "ok", extra: true } }),
    ).toThrow();
  });
});
