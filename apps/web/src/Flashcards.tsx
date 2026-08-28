import { useState } from "react";
import type { VocabularyItem } from "./VocabularyPanel";
import { PronunciationButton } from "./PronunciationButton";

export type Shuffle = <T>(items: readonly T[]) => T[];

export const Flashcards = ({
  items,
  shuffle = (values) => [...values].sort(() => Math.random() - 0.5),
  onClose,
}: {
  items: readonly VocabularyItem[];
  shuffle?: Shuffle;
  onClose?: () => void;
}) => {
  const [cards, setCards] = useState(() => shuffle(items));
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  if (!items.length) {
    return (
      <section
        aria-label="Flashcards"
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
          style
        </span>
        <h2
          className="text-headline-md"
          style={{ color: "var(--on-surface)", marginBottom: "8px" }}
        >
          Flashcards
        </h2>
        <p
          role="status"
          className="text-body-md"
          style={{ color: "var(--on-surface-variant)" }}
        >
          No vocabulary available for flashcards.
        </p>
      </section>
    );
  }

  const card = cards[index]!;

  const restart = () => {
    setCards(shuffle(items));
    setIndex(0);
    setRevealed(false);
  };

  const move = (nextIndex: number) => {
    setIndex((nextIndex + cards.length) % cards.length);
    setRevealed(false);
  };

  const progressPercent = Math.round(((index + 1) / cards.length) * 100);

  return (
    <section
      aria-label="Flashcards"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      {/* Top Focus Header Bar */}
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          padding: "12px 16px",
          backgroundColor: "var(--surface-white)",
          borderRadius: "16px",
          border: "1px solid var(--outline-variant)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {onClose && (
            <button
              type="button"
              className="btn-ghost"
              onClick={onClose}
              aria-label="Close session"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                padding: 0,
              }}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                close
              </span>
            </button>
          )}
          <h2
            className="text-headline-md"
            style={{ margin: 0, color: "var(--primary)", fontSize: "20px" }}
          >
            Flashcards
          </h2>
        </div>

        {/* Progress Bar & Counter */}
        <div style={{ flex: 1, maxWidth: "340px", margin: "0 24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "4px",
            }}
          >
            <span
              className="text-label-md"
              style={{ color: "var(--on-surface-variant)", fontSize: "12px" }}
            >
              Progress
            </span>
            <span
              className="text-label-md"
              aria-label="Flashcard progress"
              style={{
                color: "var(--primary)",
                fontWeight: 700,
                fontSize: "12px",
              }}
            >
              {index + 1} / {cards.length}
            </span>
          </div>
          <div className="progress-bar-container" style={{ height: "6px" }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "12px",
              backgroundColor: "rgba(0, 88, 190, 0.1)",
              color: "var(--primary)",
              fontWeight: 700,
              fontSize: "13px",
            }}
          >
            Score: {progressPercent * 10}
          </span>
        </div>
      </div>

      {/* 3D Flashcard */}
      <div
        className="perspective-1000"
        style={{ width: "100%", maxWidth: "640px", minHeight: "360px" }}
      >
        <div
          className={`flashcard-3d-card ${revealed ? "rotate-y-180" : ""}`}
          onClick={() => setRevealed(!revealed)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setRevealed(!revealed);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={
            revealed
              ? "Flip flashcard to hide meaning"
              : "Flip flashcard to show meaning"
          }
          style={{ minHeight: "360px" }}
        >
          {/* Front (Side A) */}
          <div className="flashcard-face">
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                textAlign: "center",
              }}
            >
              <h3
                className="text-display-lg"
                style={{ color: "var(--on-surface)", margin: 0 }}
              >
                {card.word}
              </h3>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <p className="text-ipa-display" style={{ margin: 0 }}>
                  {card.ipa || "IPA unavailable"}
                </p>
                <PronunciationButton word={card.word} />
              </div>
            </div>
            <div
              style={{
                paddingTop: "16px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "center",
                color: "var(--on-surface-variant)",
                fontSize: "14px",
              }}
            >
              <span>Tap card to show meaning</span>
            </div>
          </div>

          {/* Back (Side B) */}
          <div className="flashcard-face back">
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              <div>
                <span
                  className="text-label-md"
                  style={{
                    color: "var(--primary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: 700,
                  }}
                >
                  Meaning
                </span>
                <p
                  className="text-headline-md"
                  style={{ color: "var(--on-surface)", margin: "4px 0 0 0" }}
                >
                  {card.meaning}
                </p>
              </div>
              <div
                style={{
                  backgroundColor: "var(--surface-container-low)",
                  padding: "16px",
                  borderRadius: "12px",
                  fontStyle: "italic",
                  color: "var(--on-surface-variant)",
                }}
              >
                "{card.word} in context is key to natural fluency."
              </div>
            </div>
            <div
              style={{
                paddingTop: "16px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "center",
                color: "var(--on-surface-variant)",
                fontSize: "14px",
              }}
            >
              <span>How well did you know this?</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div
        style={{
          width: "100%",
          maxWidth: "640px",
          marginTop: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          alignItems: "center",
        }}
      >
        {!revealed ? (
          <button
            className="btn-primary"
            type="button"
            onClick={() => setRevealed(true)}
            style={{
              width: "100%",
              maxWidth: "260px",
              padding: "14px 28px",
              fontSize: "16px",
            }}
          >
            Reveal meaning
          </button>
        ) : (
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <button
              type="button"
              onClick={() => move(index + 1)}
              style={{
                flex: 1,
                backgroundColor: "var(--error-container)",
                color: "var(--on-error-container)",
                padding: "12px",
                borderRadius: "12px",
                fontWeight: 600,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <span>Hard</span>
              <span style={{ fontSize: "11px", opacity: 0.8 }}>&lt; 1m</span>
            </button>
            <button
              type="button"
              onClick={() => move(index + 1)}
              style={{
                flex: 1,
                backgroundColor: "var(--surface-container-high)",
                color: "var(--on-surface)",
                border: "1px solid var(--outline-variant)",
                padding: "12px",
                borderRadius: "12px",
                fontWeight: 600,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <span>Good</span>
              <span style={{ fontSize: "11px", opacity: 0.8 }}>10m</span>
            </button>
            <button
              type="button"
              onClick={() => move(index + 1)}
              style={{
                flex: 1,
                backgroundColor: "var(--secondary)",
                color: "var(--on-secondary)",
                padding: "12px",
                borderRadius: "12px",
                fontWeight: 600,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <span>Easy</span>
              <span style={{ fontSize: "11px", opacity: 0.8 }}>4d</span>
            </button>
          </div>
        )}

        {/* Secondary Controls Bar */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            className="btn-secondary"
            type="button"
            onClick={() => move(index - 1)}
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{ fontSize: "18px" }}
            >
              arrow_back
            </span>
            Previous
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => move(index + 1)}
          >
            Next
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{ fontSize: "18px" }}
            >
              arrow_forward
            </span>
          </button>
          <button className="btn-secondary" type="button" onClick={restart}>
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{ fontSize: "18px" }}
            >
              shuffle
            </span>
            Shuffle
          </button>
          <button className="btn-secondary" type="button" onClick={restart}>
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{ fontSize: "18px" }}
            >
              restart_alt
            </span>
            Restart
          </button>
        </div>
      </div>
    </section>
  );
};
