import { describe, expect, it } from "vitest";
import { DashboardService } from "../src/modules/dashboard/dashboard-service";

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
});
