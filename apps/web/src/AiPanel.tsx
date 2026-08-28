import { useState } from "react";

export const AiPanel = ({
  words,
  generate,
  enabled = true,
  onFinish,
}: {
  words: readonly {
    id: string;
    word: string;
    meaning?: string;
    ipa?: string | null;
  }[];
  generate: (ids: readonly string[]) => Promise<string>;
  enabled?: boolean;
  onFinish?: () => void;
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

  // Helper to render text with highlighted words if words are selected
  const renderHighlightedStory = (storyText: string) => {
    const selectedWordObjects = words.filter((w) => selected.includes(w.id));
    if (!selectedWordObjects.length) return storyText;

    const regex = new RegExp(
      `\\b(${selectedWordObjects.map((w) => w.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
      "gi",
    );

    const parts = storyText.split(regex);
    return parts.map((part, i) => {
      const match = selectedWordObjects.find(
        (w) => w.word.toLowerCase() === part.toLowerCase(),
      );
      if (match) {
        return (
          <span key={i} className="highlighted-word" data-word={match.word}>
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <section
      aria-label="AI text generation"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2
            className="text-headline-lg"
            style={{ color: "var(--on-surface)", margin: 0 }}
          >
            AI text
          </h2>
          <p
            className="text-body-md"
            style={{ color: "var(--on-surface-variant)", margin: "4px 0 0 0" }}
          >
            Generate natural reading material using your selected vocabulary.
          </p>
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
        {/* Story Canvas (Left/Center) */}
        <div
          className="story-canvas"
          style={{
            flex: "1 1 480px",
            display: "flex",
            flexDirection: "column",
            minHeight: "360px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "20px",
            }}
          >
            <div>
              <h3
                className="text-headline-md"
                style={{ color: "var(--on-surface)", margin: 0 }}
              >
                {text ? "Generated Story" : "Story Generator"}
              </h3>
              <p
                className="text-label-md"
                style={{
                  color: "var(--on-surface-variant)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "4px",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                  style={{ fontSize: "18px" }}
                >
                  auto_stories
                </span>{" "}
                AI Generated
                <span>•</span>
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                  style={{ fontSize: "18px" }}
                >
                  schedule
                </span>{" "}
                2 Min Read
              </p>
            </div>
          </div>

          <div
            style={{ flex: 1, lineHeight: "1.8", color: "var(--on-surface)" }}
          >
            {text ? (
              <output
                aria-label="Generated text"
                className="text-body-lg"
                style={{ display: "block", whiteSpace: "pre-wrap" }}
              >
                AI-generated: {renderHighlightedStory(text)}
              </output>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "200px",
                  color: "var(--text-muted)",
                  textAlign: "center",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                  style={{
                    fontSize: "48px",
                    opacity: 0.5,
                    marginBottom: "8px",
                  }}
                >
                  auto_awesome
                </span>
                <p>
                  Select words from the right and click "Generate text" to build
                  your contextual story.
                </p>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div
            style={{
              paddingTop: "16px",
              marginTop: "20px",
              borderTop: "1px solid var(--surface-variant)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <button
              className="btn-primary"
              type="button"
              onClick={() => void submit()}
              disabled={busy}
              style={{ padding: "10px 20px" }}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
                style={{ fontSize: "18px" }}
              >
                {busy ? "hourglass_empty" : "refresh"}
              </span>
              {busy ? "Generating…" : "Generate text"}
            </button>
            {onFinish && (
              <button
                className="btn-secondary"
                type="button"
                onClick={onFinish}
              >
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                  style={{ fontSize: "18px" }}
                >
                  check_circle
                </span>
                Finish Session
              </button>
            )}
          </div>
        </div>

        {/* Words Practiced Panel (Right) */}
        <aside
          className="card"
          style={{
            flex: "0 0 320px",
            maxHeight: "560px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3
              className="text-headline-md"
              style={{
                fontSize: "18px",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
                style={{ color: "var(--primary)" }}
              >
                school
              </span>
              Words Practiced
            </h3>
            <span
              className="text-label-md"
              style={{ color: "var(--text-muted)" }}
            >
              {selected.length}/10 selected
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {words.length === 0 ? (
              <p
                className="text-body-md"
                style={{ color: "var(--text-muted)", margin: 0 }}
              >
                No vocabulary available to select.
              </p>
            ) : (
              words.map((w) => {
                const isChecked = selected.includes(w.id);
                return (
                  <label
                    key={w.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: `1px solid ${isChecked ? "var(--primary)" : "var(--outline-variant)"}`,
                      backgroundColor: isChecked
                        ? "var(--primary-fixed)"
                        : "var(--surface)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(w.id)}
                      disabled={busy}
                      style={{
                        width: "18px",
                        height: "18px",
                        accentColor: "var(--primary)",
                        cursor: "pointer",
                      }}
                    />
                    <span
                      className="text-body-md"
                      style={{
                        fontWeight: 600,
                        color: isChecked
                          ? "var(--primary)"
                          : "var(--on-surface)",
                      }}
                    >
                      {w.word}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </aside>
      </div>

      {error && <p role="alert">{error}</p>}
    </section>
  );
};
