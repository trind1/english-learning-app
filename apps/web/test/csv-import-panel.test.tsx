import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CsvImportPanel } from "../src/CsvImportPanel";
describe("TEST-014 CSV import UI", () => {
  it("reports imported and skipped rows", async () => {
    const api = {
      import: vi.fn().mockResolvedValue({
        imported: 2,
        skipped: 1,
        rows: [{ rowNumber: 3, reason: "Duplicate" }],
      }),
    };
    render(<CsvImportPanel api={api} />);
    const input = screen.getByLabelText("CSV file");
    fireEvent.change(input, {
      target: {
        files: [new File(["word,meaning"], "words.csv", { type: "text/csv" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    await waitFor(() =>
      expect(screen.getByText("Row 3: Duplicate")).toBeInTheDocument(),
    );
  });
  it("rejects non-CSV files and shows failures", async () => {
    const api = { import: vi.fn().mockRejectedValue(new Error("server")) };
    render(<CsvImportPanel api={api} />);
    fireEvent.change(screen.getByLabelText("CSV file"), {
      target: { files: [new File(["x"], "x.txt")] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Choose a CSV");
  });
});
