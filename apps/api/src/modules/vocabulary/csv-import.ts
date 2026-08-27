import { createVocabularyRequestSchema } from "@english-learning/contracts";
import { z } from "zod";

import type {
  ImportVocabularyRecord,
  VocabularyImportRepository,
} from "./vocabulary-repository";
import type { VocabularyService } from "./vocabulary-service";

export class CsvHeaderError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "CsvHeaderError";
  }
}
export class CsvFileError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "CsvFileError";
  }
}

export type CsvImportReport = {
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  imported: { row: number; vocabularyId: string }[];
  skipped: { row: number; code: string; message: string }[];
};

export const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"' && cell.length === 0) quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (quoted)
    throw new CsvFileError("CSV contains an unterminated quoted field.");
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
};

export const importCsv = async (
  service: VocabularyService,
  repository: VocabularyImportRepository,
  folderId: string,
  buffer: Buffer,
): Promise<CsvImportReport> => {
  await service.getFolder(folderId);
  if (buffer.length === 0)
    return {
      totalRows: 0,
      importedCount: 0,
      skippedCount: 0,
      imported: [],
      skipped: [],
    };
  const rows = parseCsv(buffer.toString("utf8"));
  const headers = [...(rows.shift() ?? [])];
  if (headers[0]) headers[0] = headers[0].replace(/^\uFEFF/, "");
  if (
    !headers.includes("word") ||
    !headers.includes("meaning") ||
    headers.some(
      (h, i) =>
        !h ||
        headers.indexOf(h) !== i ||
        !["word", "meaning", "ipa"].includes(h),
    )
  )
    throw new CsvHeaderError(
      "CSV headers must be word, meaning, and optional ipa.",
    );
  const existing = await repository.listByFolderId(folderId);
  const seen = new Set(existing.map((v) => v.word.trim().toLowerCase()));
  const valid: ImportVocabularyRecord[] = [];
  const imported: CsvImportReport["imported"] = [];
  const skipped: CsvImportReport["skipped"] = [];
  for (let i = 0; i < rows.length; i += 1) {
    const raw = rows[i] as string[];
    const input = {
      word: raw[headers.indexOf("word")] ?? "",
      meaning: raw[headers.indexOf("meaning")] ?? "",
      ipa: raw[headers.indexOf("ipa")],
    };
    try {
      const parsed = createVocabularyRequestSchema.parse(input);
      const normalized = parsed.word.toLowerCase();
      if (seen.has(normalized)) {
        skipped.push({
          row: i + 2,
          code: "VOCABULARY_DUPLICATE",
          message: "The word already exists in this folder.",
        });
        continue;
      }
      seen.add(normalized);
      valid.push({ folderId, ...parsed, normalizedWord: normalized });
    } catch (error) {
      const message =
        error instanceof z.ZodError
          ? (error.issues[0]?.message ?? "Invalid row.")
          : "Invalid row.";
      skipped.push({ row: i + 2, code: "VALIDATION_ERROR", message });
    }
  }
  const persisted = await repository.importRows(valid);
  persisted.forEach((v) =>
    imported.push({
      row:
        valid.findIndex((r) => r.normalizedWord === v.word.toLowerCase()) + 2,
      vocabularyId: v.id,
    }),
  );
  return {
    totalRows: rows.length,
    importedCount: imported.length,
    skippedCount: skipped.length,
    imported,
    skipped,
  };
};
