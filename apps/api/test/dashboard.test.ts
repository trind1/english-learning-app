import { describe, expect, it } from "vitest";
import { DashboardService } from "../src/modules/dashboard/dashboard-service";
import { PrismaDashboardRepository } from "../src/modules/dashboard/prisma-dashboard-repository";
import { createDashboardRouter } from "../src/modules/dashboard/dashboard-router";
import express from "express";
import request from "supertest";

describe("TEST-009 dashboard aggregation", () => {
  it("returns zero-safe totals", async () => {
    const service = new DashboardService({
      totals: async () => ({
        folderCount: 0,
        vocabularyCount: 0,
        completedSessionCount: 0,
        correctAnswerCount: 0,
        incorrectAnswerCount: 0,
      }),
    });
    await expect(service.get()).resolves.toMatchObject({ accuracyPercent: 0 });
  });

  it("calculates one-decimal accuracy without double counting", async () => {
    const service = new DashboardService({
      totals: async () => ({
        folderCount: 2,
        vocabularyCount: 5,
        completedSessionCount: 2,
        correctAnswerCount: 2,
        incorrectAnswerCount: 1,
      }),
    });
    await expect(service.get()).resolves.toEqual({
      folderCount: 2,
      vocabularyCount: 5,
      completedSessionCount: 2,
      correctAnswerCount: 2,
      incorrectAnswerCount: 1,
      accuracyPercent: 66.7,
    });
  });

  it("aggregates Prisma counts through one transaction", async () => {
    const client = {
      folder: { count: () => "folders" },
      vocabulary: { count: () => "vocabulary" },
      testSession: { count: () => "sessions" },
      testAnswer: { count: (arg: unknown) => arg },
      $transaction: async () => [2, 5, 3, 7, 2],
    } as never;
    await expect(
      new PrismaDashboardRepository(client).totals(),
    ).resolves.toEqual({
      folderCount: 2,
      vocabularyCount: 5,
      completedSessionCount: 3,
      correctAnswerCount: 7,
      incorrectAnswerCount: 2,
    });
  });

  it("maps service failures through the router next handler", async () => {
    const app = express();
    const error = new Error("database secret");
    app.use(
      "/dashboard",
      createDashboardRouter({
        get: async () => {
          throw error;
        },
      } as unknown as DashboardService),
    );
    app.use(
      (
        err: Error,
        _req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        void next;
        return res.status(500).json({ message: err.message });
      },
    );
    await request(app)
      .get("/dashboard")
      .expect(500, { message: "database secret" });
  });

  it("serves aggregated dashboard data through the router", async () => {
    const app = express();
    app.use(
      "/dashboard",
      createDashboardRouter({
        get: async () => ({ folderCount: 1 }),
      } as unknown as DashboardService),
    );
    await request(app)
      .get("/dashboard")
      .expect(200, { data: { folderCount: 1 } });
  });
});
