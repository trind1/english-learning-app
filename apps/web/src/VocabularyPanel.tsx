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
    <section aria-labelledby="vocabulary-title" className="vocabulary-detail">
      {/* Action Bar & Summary Header */}
      <div
        className="card vocabulary-summary"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          padding: "16px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div>
            <h2
              id="vocabulary-title"
              className="text-headline-md"
              style={{ margin: 0 }}
            >
              Vocabulary
            </h2>
            <span
              className="text-label-md"
              style={{ color: "var(--on-surface-variant)" }}
            >
              {items?.length ?? 0} total
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "24px",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        {/* Left Column: Vocabulary List / Table */}
        <div
          style={{
            flex: "1 1 500px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {error && (
            <p role="alert" className="vocabulary-error">
              {error}
            </p>
          )}
          {items === null && !error && (
            <div
              className="card vocabulary-empty"
              style={{ padding: "32px", textAlign: "center" }}
            >
              <p
                role="status"
                className="text-body-md"
                style={{ color: "var(--on-surface-variant)" }}
              >
                Loading vocabulary…
              </p>
            </div>
          )}
          {items?.length === 0 && (
            <div
              className="card vocabulary-empty"
              style={{ padding: "40px", textAlign: "center" }}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
                style={{
                  fontSize: "48px",
                  color: "var(--outline)",
                  marginBottom: "8px",
                }}
              >
                menu_book
              </span>
              <p
                role="status"
                className="text-body-md"
                style={{ color: "var(--on-surface-variant)", margin: 0 }}
              >
                No vocabulary yet.
              </p>
            </div>
          )}

          {items && items.length > 0 && (
            <div className="vocab-table-card vocabulary-list-card">
              <ul
                className="vocabulary-list"
                aria-label="Vocabulary list"
                style={{ listStyle: "none", margin: 0, padding: 0 }}
              >
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="vocabulary-item"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 20px",
                      borderBottom: "1px solid rgba(194, 198, 214, 0.2)",
                      transition: "background-color 0.15s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "12px",
                        }}
                      >
                        <strong
                          className="text-body-lg"
                          style={{
                            color: "var(--on-surface)",
                            fontWeight: 600,
                          }}
                        >
                          {item.word}
                        </strong>
                        <span className="text-ipa-display">
                          {item.ipa || "IPA unavailable"}
                        </span>
                      </div>
                      <p
                        className="text-body-md"
                        style={{
                          color: "var(--on-surface-variant)",
                          margin: 0,
                        }}
                      >
                        {item.meaning}
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginLeft: "16px",
                      }}
                    >
                      <PronunciationButton word={item.word} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Add Entry Panel */}
        <aside
          className="card vocabulary-editor"
          style={{
            flex: "0 0 320px",
            backgroundColor: "var(--surface-white)",
            border: "1px solid var(--outline-variant)",
            padding: "24px",
            borderRadius: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{ color: "var(--primary)" }}
            >
              edit_note
            </span>
            <h3
              className="text-headline-md"
              style={{ fontSize: "18px", margin: 0 }}
            >
              Add Entry
            </h3>
          </div>

          <form
            onSubmit={submit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label
                htmlFor="word"
                className="text-label-md"
                style={{
                  color: "var(--on-surface-variant)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Word
              </label>
              <input
                id="word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                disabled={busy}
                placeholder="e.g. Ubiquitous"
              />
            </div>

            <div>
              <label
                htmlFor="meaning"
                className="text-label-md"
                style={{
                  color: "var(--on-surface-variant)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Meaning
              </label>
              <input
                id="meaning"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                disabled={busy}
                placeholder="e.g. Present everywhere"
              />
            </div>

            <div>
              <label
                htmlFor="ipa"
                className="text-label-md"
                style={{
                  color: "var(--on-surface-variant)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                IPA (optional)
              </label>
              <input
                id="ipa"
                value={ipa}
                onChange={(e) => setIpa(e.target.value)}
                disabled={busy}
                placeholder="/juːˈbɪkwɪtəs/"
              />
            </div>

            <button
              className="btn-primary"
              type="submit"
              disabled={busy}
              style={{ width: "100%", marginTop: "8px", padding: "12px" }}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
                style={{ fontSize: "18px" }}
              >
                add
              </span>
              {busy ? "Saving…" : "Add vocabulary"}
            </button>
          </form>
        </aside>
      </div>
    </section>
  );
};
