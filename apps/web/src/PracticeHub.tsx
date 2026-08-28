export const PracticeHub = ({
  wordCount = 0,
  onStartFlashcards,
  onStartQuiz,
  onStartAi,
}: {
  wordCount?: number;
  onStartFlashcards?: () => void;
  onStartQuiz?: () => void;
  onStartAi?: () => void;
}) => {
  return (
    <section
      aria-label="Practice Hub"
      style={{ display: "flex", flexDirection: "column", gap: "32px" }}
    >
      {/* Header Banner */}
      <div>
        <h1
          className="text-headline-lg"
          style={{ color: "var(--on-surface)", margin: "0 0 8px 0" }}
        >
          Practice Hub
        </h1>
        <p
          className="text-body-lg"
          style={{
            color: "var(--on-surface-variant)",
            margin: 0,
            maxWidth: "640px",
          }}
        >
          Select a mode to sharpen your skills. Consistent daily practice leads
          to rapid language acquisition.
        </p>
      </div>

      {/* 3 Main Practice Modes */}
      <div className="practice-cards-grid">
        {/* Flashcard Mode */}
        <article className="practice-mode-card">
          <div
            className="mode-icon-circle"
            style={{
              backgroundColor: "var(--primary-fixed)",
              color: "var(--primary)",
            }}
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}
            >
              style
            </span>
          </div>
          <h3
            className="text-headline-md"
            style={{ color: "var(--on-surface)", margin: "0 0 8px 0" }}
          >
            Flashcard Mode
          </h3>
          <p
            className="text-body-md"
            style={{
              color: "var(--on-surface-variant)",
              margin: "0 0 24px 0",
              flexGrow: 1,
            }}
          >
            Flip and Learn. Review your saved vocabulary with spaced repetition
            to ensure long-term retention.
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
            <span
              className="text-label-md"
              style={{ color: "var(--text-muted)" }}
            >
              {wordCount > 0 ? `${wordCount} Cards Due` : "Vocabulary Cards"}
            </span>
            <button
              className="btn-primary"
              type="button"
              aria-label="Start flashcards"
              onClick={onStartFlashcards}
            >
              Start
            </button>
          </div>
        </article>

        {/* Multiple Choice Quiz */}
        <article className="practice-mode-card">
          <div
            className="mode-icon-circle"
            style={{
              backgroundColor: "rgba(108, 248, 187, 0.2)",
              color: "var(--secondary)",
            }}
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}
            >
              quiz
            </span>
          </div>
          <h3
            className="text-headline-md"
            style={{ color: "var(--on-surface)", margin: "0 0 8px 0" }}
          >
            Multiple Choice Quiz
          </h3>
          <p
            className="text-body-md"
            style={{
              color: "var(--on-surface-variant)",
              margin: "0 0 24px 0",
              flexGrow: 1,
            }}
          >
            Test your knowledge. Challenge yourself with grammar and vocabulary
            questions adapted to your level.
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
            <span
              className="text-label-md"
              style={{ color: "var(--text-muted)" }}
            >
              {wordCount > 0 ? `${wordCount} Questions` : "Adaptive Questions"}
            </span>
            <button
              className="btn-primary"
              type="button"
              aria-label="Start quiz"
              onClick={onStartQuiz}
            >
              Start
            </button>
          </div>
        </article>

        {/* AI Story Generator */}
        <article className="practice-mode-card">
          <div
            className="mode-icon-circle"
            style={{
              backgroundColor: "rgba(224, 187, 255, 0.3)",
              color: "#7B2CBF",
            }}
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}
            >
              auto_stories
            </span>
          </div>
          <h3
            className="text-headline-md"
            style={{ color: "var(--on-surface)", margin: "0 0 8px 0" }}
          >
            AI Story Generator
          </h3>
          <p
            className="text-body-md"
            style={{
              color: "var(--on-surface-variant)",
              margin: "0 0 24px 0",
              flexGrow: 1,
            }}
          >
            Generate a story using your saved words. Practice reading
            comprehension with contextually relevant mini-stories.
          </p>
          <div
            style={{
              paddingTop: "16px",
              borderTop: "1px solid var(--surface-variant)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "auto",
            }}
          >
            <p
              className="text-label-md"
              style={{ color: "var(--text-muted)", margin: 0 }}
            >
              Choose up to 10 saved words in the next step.
            </p>
            <button
              className="btn-primary"
              type="button"
              aria-label="Start AI story"
              onClick={onStartAi}
            >
              Start
            </button>
          </div>
        </article>
      </div>

      {/* Weekly Goal Progress Card */}
      <div
        className="card"
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 className="text-headline-md" style={{ margin: 0 }}>
              Weekly Goal Progress
            </h3>
            <p
              className="text-body-md"
              style={{ color: "var(--on-surface-variant)", margin: 0 }}
            >
              5 of 7 days practiced
            </p>
          </div>
          <span
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--primary)",
            }}
          >
            71%
          </span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: "71%" }} />
        </div>
      </div>
    </section>
  );
};
