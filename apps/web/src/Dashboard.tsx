import { useEffect, useState } from "react";
export type DashboardData = {
  folderCount: number;
  vocabularyCount: number;
  completedSessionCount: number;
  correctAnswerCount: number;
  incorrectAnswerCount: number;
  accuracyPercent: number;
};
export const Dashboard = ({
  load,
  onAction,
}: {
  load: () => Promise<DashboardData>;
  onAction?: (view: "library" | "flashcards") => void;
}) => {
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
      <div className="dashboard-top">
        <h2>Learning progress</h2>
        <div
          className="accuracy-ring"
          style={
            {
              "--progress": `${data.accuracyPercent * 3.6}deg`,
            } as React.CSSProperties
          }
        >
          <strong>{data.accuracyPercent}%</strong>
          <span>accuracy</span>
        </div>
      </div>
      <dl className="metrics-grid">
        <div>
          <dt>Folders</dt>
          <dd>{data.folderCount}</dd>
        </div>
        <div>
          <dt>Vocabulary</dt>
          <dd>{data.vocabularyCount}</dd>
        </div>
        <div>
          <dt>Completed sessions</dt>
          <dd>{data.completedSessionCount}</dd>
        </div>
        <div>
          <dt>Correct answers</dt>
          <dd>{data.correctAnswerCount}</dd>
        </div>
        <div>
          <dt>Incorrect answers</dt>
          <dd>{data.incorrectAnswerCount}</dd>
        </div>
      </dl>
      <div className="quick-actions">
        <h2>Quick actions</h2>
        <div>
          <button onClick={() => onAction?.("library")}>Create folder</button>
          <button className="secondary" onClick={() => onAction?.("library")}>
            Add vocabulary
          </button>
          <button className="secondary" onClick={() => onAction?.("library")}>
            Import CSV
          </button>
          <button
            className="secondary"
            onClick={() => onAction?.("flashcards")}
          >
            Start study
          </button>
        </div>
      </div>
    </section>
  );
};
