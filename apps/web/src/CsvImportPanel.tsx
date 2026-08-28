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
    <section
      className="card"
      aria-labelledby="import-title"
      style={{
        backgroundColor: "var(--surface-white)",
        border: "1px solid var(--outline-variant)",
        padding: "24px",
        borderRadius: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <span className="material-symbols-outlined" aria-hidden="true" style={{ color: "var(--primary)" }}>
          upload_file
        </span>
        <h2 id="import-title" className="text-headline-md" style={{ fontSize: "18px", margin: 0 }}>
          Import CSV
        </h2>
      </div>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label
            htmlFor="csv"
            className="text-label-md"
            style={{ color: "var(--on-surface-variant)", display: "block", marginBottom: "6px" }}
          >
            CSV file
          </label>
          <input
            id="csv"
            name="csv"
            type="file"
            accept=".csv,text/csv"
            disabled={busy}
            style={{ padding: "8px" }}
          />
        </div>

        <button
          className="btn-primary"
          type="submit"
          disabled={busy}
          style={{ width: "100%", padding: "10px 16px" }}
        >
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>
            upload
          </span>
          {busy ? "Importing…" : "Import"}
        </button>
      </form>

      {error && (
        <p role="alert">
          {error}{" "}
          <button
            className="btn-secondary"
            type="button"
            onClick={() => setError("")}
            style={{ marginLeft: "8px", padding: "2px 8px", fontSize: "12px" }}
          >
            Retry
          </button>
        </p>
      )}

      {report && (
        <div
          role="status"
          style={{
            marginTop: "16px",
            padding: "16px",
            borderRadius: "12px",
            backgroundColor: "var(--surface-container-low)",
            fontSize: "14px",
          }}
        >
          <div style={{ display: "flex", gap: "16px", marginBottom: "8px", fontWeight: 600 }}>
            <span style={{ color: "var(--secondary)" }}>Imported: {report.imported}</span>
            <span style={{ color: report.skipped > 0 ? "var(--error)" : "var(--text-muted)" }}>
              Skipped: {report.skipped}
            </span>
          </div>
          {report.rows.length > 0 && (
            <ul
              aria-label="Skipped rows"
              style={{
                margin: "8px 0 0 0",
                paddingLeft: "20px",
                color: "var(--on-surface-variant)",
                fontSize: "13px",
              }}
            >
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
