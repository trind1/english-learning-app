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
  if (!questions.length)
    return <p role="status">This test is not available.</p>;
  if (result)
    return (
      <section aria-label="Test results">
        <h2>Results</h2>
        <div className="result-score">
          <strong>
            {Math.round((result.correctCount / result.totalCount) * 100)}%
          </strong>
          <span>accuracy</span>
        </div>
        <dl>
          <div>
            <dt>Correct</dt>
            <dd>{result.correctCount}</dd>
          </div>
          <div>
            <dt>Incorrect</dt>
            <dd>{result.incorrectCount}</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{result.totalCount}</dd>
          </div>
        </dl>
        <p>
          {result.correctCount} correct of {result.totalCount}
        </p>
        <div className="action-row">
          <button type="button" onClick={() => onNavigate?.("folder")}>
            Back to folder
          </button>
          <button
            className="secondary"
            type="button"
            onClick={() => onNavigate?.("dashboard")}
          >
            Dashboard
          </button>
        </div>
      </section>
    );
  const q = questions[index]!;
  const choose = (choice: string) => {
    if (!answers.some((a) => a.vocabularyId === q.vocabularyId))
      setSelected(choice);
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
    <section aria-label="Multiple-choice test">
      <h2>{q.word}</h2>
      <p className="quiz-progress">
        Question {index + 1} of {questions.length}
      </p>
      <progress
        value={index + 1}
        max={questions.length}
        aria-label="Quiz progress"
      />
      {q.choices.map((choice) => (
        <button
          key={choice}
          type="button"
          aria-pressed={selected === choice}
          onClick={() => choose(choice)}
        >
          {choice}
        </button>
      ))}
      <button type="button" onClick={() => void submit()} disabled={!selected}>
        Submit answer
      </button>
      {error && <p role="alert">{error}</p>}
    </section>
  );
};
