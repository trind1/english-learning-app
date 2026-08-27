export type DashboardTotals = {
  folderCount: number;
  vocabularyCount: number;
  completedSessionCount: number;
  correctAnswerCount: number;
  incorrectAnswerCount: number;
};

export interface DashboardRepository {
  totals(): Promise<DashboardTotals>;
}
