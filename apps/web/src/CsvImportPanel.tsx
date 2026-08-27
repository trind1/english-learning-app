import { useState } from "react";

export type ImportReport = {
  imported: number;
  skipped: number;
  rows: readonly { rowNumber: number; reason: string }[];
};
export type CsvImportApi = { import: (file: File) => Promise<ImportReport> };
export const CsvImportPanel = ({ api }: { api: CsvImportApi }) => {
  const [report, setReport] = useState<ImportReport | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const file = (
      event.currentTarget.elements.namedItem("csv") as HTMLInputElement
    ).files?.[0];
    if (!file || !file.name.toLowerCase().endsWith(".csv")) {
      setError("Choose a CSV file.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      setReport(await api.import(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed. Try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section aria-labelledby="import-title">
      <h2 id="import-title">Import CSV</h2>
      <form onSubmit={submit}>
        <label htmlFor="csv">CSV file</label>
        <input
          id="csv"
          name="csv"
          type="file"
          accept=".csv,text/csv"
          disabled={busy}
        />
        <button type="submit" disabled={busy}>
          {busy ? "Importing…" : "Import"}
        </button>
      </form>
      {error && (
        <p role="alert">
          {error}{" "}
          <button type="button" onClick={() => setError("")}>
            Retry
          </button>
        </p>
      )}
      {report && (
        <div role="status">
          <p>Imported: {report.imported}</p>
          <p>Skipped: {report.skipped}</p>
          {report.rows.length > 0 && (
            <ul aria-label="Skipped rows">
              {report.rows.map((row) => (
                <li key={row.rowNumber}>
                  Row {row.rowNumber}: {row.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
};
