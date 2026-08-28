import { useEffect, useState } from "react";
import type { FolderSummary } from "@english-learning/contracts";

export type FolderApi = {
  list: () => Promise<FolderSummary[]>;
  create: (name: string) => Promise<FolderSummary>;
};

export const FolderPanel = ({
  api,
  onOpen,
}: {
  api: FolderApi;
  onOpen?: (folder: FolderSummary) => void;
}) => {
  const [folders, setFolders] = useState<FolderSummary[] | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setError("");
    try {
      setFolders(await api.list());
    } catch {
      setError("Unable to load folders. Try again.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 50) {
      setError("Folder name must contain 1 to 50 characters.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const folder = await api.create(trimmed);
      setFolders((current) => [...(current ?? []), folder]);
      setName("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to create folder. Try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className="card"
      id="folders"
      aria-labelledby="folders-title"
      style={{ display: "flex", flexDirection: "column", gap: "24px" }}
    >
      {/* Header & Creation Form */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          paddingBottom: "20px",
          borderBottom: "1px solid var(--surface-variant)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: "rgba(0, 88, 190, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary)",
            }}
          >
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "24px" }}>
              folder
            </span>
          </div>
          <div>
            <h2 id="folders-title" className="text-headline-md" style={{ margin: 0 }}>
              Folders
            </h2>
            <p className="text-body-md" style={{ color: "var(--on-surface-variant)", margin: "2px 0 0 0" }}>
              Group words by topic and keep your learning organized.
            </p>
          </div>
        </div>

        <form onSubmit={submit} style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <label className="sr-only" htmlFor="folder-name">
            Folder name
          </label>
          <input
            id="folder-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            placeholder="e.g. Business English"
            disabled={busy}
            style={{ minWidth: "220px", height: "42px" }}
          />
          <button className="btn-primary" type="submit" disabled={busy} style={{ height: "42px" }}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>
              add
            </span>
            {busy ? "Saving…" : "Create folder"}
          </button>
        </form>
      </div>

      {error && (
        <p role="alert">
          {error}{" "}
          <button className="btn-secondary" type="button" onClick={() => void load()} style={{ marginLeft: "8px", padding: "4px 8px" }}>
            Retry
          </button>
        </p>
      )}

      {folders === null && !error && (
        <p className="panel-state" role="status">
          Loading folders…
        </p>
      )}

      {folders?.length === 0 && (
        <div
          className="empty-state"
          role="status"
          style={{
            textAlign: "center",
            padding: "48px 24px",
            backgroundColor: "var(--surface-container-low)",
            borderRadius: "16px",
          }}
        >
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "48px", color: "var(--primary)", marginBottom: "12px" }}>
            create_new_folder
          </span>
          <h3 className="text-headline-md" style={{ margin: "0 0 8px 0" }}>
            No folders yet.
          </h3>
          <p className="text-body-md" style={{ color: "var(--on-surface-variant)", margin: 0 }}>
            Create your first topic to start collecting vocabulary.
          </p>
        </div>
      )}

      {folders && folders.length > 0 && (
        <ul className="folder-grid" aria-label="Folder list">
          {folders.map((folder) => (
            <li
              key={folder.id}
              className="folder-card"
            >
              <div className="folder-card-icon">
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "28px" }}>
                  topic
                </span>
              </div>
              <h3 className="text-headline-md" style={{ fontSize: "20px", margin: "0 0 6px 0", color: "var(--on-surface)" }}>
                {folder.name}
              </h3>
              <p className="text-body-md" style={{ color: "var(--on-surface-variant)", margin: "0 0 16px 0" }}>
                Curated collection for focused study.
              </p>
              <div className="folder-card-footer">
                <span className="text-label-md" style={{ color: "var(--on-surface-variant)", fontWeight: 600 }}>
                  {folder.vocabularyCount} words
                </span>
                <button
                  className="open-folder btn-primary"
                  type="button"
                  onClick={() => onOpen?.(folder)}
                  style={{ padding: "6px 14px", fontSize: "13px" }}
                >
                  Open
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
