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

  if (error) {
    return (
      <section aria-label="Dashboard" className="card" style={{ padding: "32px", textAlign: "center" }}>
        <p role="alert">{error}</p>
        <button className="btn-primary" type="button" onClick={refresh} style={{ marginTop: "16px" }}>
          Retry
        </button>
      </section>
    );
  }

  if (!data) {
    return (
      <section aria-label="Dashboard" className="card" style={{ padding: "32px", textAlign: "center" }}>
        <p role="status" className="text-body-md" style={{ color: "var(--on-surface-variant)" }}>
          Loading dashboard…
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Dashboard" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Welcome Banner */}
      <div>
        <h2 className="text-headline-lg" style={{ color: "var(--on-surface)", margin: "0 0 8px 0" }}>
          Welcome back!
        </h2>
        <p className="text-body-lg" style={{ color: "var(--on-surface-variant)", margin: 0 }}>
          Keep up the great work. Every focused session builds lasting mastery.
        </p>
      </div>

      {/* Widgets Grid */}
      <div className="dashboard-grid">
        {/* Daily Progress Widget */}
        <div className="progress-widget">
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="text-headline-md" style={{ margin: 0 }}>
                Daily Progress
              </h3>
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
                style={{
                  color: "var(--primary)",
                  backgroundColor: "rgba(0, 88, 190, 0.1)",
                  padding: "8px",
                  borderRadius: "50%",
                }}
              >
                trending_up
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px" }}>
              <span className="text-display-lg" style={{ color: "var(--primary)", lineHeight: 1 }}>
                {data.accuracyPercent}%
              </span>
              <span className="text-label-md" style={{ color: "var(--on-surface-variant)" }}>
                Goal completed
              </span>
            </div>
            <p className="text-body-md" style={{ color: "var(--on-surface-variant)", marginBottom: "16px" }}>
              {data.vocabularyCount} words in collection, {data.completedSessionCount} sessions finished.
            </p>
          </div>
          <div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(100, Math.max(0, data.accuracyPercent))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Learning Consistency Chart Widget */}
        <div className="consistency-chart-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 className="text-headline-md" style={{ margin: 0 }}>
              Learning Consistency
            </h3>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 500,
                padding: "4px 12px",
                borderRadius: "20px",
                backgroundColor: "var(--surface-container-low)",
                color: "var(--on-surface-variant)",
              }}
            >
              This Week
            </span>
          </div>

          <div className="chart-container" aria-hidden="true">
            <div className="chart-y-axis">
              <span>100%</span>
              <span>50%</span>
              <span>0%</span>
            </div>
            <div className="chart-bars-group">
              <div className="bar-column" style={{ height: "40%" }} />
              <div className="bar-column highlighted" style={{ height: "80%" }} />
              <div className="bar-column" style={{ height: "60%" }} />
              <div className="bar-column highlighted" style={{ height: "100%" }} />
              <div className="bar-column" style={{ height: "30%" }} />
              <div className="bar-column highlighted" style={{ height: `${Math.max(20, data.accuracyPercent)}%` }} />
              <div className="bar-column" style={{ height: "15%" }} />
            </div>
          </div>
          <div className="chart-x-labels" aria-hidden="true">
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
            <span>S</span>
          </div>
        </div>
      </div>

      {/* Metrics DL */}
      <dl className="metrics-grid">
        <div className="metric-box">
          <dt>Folders</dt>
          <dd>{data.folderCount}</dd>
        </div>
        <div className="metric-box">
          <dt>Vocabulary</dt>
          <dd>{data.vocabularyCount}</dd>
        </div>
        <div className="metric-box">
          <dt>Completed sessions</dt>
          <dd>{data.completedSessionCount}</dd>
        </div>
        <div className="metric-box">
          <dt>Correct answers</dt>
          <dd style={{ color: "var(--secondary)" }}>{data.correctAnswerCount}</dd>
        </div>
        <div className="metric-box">
          <dt>Incorrect answers</dt>
          <dd style={{ color: "var(--error)" }}>{data.incorrectAnswerCount}</dd>
        </div>
      </dl>

      {/* Quick Actions */}
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 className="text-headline-md" style={{ margin: 0 }}>
          Quick actions
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <button className="btn-primary" type="button" onClick={() => onAction?.("library")}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>
              create_new_folder
            </span>
            Create folder
          </button>
          <button className="btn-secondary" type="button" onClick={() => onAction?.("library")}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>
              add_circle
            </span>
            Add vocabulary
          </button>
          <button className="btn-secondary" type="button" onClick={() => onAction?.("library")}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>
              upload_file
            </span>
            Import CSV
          </button>
          <button className="btn-secondary" type="button" onClick={() => onAction?.("flashcards")}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>
              play_circle
            </span>
            Start study
          </button>
        </div>
      </div>
    </section>
  );
};
