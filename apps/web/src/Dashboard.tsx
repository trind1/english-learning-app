import { useEffect, useState } from "react";
export type DashboardData = {
  folderCount: number;
  vocabularyCount: number;
  completedSessionCount: number;
  correctAnswerCount: number;
  incorrectAnswerCount: number;
  accuracyPercent: number;
};
export const Dashboard = ({ load }: { load: () => Promise<DashboardData> }) => {
  const [data, setData] = useState<DashboardData>();
  const [error, setError] = useState("");
  const refresh = () => {
    setError("");
    void load()
      .then(setData)
      .catch(() => setError("Unable to load dashboard. Try again."));
  };
  useEffect(refresh, [load]);
  if (error)
    return (
      <section aria-label="Dashboard">
        <p role="alert">{error}</p>
        <button type="button" onClick={refresh}>
          Retry
        </button>
      </section>
    );
  if (!data)
    return (
      <section aria-label="Dashboard">
        <p role="status">Loading dashboard…</p>
      </section>
    );
  return (
    <section aria-label="Dashboard">
      <h2>Dashboard</h2>
      <dl>
        <dt>Folders</dt>
        <dd>{data.folderCount}</dd>
        <dt>Vocabulary</dt>
        <dd>{data.vocabularyCount}</dd>
        <dt>Completed sessions</dt>
        <dd>{data.completedSessionCount}</dd>
        <dt>Correct answers</dt>
        <dd>{data.correctAnswerCount}</dd>
        <dt>Incorrect answers</dt>
        <dd>{data.incorrectAnswerCount}</dd>
        <dt>Accuracy</dt>
        <dd>{data.accuracyPercent}%</dd>
      </dl>
    </section>
  );
};
