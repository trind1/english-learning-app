export type DashboardTotals = {
  folderCount: number;
  vocabularyCount: number;
  completedSessionCount: number;
  completedSessionDates: readonly Date[];
  correctAnswerCount: number;
  incorrectAnswerCount: number;
};

export interface DashboardRepository {
  totals(): Promise<DashboardTotals>;
}
