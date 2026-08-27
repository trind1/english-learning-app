import { useEffect, useState } from "react";
import type { FolderSummary } from "@english-learning/contracts";

export type FolderApi = {
  list: () => Promise<FolderSummary[]>;
  create: (name: string) => Promise<FolderSummary>;
};
export const FolderPanel = ({ api }: { api: FolderApi }) => {
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
    <section id="folders" aria-labelledby="folders-title">
      <h2 id="folders-title">Folders</h2>
      <form onSubmit={submit}>
        <label htmlFor="folder-name">Folder name</label>
        <input
          id="folder-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          disabled={busy}
        />
        <button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Create folder"}
        </button>
      </form>
      {error && (
        <p role="alert">
          {error}{" "}
          <button type="button" onClick={() => void load()}>
            Retry
          </button>
        </p>
      )}
      {folders === null && !error && <p role="status">Loading folders…</p>}
      {folders?.length === 0 && <p role="status">No folders yet.</p>}
      {folders && folders.length > 0 && (
        <ul aria-label="Folder list">
          {folders.map((folder) => (
            <li key={folder.id}>{folder.name}</li>
          ))}
        </ul>
      )}
    </section>
  );
};
