import { useEffect, useState } from "react";
import type { FolderSummary } from "@english-learning/contracts";
import { getCurrentWeekConsistency } from "./current-week-consistency";

export type DashboardData = {
  folderCount: number;
  vocabularyCount: number;
  completedSessionCount: number;
  completedSessionDates: readonly string[];
  correctAnswerCount: number;
  incorrectAnswerCount: number;
  accuracyPercent: number;
};

export const Dashboard = ({
  load,
  loadFolders,
  onAction,
  onOpenFolder,
  now,
}: {
  load: () => Promise<DashboardData>;
  loadFolders: () => Promise<readonly FolderSummary[]>;
  onAction?: (view: "library" | "flashcards") => void;
  onOpenFolder?: (folder: FolderSummary) => void;
  now?: Date;
}) => {
  const [data, setData] = useState<DashboardData>();
  const [folders, setFolders] = useState<readonly FolderSummary[]>([]);
  const [error, setError] = useState("");

  const refresh = () => {
    setError("");
    void load()
      .then(setData)
      .catch(() => setError("Unable to load dashboard. Try again."));
    void loadFolders()
      .then(setFolders)
      .catch(() => setFolders([]));
  };

  useEffect(refresh, [load, loadFolders]);

  if (error) {
    return (
      <section
        aria-label="Dashboard"
        className="card"
        style={{ padding: "32px", textAlign: "center" }}
      >
        <p role="alert">{error}</p>
        <button
          className="btn-primary"
          type="button"
          onClick={refresh}
          style={{ marginTop: "16px" }}
        >
          Retry
        </button>
      </section>
    );
  }

  if (!data) {
    return (
      <section
        aria-label="Dashboard"
        className="card"
        style={{ padding: "32px", textAlign: "center" }}
      >
        <p
          role="status"
          className="text-body-md"
          style={{ color: "var(--on-surface-variant)" }}
        >
          Loading dashboard…
        </p>
      </section>
    );
  }

  const consistency = getCurrentWeekConsistency(
    data.completedSessionDates,
    now,
  );
  const consistencyPercent = `${consistency.percentage}%`;

  return (
    <section
      aria-label="Dashboard"
      style={{ display: "flex", flexDirection: "column", gap: "32px" }}
    >
      <div className="dashboard-welcome">
        <h2
          className="text-headline-lg"
          style={{ color: "var(--on-surface)", margin: "0 0 8px 0" }}
        >
          Welcome back
        </h2>
        <p
          className="text-body-lg"
          style={{ color: "var(--on-surface-variant)", margin: 0 }}
        >
          Keep your vocabulary growing, one focused session at a time.
        </p>
        <button
          className="btn-primary dashboard-welcome-action"
          type="button"
          onClick={() => onAction?.("library")}
        >
          Start learning
        </button>
      </div>

      {/* Widgets Grid */}
      <div className="dashboard-grid">
        {/* Daily Progress Widget */}
        <div className="progress-widget">
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
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
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <span
                className="text-display-lg"
                style={{ color: "var(--primary)", lineHeight: 1 }}
              >
                {data.accuracyPercent}%
              </span>
              <span
                className="text-label-md"
                style={{ color: "var(--on-surface-variant)" }}
              >
                Goal completed
              </span>
            </div>
            <p
              className="text-body-md"
              style={{
                color: "var(--on-surface-variant)",
                marginBottom: "16px",
              }}
            >
              {data.vocabularyCount} words in collection,{" "}
              {data.completedSessionCount} sessions finished.
            </p>
          </div>
          <div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.min(100, Math.max(0, data.accuracyPercent))}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Learning Consistency Widget */}
        <div className="consistency-chart-card">
          <div className="consistency-header">
            <div>
              <h3 className="text-headline-md">Learning Consistency</h3>
              <p>Your study activity this week</p>
            </div>
            <strong
              className="consistency-percentage"
              aria-label={`${consistencyPercent} consistency`}
            >
              {consistencyPercent}
            </strong>
          </div>
          <p className="consistency-summary">
            <strong>{consistency.activeElapsedDays}</strong> of{" "}
            {consistency.elapsedDays} elapsed{" "}
            {consistency.elapsedDays === 1 ? "day" : "days"} active
          </p>
          <div
            className="consistency-week"
            aria-label="Current week study activity"
            role="list"
          >
            {consistency.days.map((day) => (
              <div
                className={`consistency-day consistency-day--${day.state}${day.isActive && day.isToday ? " consistency-day--active-today" : ""}`}
                key={day.dateKey}
                aria-label={`${day.fullLabel}: ${day.statusLabel}`}
                title={`${day.fullLabel}: ${day.statusLabel}`}
                role="listitem"
              >
                <span className="consistency-weekday">{day.weekday}</span>
                <span className="consistency-date">{day.dateNumber}</span>
                <span className="consistency-marker" aria-hidden="true">
                  {day.isActive ? "✓" : day.state === "upcoming" ? "·" : "—"}
                </span>
                <span className="consistency-status">{day.statusLabel}</span>
              </div>
            ))}
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
          <dd style={{ color: "var(--secondary)" }}>
            {data.correctAnswerCount}
          </dd>
        </div>
        <div className="metric-box">
          <dt>Incorrect answers</dt>
          <dd style={{ color: "var(--error)" }}>{data.incorrectAnswerCount}</dd>
        </div>
      </dl>

      <section
        className="dashboard-folders"
        aria-labelledby="topic-folders-title"
      >
        <div className="dashboard-section-heading">
          <h3 id="topic-folders-title" className="text-headline-lg">
            Topic Folders
          </h3>
          <button
            className="btn-ghost"
            type="button"
            onClick={() => onAction?.("library")}
          >
            View All
          </button>
        </div>
        <p
          className="text-body-md"
          style={{ color: "var(--on-surface-variant)" }}
        >
          Organize your vocabulary into focused topics and continue learning
          from the library.
        </p>
        {folders.length ? (
          <div className="dashboard-folder-track" aria-label="Topic folders">
            {folders.map((folder) => (
              <article className="dashboard-folder-card" key={folder.id}>
                <span className="folder-card-icon" aria-hidden="true">
                  ▣
                </span>
                <h4 className="text-headline-md">{folder.name}</h4>
                <p className="text-body-md">{folder.vocabularyCount} words</p>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => onOpenFolder?.(folder)}
                >
                  Open folder
                </button>
              </article>
            ))}
          </div>
        ) : (
          <button
            className="btn-secondary"
            type="button"
            onClick={() => onAction?.("library")}
          >
            Browse topics
          </button>
        )}
      </section>
    </section>
  );
};
