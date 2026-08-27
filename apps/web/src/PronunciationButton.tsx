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
  const pronounce = () => {
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
    <div>
      <button type="button" onClick={pronounce}>
        Pronounce {word}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
};
