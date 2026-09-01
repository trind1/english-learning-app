import type { DashboardRepository } from "./dashboard-repository";

export class DashboardService {
  public constructor(private readonly repository: DashboardRepository) {}

  public async get() {
    const totals = await this.repository.totals();
    const answered = totals.correctAnswerCount + totals.incorrectAnswerCount;
    return {
      ...totals,
      completedSessionDates: totals.completedSessionDates.map((date) =>
        date.toISOString(),
      ),
      accuracyPercent:
        answered === 0
          ? 0
          : Math.round((totals.correctAnswerCount / answered) * 1000) / 10,
    };
  }
}
