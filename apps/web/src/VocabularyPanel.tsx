import { useEffect, useState } from "react";
import { PronunciationButton } from "./PronunciationButton";

export type VocabularyItem = {
  id: string;
  word: string;
  meaning: string;
  ipa: string | null;
};
export type VocabularyApi = {
  list: () => Promise<VocabularyItem[]>;
  create: (input: {
    word: string;
    meaning: string;
    ipa?: string | null;
  }) => Promise<VocabularyItem>;
};
export const VocabularyPanel = ({
  api,
  onChanged,
}: {
  api: VocabularyApi;
  onChanged?: (items: VocabularyItem[]) => void;
}) => {
  const [items, setItems] = useState<VocabularyItem[] | null>(null);
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [ipa, setIpa] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    void api
      .list()
      .then(setItems)
      .catch(() => setError("Unable to load vocabulary. Try again."));
  }, [api]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !word.trim() ||
      !meaning.trim() ||
      word.trim().length > 100 ||
      meaning.trim().length > 500
    ) {
      setError("Word and meaning are required within the allowed limits.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const item = await api.create({
        word: word.trim(),
        meaning: meaning.trim(),
        ipa: ipa.trim() || null,
      });
      const next = [...(items ?? []), item];
      setItems(next);
      onChanged?.(next);
      setWord("");
      setMeaning("");
      setIpa("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to save vocabulary. Try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <section aria-labelledby="vocabulary-title">
      <div className="section-title">
        <div>
          <span className="eyebrow">Words</span>
          <h2 id="vocabulary-title">Vocabulary</h2>
        </div>
        <span>{items?.length ?? 0} total</span>
      </div>
      <form className="vocabulary-form" onSubmit={submit}>
        <label htmlFor="word">Word</label>
        <input
          id="word"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          disabled={busy}
        />
        <label htmlFor="meaning">Meaning</label>
        <input
          id="meaning"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          disabled={busy}
        />
        <label htmlFor="ipa">IPA (optional)</label>
        <input
          id="ipa"
          value={ipa}
          onChange={(e) => setIpa(e.target.value)}
          disabled={busy}
        />
        <button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Add vocabulary"}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      {items === null && !error && <p role="status">Loading vocabulary…</p>}
      {items?.length === 0 && <p role="status">No vocabulary yet.</p>}
      {items && items.length > 0 && (
        <ul className="vocabulary-list" aria-label="Vocabulary list">
          {items.map((item) => (
            <li key={item.id}>
              <strong>{item.word}</strong>{" "}
              <span>{item.ipa || "IPA unavailable"}</span> — {item.meaning}
              <PronunciationButton word={item.word} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
