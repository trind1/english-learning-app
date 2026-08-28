import { useState } from "react";

export type SpeechPort = { supported: boolean; speak: (text: string) => void };

export const browserSpeechPort = (): SpeechPort => ({
  supported: typeof window !== "undefined" && "speechSynthesis" in window,
  speak: (text) => {
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  },
});

export const PronunciationButton = ({
  word,
  speech = browserSpeechPort(),
}: {
  word: string;
  speech?: SpeechPort;
}) => {
  const [error, setError] = useState("");

  const pronounce = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!speech.supported) {
      setError("Pronunciation is not supported in this browser.");
      return;
    }
    try {
      speech.speak(word);
    } catch {
      setError("Pronunciation failed. Try again.");
    }
  };

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
      <button
        type="button"
        className="btn-ghost"
        onClick={pronounce}
        aria-label={`Pronounce ${word}`}
        title={`Pronounce ${word}`}
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          padding: 0,
          color: "var(--primary)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}
        >
          volume_up
        </span>
        <span className="sr-only">Pronounce {word}</span>
      </button>
      {error && <p role="alert" style={{ fontSize: "12px", margin: "4px 0 0 0", padding: "4px 8px" }}>{error}</p>}
    </div>
  );
};
