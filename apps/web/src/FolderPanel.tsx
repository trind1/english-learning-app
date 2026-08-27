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
      className="folder-panel"
      id="folders"
      aria-labelledby="folders-title"
    >
      <div className="folder-panel-header">
        <div>
          <span className="folder-icon" aria-hidden="true" />
          <div>
            <h2 id="folders-title">Folders</h2>
            <p>Group words by topic and keep your learning organized.</p>
          </div>
        </div>
        <form className="folder-form" onSubmit={submit}>
          <label className="sr-only" htmlFor="folder-name">
            Folder name
          </label>
          <input
            id="folder-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            placeholder="e.g. Travel English"
            disabled={busy}
          />
          <button type="submit" disabled={busy}>
            <span aria-hidden="true">+</span>
            {busy ? "Saving…" : "Create folder"}
          </button>
        </form>
      </div>
      {error && (
        <p role="alert">
          {error}{" "}
          <button type="button" onClick={() => void load()}>
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
        <div className="empty-state" role="status">
          <span aria-hidden="true">Aa</span>
          <h3>No folders yet.</h3>
          <p>Create your first topic to start collecting vocabulary.</p>
        </div>
      )}
      {folders && folders.length > 0 && (
        <ul className="folder-grid" aria-label="Folder list">
          {folders.map((folder) => (
            <li key={folder.id}>
              <span className="folder-card-icon" aria-hidden="true" />
              <div>
                <strong>{folder.name}</strong>
                <span>{folder.vocabularyCount} words</span>
              </div>
              <button
                className="open-folder"
                type="button"
                onClick={() => onOpen?.(folder)}
              >
                Open
              </button>
              <span className="folder-arrow" aria-hidden="true">
                →
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
