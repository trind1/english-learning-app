import { useState } from "react";

export type AiStoryResult = Readonly<{
  story: string;
  usedWords: readonly string[];
  source: "local" | "openai" | "gemini";
}>;

type AiWord = Readonly<{
  id: string;
  word: string;
  meaning?: string;
  ipa?: string | null;
}>;

const escapePattern = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const HighlightedStory = ({
  story,
  words,
}: {
  story: string;
  words: readonly string[];
}) => {
  if (words.length === 0) return story;
  const pattern = new RegExp(`(${words.map(escapePattern).join("|")})`, "gi");
  return story.split(pattern).map((part, index) => {
    const matchedWord = words.find(
      (word) => word.toLocaleLowerCase() === part.toLocaleLowerCase(),
    );
    return matchedWord ? (
      <mark className="highlighted-word" key={`${index}-${part}`}>
        {part}
      </mark>
    ) : (
      part
    );
  });
};

export const AiPanel = ({
  words,
  generate,
  enabled = true,
  onFinish,
}: {
  words: readonly AiWord[];
  generate: (ids: readonly string[]) => Promise<AiStoryResult>;
  enabled?: boolean;
  onFinish?: () => void;
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<AiStoryResult>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const toggle = (id: string) => {
    setError("");
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length === 10) {
        setError("You can select up to 10 vocabulary words.");
        return current;
      }
      return [...current, id];
    });
  };

  const submit = async () => {
    if (!enabled || selected.length === 0 || busy) return;
    setBusy(true);
    setError("");
    try {
      setResult(await generate(selected));
    } catch {
      setError("Unable to generate a story right now. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const selectedWords = words.filter(({ id }) => selected.includes(id));

  return (
    <section className="ai-generator" aria-label="AI story generation">
      <div className="ai-generator-layout">
        <aside className="card ai-vocabulary-picker">
          <div className="ai-picker-heading">
            <div>
              <p className="ai-kicker">Vocabulary</p>
              <h2>Select words</h2>
            </div>
            <strong aria-live="polite">Selected {selected.length} / 10</strong>
          </div>
          <p className="text-body-md ai-picker-help">
            Choose 1–10 words from this folder. The story will use every
            selected word.
          </p>
          <div className="ai-word-list">
            {words.length === 0 ? (
              <p className="text-body-md">No vocabulary available to select.</p>
            ) : (
              words.map((item) => {
                const checked = selected.includes(item.id);
                return (
                  <label
                    className={`ai-word-option${checked ? " selected" : ""}`}
                    key={item.id}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={busy}
                      onChange={() => toggle(item.id)}
                      aria-label={item.word}
                    />
                    <span className="ai-word-copy">
                      <strong>{item.word}</strong>
                      {item.ipa && <span>{item.ipa}</span>}
                      {item.meaning && <small>{item.meaning}</small>}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </aside>

        <article className="ai-story-surface">
          <header>
            <div>
              <p className="ai-kicker">AI Story</p>
              <h2>
                {result ? "Your generated story" : "Learn through context"}
              </h2>
            </div>
            {result?.source === "local" && (
              <span className="ai-local-badge">Local preview</span>
            )}
          </header>
          {result ? (
            <>
              <output
                className="ai-story-text"
                aria-label="Generated story"
                data-source={result.source}
              >
                <HighlightedStory
                  story={result.story}
                  words={result.usedWords}
                />
              </output>
              <div className="ai-used-words" aria-label="Used vocabulary">
                <strong>Used vocabulary</strong>
                <div>
                  {result.usedWords.map((word) => (
                    <span key={word}>{word}</span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="ai-story-empty">
              <span className="material-symbols-outlined" aria-hidden="true">
                auto_awesome
              </span>
              <p>
                Select vocabulary, then generate a concise English story using
                every word.
              </p>
            </div>
          )}
          {!enabled && <p role="alert">AI text generation is unavailable.</p>}
          {error && <p role="alert">{error}</p>}
          <footer className="ai-story-actions">
            <button
              className="btn-primary"
              type="button"
              onClick={() => void submit()}
              disabled={!enabled || selected.length === 0 || busy}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {busy ? "hourglass_empty" : "auto_awesome"}
              </span>
              {busy
                ? "Generating story…"
                : result
                  ? "Generate Again"
                  : "Generate Story"}
            </button>
            {onFinish && (
              <button
                className="btn-secondary"
                type="button"
                onClick={onFinish}
              >
                Back to Practice
              </button>
            )}
          </footer>
          {selectedWords.length > 0 && (
            <p className="ai-selection-summary">
              Ready to use: {selectedWords.map(({ word }) => word).join(", ")}
            </p>
          )}
        </article>
      </div>
    </section>
  );
};
