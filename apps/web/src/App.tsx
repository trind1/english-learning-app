import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  folderListResponseSchema,
  folderResponseSchema,
  vocabularyListResponseSchema,
  vocabularyResponseSchema,
  type FolderSummary,
} from "@english-learning/contracts";
import { createApiClient } from "./api/client";
import { Dashboard, type DashboardData } from "./Dashboard";
import { FolderPanel } from "./FolderPanel";
import { VocabularyPanel } from "./VocabularyPanel";
import type { VocabularyItem } from "./VocabularyPanel";
import { CsvImportPanel } from "./CsvImportPanel";
import { Flashcards } from "./Flashcards";
import { TestSession, type Question } from "./TestSession";
import { AiPanel } from "./AiPanel";

type View = "dashboard" | "library" | "folder" | "flashcards" | "quiz";
type TestPayload = { testToken: string; questions: Question[] };
const dashboardSchema = z.object({
  data: z.object({
    folderCount: z.number(),
    vocabularyCount: z.number(),
    completedSessionCount: z.number(),
    correctAnswerCount: z.number(),
    incorrectAnswerCount: z.number(),
    accuracyPercent: z.number(),
  }),
});
const importSchema = z.object({
  data: z.object({
    importedCount: z.number(),
    skippedCount: z.number(),
    skipped: z.array(z.object({ row: z.number(), message: z.string() })),
  }),
});
const testSchema = z.object({
  data: z.object({
    testToken: z.string(),
    questions: z.array(
      z.object({
        vocabularyId: z.string(),
        word: z.string(),
        choices: z.array(z.string()),
      }),
    ),
  }),
});
const resultSchema = z.object({
  data: z.object({
    correctCount: z.number(),
    incorrectCount: z.number(),
    totalCount: z.number(),
  }),
});
const aiSchema = z.object({ data: z.object({ text: z.string() }) });

export const App = () => {
  const client = useMemo(
    () => createApiClient(`${window.location.origin}/api/v1`),
    [],
  );
  const [view, setView] = useState<View>("dashboard");
  const [folder, setFolder] = useState<FolderSummary | null>(null);
  const [words, setWords] = useState<VocabularyItem[]>([]);
  const [test, setTest] = useState<TestPayload | null>(null);
  const [studyError, setStudyError] = useState("");
  const loadDashboard = useCallback(
    async (): Promise<DashboardData> =>
      (await client.request("dashboard", dashboardSchema)).data,
    [client],
  );
  const loadWords = useCallback(async () => {
    if (!folder) return [];
    const data = (
      await client.request(
        `folders/${folder.id}/vocabulary`,
        vocabularyListResponseSchema,
      )
    ).data.vocabulary;
    setWords(data);
    return data;
  }, [client, folder]);
  useEffect(() => {
    if (folder) void loadWords();
  }, [folder, loadWords]);
  const navigate = (next: View) => {
    setStudyError("");
    setView(next);
  };
  const startQuiz = async () => {
    if (!folder) return;
    setStudyError("");
    try {
      const data = (
        await client.request(`folders/${folder.id}/tests`, testSchema, {
          method: "POST",
        })
      ).data;
      setTest(data);
      setView("quiz");
    } catch (error) {
      setStudyError(
        error instanceof Error ? error.message : "Unable to start the quiz.",
      );
    }
  };
  const folderApi = {
    list: async () =>
      (await client.request("folders", folderListResponseSchema)).data.folders,
    create: async (name: string) =>
      (
        await client.request("folders", folderResponseSchema, {
          method: "POST",
          body: JSON.stringify({ name }),
        })
      ).data,
  };
  const vocabularyApi = useMemo(
    () =>
      folder
        ? {
            list: loadWords,
            create: async (input: {
              word: string;
              meaning: string;
              ipa?: string | null;
            }) =>
              (
                await client.request(
                  `folders/${folder.id}/vocabulary`,
                  vocabularyResponseSchema,
                  { method: "POST", body: JSON.stringify(input) },
                )
              ).data,
          }
        : null,
    [client, folder, loadWords],
  );

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="app-header">
        <div className="header-inner">
          <button
            className="brand"
            type="button"
            onClick={() => navigate("dashboard")}
            aria-label="English Learning home"
          >
            <span className="brand-mark" aria-hidden="true">
              Aa
            </span>
            <span>
              <strong>English Learning</strong>
              <small>Learn with clarity</small>
            </span>
          </button>
          <nav aria-label="Primary navigation">
            <button
              className={view === "dashboard" ? "nav-link active" : "nav-link"}
              onClick={() => navigate("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={
                view === "library" || view === "folder"
                  ? "nav-link active"
                  : "nav-link"
              }
              onClick={() => navigate("library")}
            >
              Library
            </button>
            <button
              className={
                view === "flashcards" || view === "quiz"
                  ? "nav-link active"
                  : "nav-link"
              }
              onClick={() =>
                folder ? navigate("flashcards") : navigate("library")
              }
            >
              Study
            </button>
          </nav>
          <button className="header-cta" onClick={() => navigate("library")}>
            + Add vocabulary
          </button>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        {view === "dashboard" && (
          <>
            <PageHeader
              eyebrow="Overview"
              title="Welcome back"
              text="Keep your vocabulary growing, one focused session at a time."
              action={
                <button onClick={() => navigate("library")}>
                  Start learning
                </button>
              }
            />
            <Dashboard load={loadDashboard} onAction={navigate} />
          </>
        )}
        {view === "library" && (
          <>
            <PageHeader
              eyebrow="Library"
              title="Your vocabulary topics"
              text="Create a topic, add useful words, then study when you are ready."
            />
            <FolderPanel
              api={folderApi}
              onOpen={(selected) => {
                setFolder(selected);
                setView("folder");
              }}
            />
          </>
        )}
        {view === "folder" && folder && vocabularyApi && (
          <>
            <button className="back-link" onClick={() => navigate("library")}>
              ← Back to library
            </button>
            <PageHeader
              eyebrow="Topic"
              title={folder.name}
              text={`${words.length} ${words.length === 1 ? "word" : "words"} in this topic`}
              action={
                <div className="action-row">
                  <button onClick={() => navigate("flashcards")}>
                    Flashcards
                  </button>
                  <button
                    className="secondary"
                    onClick={() => void startQuiz()}
                  >
                    Quiz
                  </button>
                </div>
              }
            />
            {studyError && <p role="alert">{studyError}</p>}
            <div className="folder-layout">
              <VocabularyPanel api={vocabularyApi} onChanged={setWords} />
              <aside>
                <CsvImportPanel
                  api={{
                    import: async (file) => {
                      const form = new FormData();
                      form.append("csv", file);
                      const report = (
                        await client.request(
                          `folders/${folder.id}/vocabulary/import`,
                          importSchema,
                          { method: "POST", body: form },
                        )
                      ).data;
                      await loadWords();
                      return {
                        imported: report.importedCount,
                        skipped: report.skippedCount,
                        rows: report.skipped.map((row) => ({
                          rowNumber: row.row,
                          reason: row.message,
                        })),
                      };
                    },
                  }}
                />
                <AiPanel
                  words={words}
                  generate={async (ids) =>
                    (
                      await client.request("ai/text", aiSchema, {
                        method: "POST",
                        body: JSON.stringify({ vocabularyIds: ids }),
                      })
                    ).data.text
                  }
                />
              </aside>
            </div>
          </>
        )}
        {view === "flashcards" && folder && (
          <>
            <button className="back-link" onClick={() => navigate("folder")}>
              ← Back to {folder.name}
            </button>
            <PageHeader eyebrow="Study" title="Flashcards" text={folder.name} />
            <Flashcards items={words} />
          </>
        )}
        {view === "quiz" && folder && test && (
          <>
            <button className="back-link" onClick={() => navigate("folder")}>
              ← Back to {folder.name}
            </button>
            <PageHeader
              eyebrow="Quiz"
              title="Test your knowledge"
              text={folder.name}
            />
            <TestSession
              questions={test.questions}
              api={{
                submit: async (answers) =>
                  (
                    await client.request("test-sessions", resultSchema, {
                      method: "POST",
                      body: JSON.stringify({
                        testToken: test.testToken,
                        answers,
                      }),
                    })
                  ).data,
              }}
              onNavigate={(target) =>
                navigate(target === "dashboard" ? "dashboard" : "folder")
              }
            />
          </>
        )}
      </main>
      <footer className="app-footer">
        <strong>English Learning</strong>
        <span>Simple tools for steady progress.</span>
      </footer>
    </div>
  );
};
const PageHeader = ({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow: string;
  title: string;
  text: string;
  action?: React.ReactNode;
}) => (
  <section className="page-header">
    <div>
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
    {action}
  </section>
);
