import { apiErrorEnvelopeSchema } from "@english-learning/contracts";
import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { createHttpApp } from "../src/http/app";
import { HttpError } from "../src/http/errors";

const createTestApp = () =>
  createHttpApp({ webOrigin: "http://localhost:5173" }, (app) => {
    app.get("/safe", (_request, response) =>
      response.json({ data: { ready: true } }),
    );
    app.get("/known-error", () => {
      throw new HttpError(409, "KNOWN_CONFLICT", "The request conflicts.", [
        { message: "Choose another value.", path: "name" },
      ]);
    });
    app.get("/validation-error", () =>
      z
        .object({ name: z.string() })
        .strict()
        .parse({ unknown: "sensitive raw value" }),
    );
    app.get("/internal-error", () => {
      throw new Error("database password and stack details");
    });
    app.post("/body", express.json(), (_request, response) =>
      response.json({ data: { accepted: true } }),
    );
  });

describe("TEST-002 HTTP safety foundation", () => {
  it("sets security, CORS, and correlation headers", async () => {
    const response = await request(createTestApp())
      .get("/safe")
      .set("Origin", "http://localhost:5173")
      .set("x-request-id", "client.request-1");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
    expect(response.headers["content-security-policy"]).toContain(
      "default-src",
    );
    expect(response.headers["x-powered-by"]).toBeUndefined();
    expect(response.headers["x-request-id"]).toBe("client.request-1");
  });

  it("replaces an unsafe request ID", async () => {
    const response = await request(createTestApp())
      .get("/safe")
      .set("x-request-id", "unsafe value");

    expect(response.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("returns a safe known 4xx envelope", async () => {
    const response = await request(createTestApp()).get("/known-error");

    expect(response.status).toBe(409);
    expect(apiErrorEnvelopeSchema.parse(response.body).error).toMatchObject({
      code: "KNOWN_CONFLICT",
      fieldErrors: [{ message: "Choose another value.", path: "name" }],
      message: "The request conflicts.",
    });
  });

  it("maps Zod failures without unknown input details", async () => {
    const response = await request(createTestApp()).get("/validation-error");
    const error = apiErrorEnvelopeSchema.parse(response.body).error;

    expect(response.status).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.fieldErrors?.[0]?.path).toBe("name");
    expect(JSON.stringify(response.body)).not.toContain("sensitive raw value");
  });

  it("hides unexpected internal error details", async () => {
    const response = await request(createTestApp()).get("/internal-error");
    const serialized = JSON.stringify(response.body);

    expect(response.status).toBe(500);
    expect(apiErrorEnvelopeSchema.parse(response.body).error.code).toBe(
      "INTERNAL_ERROR",
    );
    expect(serialized).not.toContain("database password");
    expect(serialized).not.toContain("stack");
  });

  it("returns a safe 404 envelope", async () => {
    const response = await request(
      createHttpApp({ webOrigin: "http://localhost:5173" }),
    ).get("/missing");

    expect(response.status).toBe(404);
    expect(apiErrorEnvelopeSchema.parse(response.body).error.code).toBe(
      "NOT_FOUND",
    );
  });

  it("returns a safe 413 response for an oversized JSON body", async () => {
    const response = await request(createTestApp())
      .post("/body")
      .set("Content-Type", "application/json")
      .send({ value: "x".repeat(1_100_000) });

    expect(response.status).toBe(413);
    expect(apiErrorEnvelopeSchema.parse(response.body).error.code).toBe(
      "PAYLOAD_TOO_LARGE",
    );
  });
});
