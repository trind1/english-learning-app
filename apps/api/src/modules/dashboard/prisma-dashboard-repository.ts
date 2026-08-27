import type { PrismaClient } from "@prisma/client";
import type {
  DashboardRepository,
  DashboardTotals,
} from "./dashboard-repository";

export class PrismaDashboardRepository implements DashboardRepository {
  public constructor(private readonly client: PrismaClient) {}

  public async totals(): Promise<DashboardTotals> {
    const [
      folderCount,
      vocabularyCount,
      completedSessionCount,
      correctAnswerCount,
      incorrectAnswerCount,
    ] = await this.client.$transaction([
      this.client.folder.count(),
      this.client.vocabulary.count(),
      this.client.testSession.count(),
      this.client.testAnswer.count({ where: { isCorrect: true } }),
      this.client.testAnswer.count({ where: { isCorrect: false } }),
    ]);
    return {
      folderCount,
      vocabularyCount,
      completedSessionCount,
      correctAnswerCount,
      incorrectAnswerCount,
    };
  }
}
