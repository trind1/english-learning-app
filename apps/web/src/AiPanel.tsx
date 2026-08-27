import { useState } from "react";
export const AiPanel = ({
  words,
  generate,
  enabled = true,
}: {
  words: readonly { id: string; word: string }[];
  generate: (ids: readonly string[]) => Promise<string>;
  enabled?: boolean;
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const toggle = (id: string) =>
    setSelected((s) =>
      s.includes(id)
        ? s.filter((x) => x !== id)
        : s.length < 10
          ? [...s, id]
          : s,
    );
  const submit = async () => {
    if (!enabled) {
      setError("AI text generation is unavailable.");
      return;
    }
    if (selected.length < 1) {
      setError("Select at least one word.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      setText(await generate(selected));
    } catch {
      setError("AI generation failed. Try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section aria-label="AI text generation">
      <h2>AI text</h2>
      {words.map((w) => (
        <label key={w.id}>
          <input
            type="checkbox"
            checked={selected.includes(w.id)}
            onChange={() => toggle(w.id)}
            disabled={busy}
          />
          {w.word}
        </label>
      ))}
      <button type="button" onClick={() => void submit()} disabled={busy}>
        {busy ? "Generating…" : "Generate text"}
      </button>
      {error && <p role="alert">{error}</p>}
      {text && (
        <output aria-label="Generated text">AI-generated: {text}</output>
      )}
    </section>
  );
};
