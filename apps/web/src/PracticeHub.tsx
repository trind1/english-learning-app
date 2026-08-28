import { useState } from "react";

export const PracticeHub = ({
  wordCount = 0,
  onStartFlashcards,
  onStartQuiz,
  onStartAi,
}: {
  wordCount?: number;
  onStartFlashcards?: () => void;
  onStartQuiz?: () => void;
  onStartAi?: (customWords?: string) => void;
}) => {
  const [customWords, setCustomWords] = useState("");

  return (
    <section aria-label="Practice Hub" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Section Header */}
      <div style={{ marginBottom: "8px" }}>
        <h1 className="text-headline-lg" style={{ color: "var(--on-surface)", margin: "0 0 8px 0" }}>
          Practice Hub
        </h1>
        <p className="text-body-lg" style={{ color: "var(--on-surface-variant)", margin: 0, maxWidth: "640px" }}>
          Sharpen your skills with targeted exercises. Choose a mode below to begin your session.
        </p>
      </div>

      {/* Practice Modes Grid */}
      <div className="practice-grid">
        {/* Flashcard Mode */}
        <article className="practice-mode-card">
          <div
            className="mode-icon-circle"
            style={{ backgroundColor: "rgba(0, 88, 190, 0.1)", color: "var(--primary)" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}
            >
              style
            </span>
          </div>
          <h3 className="text-headline-md" style={{ color: "var(--on-surface)", margin: "0 0 8px 0" }}>
            Flashcard Mode
          </h3>
          <p
            className="text-body-md"
            style={{ color: "var(--on-surface-variant)", margin: "0 0 24px 0", flexGrow: 1 }}
          >
            Flip and Learn. Review your saved vocabulary with spaced repetition to ensure long-term retention.
          </p>
          <div
            style={{
              paddingTop: "16px",
              borderTop: "1px solid var(--surface-variant)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "auto",
            }}
          >
            <span className="text-label-md" style={{ color: "var(--text-muted)" }}>
              {wordCount > 0 ? `${wordCount} Cards Due` : "Vocabulary Cards"}
            </span>
            <button className="btn-primary" type="button" onClick={onStartFlashcards}>
              Start
            </button>
          </div>
        </article>

        {/* Multiple Choice Quiz */}
        <article className="practice-mode-card">
          <div
            className="mode-icon-circle"
            style={{ backgroundColor: "rgba(108, 248, 187, 0.2)", color: "var(--secondary)" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}
            >
              quiz
            </span>
          </div>
          <h3 className="text-headline-md" style={{ color: "var(--on-surface)", margin: "0 0 8px 0" }}>
            Multiple Choice Quiz
          </h3>
          <p
            className="text-body-md"
            style={{ color: "var(--on-surface-variant)", margin: "0 0 24px 0", flexGrow: 1 }}
          >
            Test your knowledge. Challenge yourself with grammar and vocabulary questions adapted to your level.
          </p>
          <div
            style={{
              paddingTop: "16px",
              borderTop: "1px solid var(--surface-variant)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "auto",
            }}
          >
            <span className="text-label-md" style={{ color: "var(--text-muted)" }}>
              {wordCount > 0 ? `${wordCount} Questions` : "Adaptive Questions"}
            </span>
            <button className="btn-primary" type="button" onClick={onStartQuiz}>
              Start
            </button>
          </div>
        </article>

        {/* AI Story Generator */}
        <article className="practice-mode-card">
          <div
            className="mode-icon-circle"
            style={{ backgroundColor: "rgba(163, 103, 0, 0.1)", color: "var(--tertiary)" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </div>
          <h3 className="text-headline-md" style={{ color: "var(--on-surface)", margin: "0 0 8px 0" }}>
            AI Story Generator
          </h3>
          <p
            className="text-body-md"
            style={{ color: "var(--on-surface-variant)", margin: "0 0 24px 0", flexGrow: 1 }}
          >
            Generate a story using your words. Practice reading comprehension with contextually relevant mini-stories.
          </p>
          <div style={{ paddingTop: "16px", borderTop: "1px solid var(--surface-variant)", marginTop: "auto" }}>
            <label
              className="text-label-md"
              htmlFor="word-input"
              style={{ display: "block", marginBottom: "8px", color: "var(--on-surface)" }}
            >
              Words to include (Max 10):
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                id="word-input"
                type="text"
                placeholder="e.g., resilient, ubiquitous..."
                value={customWords}
                onChange={(e) => setCustomWords(e.target.value)}
                style={{ flexGrow: 1, height: "40px", fontSize: "14px" }}
              />
              <button
                className="btn-primary"
                type="button"
                style={{ whiteSpace: "nowrap", padding: "8px 16px" }}
                onClick={() => onStartAi?.(customWords)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  bolt
                </span>{" "}
                Start
              </button>
            </div>
          </div>
        </article>
      </div>

      {/* Weekly Goal Progress Card */}
      <section
        className="card"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "24px",
          marginTop: "16px",
          backgroundColor: "var(--surface-white)",
        }}
      >
        <div
          style={{
            width: "120px",
            height: "100px",
            borderRadius: "12px",
            backgroundColor: "var(--surface-container-low)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--primary)" }}>
            monitoring
          </span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          <h3 className="text-headline-md" style={{ color: "var(--on-surface)", margin: 0 }}>
            Weekly Goal Progress
          </h3>
          <p className="text-body-md" style={{ color: "var(--on-surface-variant)", margin: 0 }}>
            You are on a streak! Complete your daily practice sessions this week to reach your goal.
          </p>
          <div className="progress-bar-container" style={{ marginTop: "4px" }}>
            <div className="progress-bar-fill" style={{ width: "60%", backgroundColor: "var(--secondary)" }} />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
              color: "var(--text-muted)",
              fontWeight: 500,
            }}
          >
            <span>3 / 5 Sessions</span>
            <span>60%</span>
          </div>
        </div>
      </section>
    </section>
  );
};
