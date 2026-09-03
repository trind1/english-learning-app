import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { AuthService, AuthStorage, type AuthUser } from "./auth";

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
    completedSessionDates: z.array(z.string().datetime()),
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

const aiSchema = z.object({
  data: z.object({
    story: z.string(),
    usedWords: z.array(z.string()),
    missingWords: z.array(z.string()),
    vocabularyIds: z.array(z.string()),
    source: z.enum(["local", "openai", "gemini"]),
  }),
});

export const App = () => {
  const auth = useMemo(() => new AuthService(), []);
  const client = useMemo(
    () => createApiClient(`${window.location.origin}/api/v1`),
    [],
  );
  const [user, setUser] = useState<AuthUser | null>(() =>
    AuthStorage.session(),
  );
  const pathToView = (path: string): View => {
    if (path === "/login") return "login";
    if (path === "/register") return "register";
    if (path === "/library") return "library";
    if (path.includes("/practice")) return "practice";
    if (path.includes("/flashcards")) return "flashcards";
    if (path.includes("/quiz")) return "quiz";
    if (path.includes("/ai")) return "ai_generator";
    return "dashboard";
  };
  const [view, setView] = useState<View>(() =>
    AuthStorage.session()
      ? ["login", "register"].includes(pathToView(window.location.pathname))
        ? "dashboard"
        : pathToView(window.location.pathname)
      : "login",
  );
  const [folder, setFolder] = useState<FolderSummary | null>(null);
  const [words, setWords] = useState<VocabularyItem[]>([]);
  const [test, setTest] = useState<TestPayload | null>(null);
  const [studyError, setStudyError] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showMobileNavigation, setShowMobileNavigation] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

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
    if (next !== "login" && next !== "register" && !user) {
      setView("login");
      return;
    }
    setStudyError("");
    setShowProfileMenu(false);
    setShowMobileNavigation(false);
    setView(next);
    const paths: Record<View, string> = {
      dashboard: "/dashboard",
      login: "/login",
      register: "/register",
      library: "/library",
      folder: "/library",
      practice: "/practice",
      flashcards: "/flashcards",
      quiz: "/quiz",
      ai_generator: "/ai",
    };
    window.history.pushState({}, "", paths[next]);
  };

  useEffect(() => {
    const syncRoute = () => {
      const path = window.location.pathname;
      const requested = pathToView(path);
      if (!user && path !== "/register" && path !== "/login") {
        window.history.replaceState({}, "", "/login");
        setView("login");
        return;
      }
      if (
        user &&
        (path === "/" || requested === "login" || requested === "register")
      ) {
        window.history.replaceState({}, "", "/dashboard");
        setView("dashboard");
        return;
      }
      setView(
        user ? requested : requested === "register" ? "register" : "login",
      );
    };
    syncRoute();
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, [user]);

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
        onLogin={(email, password) => {
          setUser(auth.login(email, password));
          window.history.replaceState({}, "", "/dashboard");
          setView("dashboard");
        }}
        onNavigateRegister={() => navigate("register")}
      />
    );
  }
  if (view === "register") {
    return (
      <Register
        onRegister={(input) => {
          setUser(auth.register(input));
          window.history.replaceState({}, "", "/dashboard");
          setView("dashboard");
        }}
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
        <main id="main" className="focus-main">
          <FocusBackButton onClick={() => navigate("folder")} />
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
        <main id="main" className="focus-main">
          <FocusBackButton onClick={() => navigate("folder")} />
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

      {/* Left Navigation — Strict Structure */}
      <aside className="side-navbar">
        {/* Brand Area */}
        <div className="side-brand">
          <span
            className="material-symbols-outlined brand-icon"
            aria-hidden="true"
          >
            language
          </span>
          <div style={{ textAlign: "left" }}>
            <h1 className="brand-title">LinguistPro</h1>
            <p className="brand-subtitle">English Mastery</p>
          </div>
        </div>

        {/* Primary Navigation (1. Dashboard, 2. Vocabulary, 3. Practice, 4. Progress) */}
        <nav aria-label="Primary navigation" className="side-nav-links">
          <li
            className={`side-nav-item ${view === "dashboard" ? "active" : ""}`}
          >
            <button
              type="button"
              aria-current={view === "dashboard" ? "page" : undefined}
              onClick={() => navigate("dashboard")}
            >
              <span
                className="material-symbols-outlined side-nav-icon side-nav-icon--dashboard"
                aria-hidden="true"
              >
                dashboard
              </span>
              <span className="side-nav-label">Dashboard</span>
            </button>
          </li>
          <li
            className={`side-nav-item ${
              view === "library" || view === "folder" ? "active" : ""
            }`}
          >
            <button
              type="button"
              aria-current={
                view === "library" || view === "folder" ? "page" : undefined
              }
              onClick={() => navigate("library")}
            >
              <span
                className="material-symbols-outlined side-nav-icon side-nav-icon--book"
                aria-hidden="true"
              >
                menu_book
              </span>
              <span className="side-nav-label">Vocabulary</span>
            </button>
          </li>
          <li
            className={`side-nav-item ${
              view === "practice" || view === "ai_generator" ? "active" : ""
            }`}
          >
            <button
              type="button"
              aria-current={
                view === "practice" || view === "ai_generator"
                  ? "page"
                  : undefined
              }
              onClick={() => navigate("practice")}
            >
              <span
                className="material-symbols-outlined side-nav-icon side-nav-icon--fitness"
                aria-hidden="true"
              >
                fitness_center
              </span>
              <span className="side-nav-label">Practice</span>
            </button>
          </li>
          <li className="side-nav-item">
            <button type="button" onClick={() => {}}>
              <span
                className="material-symbols-outlined side-nav-icon side-nav-icon--leaderboard"
                aria-hidden="true"
              >
                leaderboard
              </span>
              <span className="side-nav-label">Progress</span>
            </button>
          </li>
        </nav>

        {/* Dedicated Start Lesson CTA */}
        <button
          className="side-cta-btn"
          type="button"
          onClick={() =>
            folder ? navigate("flashcards") : navigate("practice")
          }
        >
          <span
            className="material-symbols-outlined"
            aria-hidden="true"
            style={{ fontSize: "20px" }}
          >
            play_arrow
          </span>
          Start Lesson
        </button>

        {/* Secondary Navigation (1. Settings, 2. Help) */}
        <div className="side-nav-footer">
          <li className="side-nav-item">
            <button type="button" onClick={() => {}}>
              <span className="material-symbols-outlined" aria-hidden="true">
                settings
              </span>
              Settings
            </button>
          </li>
          <li className="side-nav-item">
            <button type="button" onClick={() => {}}>
              <span className="material-symbols-outlined" aria-hidden="true">
                help
              </span>
              Help
            </button>
          </li>
        </div>
      </aside>

      {/* Top User Bar (Notification + Profile Only) */}
      <header className="top-app-bar">
        <button
          className="mobile-navigation-toggle btn-ghost"
          type="button"
          aria-label="Open navigation"
          aria-controls="mobile-navigation"
          aria-expanded={showMobileNavigation}
          onClick={() => setShowMobileNavigation((open) => !open)}
        >
          <span aria-hidden="true">☰</span>
          <span className="mobile-navigation-label">Menu</span>
        </button>
        <div className="top-bar-actions">
          <button
            className="btn-ghost"
            type="button"
            aria-label="Notifications"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              padding: 0,
            }}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              notifications
            </span>
          </button>

          <div className="profile-menu-container" ref={profileMenuRef}>
            <button
              className="user-profile-pill"
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  setShowProfileMenu(false);
                }
              }}
              aria-expanded={showProfileMenu}
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
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
                style={{ fontSize: "18px", color: "var(--outline)" }}
              >
                expand_more
              </span>
            </button>

            {showProfileMenu && (
              <div
                className="profile-dropdown-menu"
                role="menu"
                aria-label="Profile options"
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setShowProfileMenu(false);
                    (
                      event.currentTarget.parentElement?.querySelector(
                        ".user-profile-pill",
                      ) as HTMLButtonElement | null
                    )?.focus();
                  }
                }}
              >
                <button
                  type="button"
                  role="menuitem"
                  className="dropdown-item"
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowInfoModal(true);
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    info
                  </span>
                  Information
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="dropdown-item"
                  onClick={() => {
                    setShowProfileMenu(false);
                    auth.logout();
                    setUser(null);
                    navigate("login");
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    logout
                  </span>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showMobileNavigation && (
        <div
          className="mobile-navigation-backdrop"
          data-testid="mobile-navigation-backdrop"
          onClick={() => setShowMobileNavigation(false)}
        >
          <nav
            id="mobile-navigation"
            className="mobile-navigation-drawer"
            aria-label="Mobile navigation"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="side-brand">
              <span className="brand-icon" aria-hidden="true">
                ◉
              </span>
              <div>
                <p className="brand-title">LinguistPro</p>
                <p className="brand-subtitle">English Mastery</p>
              </div>
            </div>
            <ul className="side-nav-links">
              <li
                className={`side-nav-item ${view === "dashboard" ? "active" : ""}`}
              >
                <button
                  type="button"
                  aria-current={view === "dashboard" ? "page" : undefined}
                  onClick={() => navigate("dashboard")}
                >
                  <span
                    className="material-symbols-outlined side-nav-icon side-nav-icon--dashboard"
                    aria-hidden="true"
                  >
                    dashboard
                  </span>
                  <span className="side-nav-label">Dashboard</span>
                </button>
              </li>
              <li
                className={`side-nav-item ${view === "library" || view === "folder" ? "active" : ""}`}
              >
                <button
                  type="button"
                  aria-current={
                    view === "library" || view === "folder" ? "page" : undefined
                  }
                  onClick={() => navigate("library")}
                >
                  <span
                    className="material-symbols-outlined side-nav-icon side-nav-icon--book"
                    aria-hidden="true"
                  >
                    menu_book
                  </span>
                  <span className="side-nav-label">Vocabulary</span>
                </button>
              </li>
              <li
                className={`side-nav-item ${view === "practice" || view === "ai_generator" ? "active" : ""}`}
              >
                <button
                  type="button"
                  aria-current={
                    view === "practice" || view === "ai_generator"
                      ? "page"
                      : undefined
                  }
                  onClick={() => navigate("practice")}
                >
                  <span
                    className="material-symbols-outlined side-nav-icon side-nav-icon--fitness"
                    aria-hidden="true"
                  >
                    fitness_center
                  </span>
                  <span className="side-nav-label">Practice</span>
                </button>
              </li>
              <li className="side-nav-item">
                <button type="button">
                  <span
                    className="material-symbols-outlined side-nav-icon side-nav-icon--leaderboard"
                    aria-hidden="true"
                  >
                    leaderboard
                  </span>
                  <span className="side-nav-label">Progress</span>
                </button>
              </li>
            </ul>
            <button
              className="side-cta-btn"
              type="button"
              onClick={() =>
                folder ? navigate("flashcards") : navigate("practice")
              }
            >
              Start Lesson
            </button>
            <ul className="side-nav-footer">
              <li className="side-nav-item">
                <button type="button">Settings</button>
              </li>
              <li className="side-nav-item">
                <button type="button">Help</button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Information Modal */}
      {showInfoModal && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="info-modal-title"
          onClick={() => setShowInfoModal(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setShowInfoModal(false);
          }}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
                style={{ color: "var(--primary)" }}
              >
                info
              </span>
              <h2
                id="info-modal-title"
                className="text-headline-md"
                style={{ margin: 0 }}
              >
                User Information
              </h2>
            </div>
            <p
              className="text-body-md"
              style={{
                color: "var(--on-surface-variant)",
                marginBottom: "16px",
              }}
            >
              You are logged in as a <strong>LinguistPro Learner</strong>.
            </p>
            <button
              className="btn-primary"
              type="button"
              style={{ width: "100%" }}
              onClick={() => setShowInfoModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main id="main" className="main-wrapper" tabIndex={-1}>
        {view === "dashboard" && (
          <Dashboard
            load={loadDashboard}
            loadFolders={folderApi.list}
            onAction={navigate}
            onOpenFolder={(selected) => {
              setFolder(selected);
              navigate("folder");
            }}
          />
        )}

        {view === "library" && (
          <>
            <PageHeader
              className="folder-page-header"
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
          <div className="folder-detail-page">
            <button
              className="btn-ghost folder-back-button"
              type="button"
              onClick={() => navigate("library")}
            >
              <span aria-hidden="true" className="folder-back-arrow">
                ←
              </span>{" "}
              Back to Folders
            </button>

            <header className="folder-detail-hero">
              <span className="folder-detail-hero-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M3.75 6.5A1.75 1.75 0 0 1 5.5 4.75h4l2 2h7A1.75 1.75 0 0 1 20.25 8.5v9a1.75 1.75 0 0 1-1.75 1.75h-13a1.75 1.75 0 0 1-1.75-1.75v-11Z" />
                </svg>
              </span>
              <div className="folder-detail-hero-copy">
                <p className="folder-detail-eyebrow">Vocabulary folder</p>
                <h1>{folder.name}</h1>
                <p className="folder-detail-count">
                  {words.length}{" "}
                  {words.length === 1 ? "vocabulary word" : "vocabulary words"}
                </p>
              </div>
            </header>

            <section
              className="folder-study-section"
              aria-labelledby="folder-study-title"
            >
              <div className="folder-section-heading">
                <div>
                  <p className="folder-section-eyebrow">Learning modes</p>
                  <h2 id="folder-study-title">Study this folder</h2>
                </div>
                <p>Choose a focused way to practise these words.</p>
              </div>
              <div className="folder-study-actions">
                <button
                  className="study-mode-card study-mode-card--primary"
                  type="button"
                  aria-label="Flashcards"
                  onClick={() => navigate("flashcards")}
                >
                  <span className="study-mode-icon" aria-hidden="true">
                    ▱
                  </span>
                  <span className="study-mode-copy">
                    <strong>Flashcards</strong>
                    <span>Review vocabulary one by one</span>
                  </span>
                  <span className="study-mode-arrow" aria-hidden="true">
                    →
                  </span>
                </button>
                <button
                  className="study-mode-card study-mode-card--primary"
                  type="button"
                  aria-label="Multiple Choice"
                  onClick={() => void startQuiz()}
                >
                  <span className="study-mode-icon" aria-hidden="true">
                    ✓
                  </span>
                  <span className="study-mode-copy">
                    <strong>Multiple Choice</strong>
                    <span>Test what you remember</span>
                  </span>
                  <span className="study-mode-arrow" aria-hidden="true">
                    →
                  </span>
                </button>
                <button
                  className="study-mode-card study-mode-card--secondary"
                  type="button"
                  aria-label="AI Generator"
                  onClick={() => navigate("ai_generator")}
                >
                  <span className="study-mode-icon" aria-hidden="true">
                    ✦
                  </span>
                  <span className="study-mode-copy">
                    <strong>AI Generator</strong>
                    <span>Practise vocabulary in context</span>
                  </span>
                  <span className="study-mode-arrow" aria-hidden="true">
                    →
                  </span>
                </button>
              </div>
              {studyError && (
                <p role="alert" className="folder-study-error">
                  {studyError}
                </p>
              )}
            </section>

            <section
              className="folder-vocabulary-section"
              aria-labelledby="folder-vocabulary-title"
            >
              <div className="folder-vocabulary-toolbar">
                <div>
                  <p className="folder-section-eyebrow">Your collection</p>
                  <h2 id="folder-vocabulary-title">Vocabulary</h2>
                  <p>
                    {words.length} {words.length === 1 ? "word" : "words"}
                  </p>
                </div>
                <div
                  className="folder-vocabulary-actions"
                  role="group"
                  aria-label="Vocabulary actions"
                >
                  <button
                    className="btn-primary folder-action-button"
                    type="button"
                    onClick={() => document.getElementById("word")?.focus()}
                  >
                    <span aria-hidden="true">+</span> Add Vocabulary
                  </button>
                  <button
                    className="btn-secondary folder-action-button"
                    type="button"
                    onClick={() => document.getElementById("csv")?.focus()}
                  >
                    <span aria-hidden="true">⇧</span> Import CSV
                  </button>
                </div>
              </div>

              <VocabularyPanel
                api={vocabularyApi}
                onChanged={setWords}
                showSummary={false}
              />
              <div className="folder-import-row">
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
              </div>
            </section>
          </div>
        )}

        {view === "practice" && (
          <PracticeHub
            wordCount={words.length}
            onStartFlashcards={() =>
              folder ? navigate("flashcards") : navigate("library")
            }
            onStartQuiz={() =>
              folder ? void startQuiz() : navigate("library")
            }
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
              generate={async (ids) => {
                const response = await client.request("ai/text", aiSchema, {
                  method: "POST",
                  body: JSON.stringify({
                    folderId: folder?.id,
                    vocabularyIds: ids,
                  }),
                });
                return response.data;
              }}
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
  className,
}: {
  eyebrow: string;
  title: string;
  text: string;
  action?: React.ReactNode;
  className?: string;
}) => (
  <section
    className={className}
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
      <h1
        className="text-headline-lg"
        style={{ color: "var(--on-surface)", margin: "0 0 6px 0" }}
      >
        {title}
      </h1>
      <p
        className="text-body-md"
        style={{ color: "var(--on-surface-variant)", margin: 0 }}
      >
        {text}
      </p>
    </div>
    {action}
  </section>
);

const FocusBackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    className="btn-ghost folder-back-button focus-mode-back-button"
    type="button"
    aria-label="Back to Folder"
    onClick={onClick}
  >
    <span className="folder-back-arrow" aria-hidden="true">
      ←
    </span>{" "}
    Back to Folder
  </button>
);
