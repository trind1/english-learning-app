import { useState } from "react";

export type Question = {
  vocabularyId: string;
  word: string;
  choices: readonly string[];
};

export type TestApi = {
  submit: (
    answers: readonly { vocabularyId: string; selectedMeaning: string }[],
  ) => Promise<{
    correctCount: number;
    incorrectCount: number;
    totalCount: number;
  }>;
};

const choiceLetters = ["A", "B", "C", "D", "E", "F"];

export const TestSession = ({
  questions,
  api,
  onNavigate,
}: {
  questions: readonly Question[];
  api: TestApi;
  onNavigate?: (target: "dashboard" | "folder") => void;
}) => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string>();
  const [answers, setAnswers] = useState<
    { vocabularyId: string; selectedMeaning: string }[]
  >([]);
  const [result, setResult] = useState<{
    correctCount: number;
    incorrectCount: number;
    totalCount: number;
  }>();
  const [error, setError] = useState("");

  if (!questions.length) {
    return (
      <div
        className="card"
        style={{ textAlign: "center", padding: "48px 24px" }}
      >
        <span
          className="material-symbols-outlined"
          aria-hidden="true"
          style={{
            fontSize: "48px",
            color: "var(--outline)",
            marginBottom: "16px",
          }}
        >
          quiz
        </span>
        <p
          role="status"
          className="text-body-lg"
          style={{ color: "var(--on-surface-variant)" }}
        >
          This test is not available.
        </p>
      </div>
    );
  }

  if (result) {
    const accuracyPercent = Math.round(
      (result.correctCount / result.totalCount) * 100,
    );
    return (
      <section
        aria-label="Test results"
        className="card"
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          textAlign: "center",
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            className="material-symbols-outlined"
            aria-hidden="true"
            style={{
              fontSize: "56px",
              color:
                accuracyPercent >= 70 ? "var(--secondary)" : "var(--primary)",
              fontVariationSettings: "'FILL' 1",
            }}
          >
            {accuracyPercent >= 70 ? "stars" : "check_circle"}
          </span>
          <h2
            className="text-headline-lg"
            style={{ color: "var(--on-surface)", margin: 0 }}
          >
            Results
          </h2>
          <p
            className="text-body-md"
            style={{ color: "var(--on-surface-variant)", margin: 0 }}
          >
            {result.correctCount} correct of {result.totalCount}
          </p>
        </div>

        {/* Big Accuracy Score Display */}
        <div
          style={{
            padding: "24px",
            borderRadius: "16px",
            backgroundColor: "var(--surface-container-low)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span
            className="text-display-lg"
            style={{ color: "var(--primary)", lineHeight: 1 }}
          >
            {accuracyPercent}%
          </span>
          <span
            className="text-label-md"
            style={{ color: "var(--text-muted)", marginTop: "4px" }}
          >
            accuracy
          </span>
        </div>

        {/* Metrics dl */}
        <dl className="metrics-grid">
          <div className="metric-box">
            <dt>Correct</dt>
            <dd style={{ color: "var(--secondary)" }}>{result.correctCount}</dd>
          </div>
          <div className="metric-box">
            <dt>Incorrect</dt>
            <dd style={{ color: "var(--error)" }}>{result.incorrectCount}</dd>
          </div>
          <div className="metric-box">
            <dt>Total</dt>
            <dd>{result.totalCount}</dd>
          </div>
        </dl>

        {/* Action Row */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            marginTop: "8px",
          }}
        >
          <button
            className="btn-primary"
            type="button"
            onClick={() => onNavigate?.("folder")}
          >
            Back to folder
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => onNavigate?.("dashboard")}
          >
            Dashboard
          </button>
        </div>
      </section>
    );
  }

  const q = questions[index]!;

  const choose = (choice: string) => {
    if (!answers.some((a) => a.vocabularyId === q.vocabularyId)) {
      setSelected(choice);
    }
  };

  const submit = async () => {
    if (!selected) return;
    const next = [
      ...answers,
      { vocabularyId: q.vocabularyId, selectedMeaning: selected },
    ];
    setAnswers(next);
    setSelected(undefined);
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      return;
    }
    try {
      setResult(await api.submit(next));
    } catch {
      setError("Unable to complete the test. Try again.");
    }
  };

  return (
    <section
      aria-label="Multiple-choice test"
      style={{
        maxWidth: "680px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* Progress Header */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span
            className="text-label-md"
            style={{
              color: "var(--on-surface-variant)",
              textTransform: "uppercase",
            }}
          >
            Lesson Progress
          </span>
          <span
            className="text-label-md"
            style={{ color: "var(--primary)", fontWeight: 700 }}
          >
            Question {index + 1} of {questions.length}
          </span>
        </div>
        <progress
          value={index + 1}
          max={questions.length}
          aria-label="Quiz progress"
          style={{
            width: "100%",
            height: "8px",
            borderRadius: "9999px",
            accentColor: "var(--primary)",
          }}
        />
      </div>

      {/* Quiz Card */}
      <div
        className="card"
        style={{
          padding: "32px 24px",
          backgroundColor: "var(--surface-white)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <p
            className="text-label-md"
            style={{ color: "var(--outline)", marginBottom: "8px" }}
          >
            Choose the correct meaning for:
          </p>
          <h2
            className="text-headline-lg"
            style={{ color: "var(--on-surface)", margin: 0 }}
          >
            {q.word}
          </h2>
        </div>

        {/* Bento-style Choice Buttons */}
        <div className="quiz-bento-grid">
          {q.choices.map((choice, i) => {
            const letter = choiceLetters[i] ?? String(i + 1);
            const isSelected = selected === choice;
            return (
              <button
                key={choice}
                type="button"
                className={`quiz-option-card ${isSelected ? "selected" : ""}`}
                aria-pressed={isSelected}
                onClick={() => choose(choice)}
              >
                <div className="option-letter-badge" aria-hidden="true">
                  {letter}
                </div>
                <span
                  className="text-body-lg"
                  style={{ fontWeight: isSelected ? 600 : 400 }}
                >
                  {choice}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          className="btn-ghost"
          type="button"
          onClick={() => {
            if (index + 1 < questions.length) setIndex(index + 1);
          }}
          style={{ fontWeight: 600, color: "var(--outline)" }}
        >
          Skip Question
        </button>
        <button
          className="btn-primary"
          type="button"
          onClick={() => void submit()}
          disabled={!selected}
          style={{ padding: "12px 28px", fontSize: "16px" }}
        >
          <span>Submit answer</span>
          <span
            className="material-symbols-outlined"
            aria-hidden="true"
            style={{ fontSize: "20px" }}
          >
            arrow_forward
          </span>
        </button>
      </div>

      {error && <p role="alert">{error}</p>}
    </section>
  );
};
