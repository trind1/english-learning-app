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
import { PracticeHub } from "./PracticeHub";
import { Login } from "./Login";
import { Register } from "./Register";

export type View =
  | "dashboard"
  | "library"
  | "folder"
  | "practice"
  | "flashcards"
  | "quiz"
  | "ai_generator"
  | "login"
  | "register";

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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [cachedDashboard, setCachedDashboard] = useState<DashboardData | null>(null);

  const loadDashboard = useCallback(
    async (): Promise<DashboardData> => {
      try {
        const data = (await client.request("dashboard", dashboardSchema)).data;
        setCachedDashboard(data);
        return data;
      } catch (err) {
        if (cachedDashboard) return cachedDashboard;
        throw err;
      }
    },
    [client, cachedDashboard],
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
    setShowProfileMenu(false);
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

  // Standalone Auth Views
  if (view === "login") {
    return (
      <Login
        onLogin={() => navigate("dashboard")}
        onNavigateRegister={() => navigate("register")}
      />
    );
  }
  if (view === "register") {
    return (
      <Register
        onRegister={() => navigate("dashboard")}
        onNavigateLogin={() => navigate("login")}
      />
    );
  }

  // Full Screen Focus Mode for Flashcards and Quiz
  if (view === "flashcards" && folder) {
    return (
      <div className="focus-shell">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <main id="main" style={{ flex: 1, padding: "24px 16px" }}>
          <button
            className="btn-ghost"
            style={{ marginBottom: "16px", color: "var(--primary)", fontWeight: 600 }}
            onClick={() => navigate("folder")}
          >
            ← Back to {folder.name}
          </button>
          <PageHeader eyebrow="Study" title="Flashcards" text={folder.name} />
          <Flashcards items={words} onClose={() => navigate("folder")} />
        </main>
      </div>
    );
  }

  if (view === "quiz" && folder && test) {
    return (
      <div className="focus-shell">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <main id="main" style={{ flex: 1, padding: "24px 16px" }}>
          <button
            className="btn-ghost"
            style={{ marginBottom: "16px", color: "var(--primary)", fontWeight: 600 }}
            onClick={() => navigate("folder")}
          >
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
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/* Side Navigation Bar (Desktop) */}
      <aside className="side-navbar">
        <button
          className="side-brand"
          type="button"
          onClick={() => navigate("dashboard")}
          aria-label="English Learning home"
        >
          <span className="material-symbols-outlined brand-icon" aria-hidden="true">
            language
          </span>
          <div style={{ textAlign: "left" }}>
            <span className="brand-title" style={{ display: "block" }}>
              LinguistPro
            </span>
            <span className="brand-subtitle">English Mastery</span>
          </div>
        </button>

        <button
          className="side-cta-btn"
          type="button"
          onClick={() => (folder ? navigate("flashcards") : navigate("library"))}
        >
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "20px" }}>
            play_arrow
          </span>
          Start Lesson
        </button>

        <nav aria-label="Primary navigation" className="side-nav-links">
          <li className={`side-nav-item ${view === "dashboard" ? "active" : ""}`}>
            <button type="button" onClick={() => navigate("dashboard")}>
              <span className="material-symbols-outlined" aria-hidden="true">dashboard</span>
              Dashboard
            </button>
          </li>
          <li
            className={`side-nav-item ${
              view === "library" || view === "folder" ? "active" : ""
            }`}
          >
            <button type="button" onClick={() => navigate("library")}>
              <span className="material-symbols-outlined" aria-hidden="true">menu_book</span>
              Library
            </button>
          </li>
          <li className={`side-nav-item ${view === "practice" || view === "flashcards" ? "active" : ""}`}>
            <button
              type="button"
              onClick={() => (folder ? navigate("flashcards") : navigate("library"))}
            >
              <span className="material-symbols-outlined" aria-hidden="true">fitness_center</span>
              Study
            </button>
          </li>
          <li className={`side-nav-item ${view === "ai_generator" ? "active" : ""}`}>
            <button type="button" onClick={() => navigate("ai_generator")}>
              <span className="material-symbols-outlined" aria-hidden="true">auto_stories</span>
              AI Stories
            </button>
          </li>
        </nav>

        <div className="side-nav-footer">
          <button
            type="button"
            className="btn-ghost"
            style={{ width: "100%", justifyContent: "flex-start", gap: "12px", fontSize: "14px" }}
            onClick={() => navigate("login")}
          >
            <span className="material-symbols-outlined" aria-hidden="true">login</span>
            Login Screen
          </button>
          <button
            type="button"
            className="btn-ghost"
            style={{ width: "100%", justifyContent: "flex-start", gap: "12px", fontSize: "14px" }}
            onClick={() => navigate("register")}
          >
            <span className="material-symbols-outlined" aria-hidden="true">person_add</span>
            Register Screen
          </button>
        </div>
      </aside>

      {/* Top App Bar */}
      <header className="top-app-bar">
        <div className="top-bar-search">
          <span className="material-symbols-outlined" aria-hidden="true">search</span>
          <input type="search" placeholder="Search dictionary..." aria-label="Search dictionary" />
        </div>

        <div className="top-bar-actions">
          <button
            className="btn-ghost"
            type="button"
            aria-label="Notifications"
            style={{ width: "36px", height: "36px", borderRadius: "50%", padding: 0 }}
          >
            <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
          </button>

          <button
            className="btn-primary"
            type="button"
            onClick={() => navigate("library")}
            style={{ padding: "8px 14px", fontSize: "13px" }}
          >
            + Add vocabulary
          </button>

          <div style={{ position: "relative" }}>
            <button
              className="user-profile-pill"
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              aria-label="User profile"
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
                style={{ fontSize: "28px", color: "var(--primary)" }}
              >
                account_circle
              </span>
              <span className="user-name">Profile</span>
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px", color: "var(--outline)" }}>
                expand_more
              </span>
            </button>

            {showProfileMenu && (
              <div
                className="card"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "44px",
                  width: "180px",
                  padding: "8px",
                  boxShadow: "var(--shadow-level-2)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  zIndex: 100,
                  backgroundColor: "var(--surface-white)",
                }}
              >
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ width: "100%", justifyContent: "flex-start", fontSize: "13px", padding: "8px 12px" }}
                  onClick={() => navigate("login")}
                >
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>
                    login
                  </span>
                  Log In
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ width: "100%", justifyContent: "flex-start", fontSize: "13px", padding: "8px 12px" }}
                  onClick={() => navigate("register")}
                >
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>
                    person_add
                  </span>
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main" className="main-wrapper" tabIndex={-1}>
        {view === "dashboard" && (
          <>
            <PageHeader
              eyebrow="Overview"
              title="Welcome back"
              text="Keep your vocabulary growing, one focused session at a time."
              action={
                <button className="btn-primary" type="button" onClick={() => navigate("library")}>
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
            <button
              className="btn-ghost"
              style={{ marginBottom: "16px", color: "var(--primary)", fontWeight: 600 }}
              onClick={() => navigate("library")}
            >
              ← Back to library
            </button>
            <PageHeader
              eyebrow="Topic"
              title={folder.name}
              text={`${words.length} ${words.length === 1 ? "word" : "words"} in this topic`}
              action={
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button className="btn-primary" type="button" onClick={() => navigate("flashcards")}>
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>
                      style
                    </span>
                    Flashcards
                  </button>
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={() => void startQuiz()}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "18px" }}>
                      quiz
                    </span>
                    Quiz
                  </button>
                </div>
              }
            />
            {studyError && <p role="alert">{studyError}</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <VocabularyPanel api={vocabularyApi} onChanged={setWords} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
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
              </div>
            </div>
          </>
        )}

        {view === "practice" && (
          <PracticeHub
            wordCount={words.length}
            onStartFlashcards={() => (folder ? navigate("flashcards") : navigate("library"))}
            onStartQuiz={() => (folder ? void startQuiz() : navigate("library"))}
            onStartAi={() => navigate("ai_generator")}
          />
        )}

        {view === "ai_generator" && (
          <>
            <PageHeader
              eyebrow="AI Practice"
              title="AI Story Generator"
              text="Generate custom stories and reinforce vocabulary contextually."
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
              onFinish={() => navigate("practice")}
            />
          </>
        )}
      </main>
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
  <section
    style={{
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "16px",
      marginBottom: "28px",
    }}
  >
    <div>
      <span
        style={{
          display: "block",
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--primary)",
          marginBottom: "4px",
        }}
      >
        {eyebrow}
      </span>
      <h1 className="text-headline-lg" style={{ color: "var(--on-surface)", margin: "0 0 6px 0" }}>
        {title}
      </h1>
      <p className="text-body-md" style={{ color: "var(--on-surface-variant)", margin: 0 }}>
        {text}
      </p>
    </div>
    {action}
  </section>
);
