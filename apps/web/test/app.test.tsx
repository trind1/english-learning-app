import "@testing-library/jest-dom/vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/App";
import { AuthStorage } from "../src/auth";

const json = (data: unknown, status = 200) =>
  Promise.resolve(
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
const dashboard = {
  data: {
    folderCount: 0,
    vocabularyCount: 0,
    completedSessionCount: 0,
    correctAnswerCount: 0,
    incorrectAnswerCount: 0,
    accuracyPercent: 0,
  },
};

describe("TEST-011 and TEST-021 integrated web shell", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/dashboard");
    AuthStorage.saveAccounts([
      {
        id: "test-user",
        name: "Test User",
        email: "test@example.com",
        password: "123456",
      },
    ]);
    AuthStorage.saveSession({
      id: "test-user",
      name: "Test User",
      email: "test@example.com",
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    AuthStorage.clearSession();
  });

  it("shows the real dashboard and navigates to vocabulary", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) =>
      String(input).endsWith("/dashboard")
        ? json(dashboard)
        : json({ data: { folders: [] } }),
    );
    render(<App />);
    expect(
      screen.getByRole("navigation", { name: "Primary navigation" }),
    ).toBeInTheDocument();
    await screen.findByText("0%");
    expect(
      screen.getByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Vocabulary" }));
    expect(await screen.findByText("No folders yet.")).toBeInTheDocument();
  });

  it("opens a dashboard topic through the application shell", async () => {
    const folder = {
      id: "dashboard-folder",
      name: "Travel",
      vocabularyCount: 0,
      createdAt: "2026-08-28T00:00:00.000Z",
      updatedAt: "2026-08-28T00:00:00.000Z",
    };
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);
      if (url.endsWith("/dashboard")) return json(dashboard);
      if (url.endsWith("/folders"))
        return json({ data: { folders: [folder] } });
      if (url.endsWith("/vocabulary"))
        return json({ data: { folder, vocabulary: [] } });
      return json({ data: {} });
    });
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: "Open folder" }));
    expect(
      await screen.findByRole("heading", { name: "Travel" }),
    ).toBeInTheDocument();
  });

  it("opens the approved mobile navigation structure", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) =>
      String(input).endsWith("/dashboard")
        ? json(dashboard)
        : json({ data: { folders: [] } }),
    );
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    const navigation = screen.getByRole("navigation", {
      name: "Mobile navigation",
    });
    expect(navigation).toHaveTextContent("Dashboard");
    expect(navigation).toHaveTextContent("Vocabulary");
    expect(navigation).toHaveTextContent("Practice");
    expect(navigation).toHaveTextContent("Progress");
    expect(navigation).toHaveTextContent("Start Lesson");
    expect(navigation).toHaveTextContent("Settings");
    expect(navigation).toHaveTextContent("Help");
    fireEvent.click(
      within(navigation).getByRole("button", { name: "Vocabulary" }),
    );
    expect(
      screen.queryByRole("navigation", { name: "Mobile navigation" }),
    ).not.toBeInTheDocument();
    await screen.findByText("No folders yet.");

    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    fireEvent.click(screen.getByTestId("mobile-navigation-backdrop"));
    expect(
      screen.queryByRole("navigation", { name: "Mobile navigation" }),
    ).not.toBeInTheDocument();
  });

  it("restores supported URL views and guards guests", async () => {
    for (const path of [
      "/library",
      "/practice",
      "/flashcards",
      "/quiz",
      "/ai",
      "/unknown",
    ]) {
      window.history.replaceState({}, "", path);
      const view = render(<App />);
      expect(view.container.querySelector("main")).toBeInTheDocument();
      view.unmount();
    }
    AuthStorage.clearSession();
    window.history.replaceState({}, "", "/");
    render(<App />);
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/login");
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(window.location.pathname).toBe("/login");
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("redirects an authenticated user away from guest routes", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) =>
      String(input).endsWith("/dashboard")
        ? json(dashboard)
        : json({ data: { folders: [] } }),
    );
    window.history.replaceState({}, "", "/login");
    render(<App />);
    await screen.findByText("0%");
    expect(
      screen.getByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();
  });

  it("normalizes the authenticated root URL to the dashboard", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) =>
      String(input).endsWith("/dashboard")
        ? json(dashboard)
        : json({ data: { folders: [] } }),
    );
    window.history.replaceState({}, "", "/");
    render(<App />);
    await screen.findByText("0%");
    expect(window.location.pathname).toBe("/dashboard");
  });

  it("normalizes the authenticated register URL to the dashboard", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) =>
      String(input).endsWith("/dashboard")
        ? json(dashboard)
        : json({ data: { folders: [] } }),
    );
    window.history.replaceState({}, "", "/register");
    render(<App />);
    await screen.findByText("0%");
    expect(window.location.pathname).toBe("/dashboard");
  });

  it("creates and opens a folder through the same-origin API", async () => {
    const folder = {
      id: "25e6a282-c27b-4af7-957c-bb8ecab04a4f",
      name: "Travel",
      vocabularyCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation((input, init) => {
        const url = String(input);
        if (url.endsWith("/dashboard")) return json(dashboard);
        if (url.endsWith("/folders") && init?.method === "POST")
          return json({ data: folder }, 201);
        if (url.endsWith("/folders")) return json({ data: { folders: [] } });
        if (url.includes("/vocabulary"))
          return json({ data: { folder, vocabulary: [] } });
        return json({ data: {} });
      });
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Vocabulary" }));
    await screen.findByText("No folders yet.");
    fireEvent.change(screen.getByLabelText("Folder name"), {
      target: { value: "Travel" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create folder" }));
    await screen.findByText("Travel");
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(
      await screen.findByRole("heading", { name: "Travel" }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/folders$/),
      expect.any(Object),
    );
  });

  it("makes every main navigation entry reachable", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) =>
      String(input).endsWith("/dashboard")
        ? json(dashboard)
        : json({ data: { folders: [] } }),
    );
    render(<App />);
    await screen.findByText("0%");
    fireEvent.click(screen.getByRole("button", { name: "Start learning" }));
    expect(
      await screen.findByRole("heading", { name: "Your vocabulary topics" }),
    ).toBeInTheDocument();
    await screen.findByText("No folders yet.");

    // Practice
    fireEvent.click(screen.getByRole("button", { name: "Practice" }));
    expect(
      screen.getByRole("heading", { name: "Practice Hub" }),
    ).toBeInTheDocument();

    // Progress (UI placeholder)
    fireEvent.click(screen.getByRole("button", { name: "Progress" }));

    // Settings & Help
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    fireEvent.click(screen.getByRole("button", { name: "Help" }));

    // Dashboard
    fireEvent.click(screen.getByRole("button", { name: "Dashboard" }));
    await screen.findByText("0%");

    // Vocabulary
    fireEvent.click(screen.getByRole("button", { name: "Vocabulary" }));
    await screen.findByText("No folders yet.");
  });

  it("completes the folder, vocabulary, import, AI, flashcard, and quiz journey", async () => {
    const timestamp = "2026-08-28T00:00:00.000Z";
    const folder = {
      id: "folder-1",
      name: "Travel",
      vocabularyCount: 4,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    let words = [
      ["word-1", "hello", "greeting", "/həˈləʊ/"],
      ["word-2", "world", "earth", "/wɜːld/"],
      ["word-3", "journey", "trip", null],
      ["word-4", "road", "way", "/rəʊd/"],
    ].map(([id, word, meaning, ipa]) => ({
      id,
      folderId: folder.id,
      word,
      meaning,
      ipa,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));
    const requests: string[] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);
      requests.push(`${init?.method ?? "GET"} ${url}`);
      if (url.endsWith("/dashboard")) return json(dashboard);
      if (url.endsWith("/folders"))
        return json({ data: { folders: [folder] } });
      if (url.endsWith("/vocabulary/import"))
        return json({
          data: {
            importedCount: 1,
            skippedCount: 1,
            skipped: [{ row: 3, message: "Duplicate word." }],
          },
        });
      if (url.endsWith("/vocabulary") && init?.method === "POST") {
        const created = {
          id: "word-5",
          folderId: folder.id,
          word: "ticket",
          meaning: "pass",
          ipa: null,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        words = [...words, created];
        return json({ data: created }, 201);
      }
      if (url.endsWith("/vocabulary"))
        return json({ data: { folder, vocabulary: words } });
      if (url.endsWith("/tests"))
        return json({
          data: {
            testToken: "token",
            questions: [
              {
                vocabularyId: "word-1",
                word: "hello",
                choices: ["greeting", "earth", "trip", "way"],
              },
            ],
          },
        });
      if (url.endsWith("/test-sessions"))
        return json({
          data: { correctCount: 1, incorrectCount: 0, totalCount: 1 },
        });
      if (url.endsWith("/ai/text"))
        return json({ data: { text: "Hello, world!" } });
      return json({ data: {} });
    });

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Vocabulary" }));
    await screen.findByText("Travel");
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByText("hello");
    expect(screen.getByLabelText("Vocabulary list")).toHaveTextContent(
      "greeting",
    );

    fireEvent.change(screen.getByLabelText("Word"), {
      target: { value: "ticket" },
    });
    fireEvent.change(screen.getByLabelText("Meaning"), {
      target: { value: "pass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add vocabulary" }));
    expect(await screen.findAllByText("ticket")).toHaveLength(2);

    fireEvent.change(screen.getByLabelText("CSV file"), {
      target: {
        files: [new File(["word,meaning\nplane,aircraft"], "travel.csv")],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    await screen.findByText("Imported: 1");
    expect(screen.getByText("Row 3: Duplicate word.")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("hello"));
    fireEvent.click(screen.getByRole("button", { name: "Generate text" }));
    expect(await screen.findByLabelText("Generated text")).toHaveTextContent(
      "Hello, world!",
    );

    fireEvent.click(screen.getByRole("button", { name: "Flashcards" }));
    expect(
      screen.getByRole("heading", { name: "Flashcards", level: 1 }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Back to Travel/ }));
    fireEvent.click(screen.getByRole("button", { name: "Quiz" }));
    await screen.findByRole("heading", { name: "Test your knowledge" });
    fireEvent.click(screen.getByRole("button", { name: /Back to Travel/ }));
    fireEvent.click(screen.getByRole("button", { name: "Quiz" }));
    await screen.findByRole("heading", { name: "Test your knowledge" });
    fireEvent.click(screen.getByRole("button", { name: "greeting" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    await screen.findByRole("heading", { name: "Results" });
    const vocabularyLoads = () =>
      requests.filter(
        (request) =>
          request.startsWith("GET") && request.endsWith("/vocabulary"),
      ).length;
    const loadsBeforeReturn = vocabularyLoads();
    fireEvent.click(screen.getByRole("button", { name: "Back to folder" }));
    expect(screen.getByRole("heading", { name: "Travel" })).toBeInTheDocument();
    await waitFor(() =>
      expect(vocabularyLoads()).toBeGreaterThan(loadsBeforeReturn),
    );

    // Click Start Lesson with folder active
    fireEvent.click(screen.getByRole("button", { name: "Start Lesson" }));
    expect(
      screen.getByRole("heading", { name: "Flashcards", level: 1 }),
    ).toBeInTheDocument();
    expect(
      requests.some(
        (request) =>
          request.includes("POST") && request.endsWith("/test-sessions"),
      ),
    );
  });

  it("shows quiz startup failures without leaving the folder", async () => {
    const timestamp = "2026-08-28T00:00:00.000Z";
    const folder = {
      id: "folder-2",
      name: "Business",
      vocabularyCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    let quizAttempts = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);
      if (url.endsWith("/dashboard")) return json(dashboard);
      if (url.endsWith("/folders"))
        return json({ data: { folders: [folder] } });
      if (url.endsWith("/vocabulary"))
        return json({ data: { folder, vocabulary: [] } });
      if (url.endsWith("/tests")) {
        quizAttempts += 1;
        return Promise.reject(
          quizAttempts === 1 ? "offline" : new Error("Network unavailable"),
        );
      }
      return json({ data: {} });
    });
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Vocabulary" }));
    await screen.findByText("Business");
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByText("No vocabulary yet.");
    fireEvent.click(screen.getByRole("button", { name: "Quiz" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Unable to start the quiz",
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Quiz" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Network unavailable",
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: /Back to library/ }));
    expect(
      await screen.findByRole("heading", { name: "Your vocabulary topics" }),
    ).toBeInTheDocument();
  });

  it("tests profile dropdown with Information and Log out, click outside, and auth forms", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);
      if (url.endsWith("/dashboard")) return json(dashboard);
      if (url.endsWith("/folders")) return json({ data: { folders: [] } });
      return json({ data: {} });
    });
    render(<App />);

    // Notification click
    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));

    // Profile menu toggle and Information modal
    fireEvent.click(screen.getByRole("button", { name: "User profile" }));
    fireEvent.keyDown(screen.getByRole("button", { name: "User profile" }), {
      key: "Escape",
    });
    fireEvent.click(screen.getByRole("button", { name: "User profile" }));
    expect(
      screen.getByRole("menuitem", { name: "Information" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Log out" }),
    ).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(
      screen.queryByRole("menuitem", { name: "Information" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "User profile" }));

    fireEvent.click(screen.getByRole("menuitem", { name: "Information" }));
    expect(
      screen.getByRole("heading", { name: "User Information" }),
    ).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(
      screen.queryByRole("heading", { name: "User Information" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "User profile" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Information" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(
      screen.queryByRole("heading", { name: "User Information" }),
    ).not.toBeInTheDocument();

    // Click outside to close dropdown
    fireEvent.click(screen.getByRole("button", { name: "User profile" }));
    expect(
      screen.getByRole("menuitem", { name: "Information" }),
    ).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(
      screen.queryByRole("menuitem", { name: "Information" }),
    ).not.toBeInTheDocument();

    // Log out action
    fireEvent.click(screen.getByRole("button", { name: "User profile" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Log out" }));
    expect(
      screen.getByRole("heading", { name: "LinguistPro" }),
    ).toBeInTheDocument();

    // Login submit
    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));
    expect(
      await screen.findByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();

    // Go to register from login
    fireEvent.click(screen.getByRole("button", { name: "User profile" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Log out" }));
    fireEvent.click(screen.getByRole("link", { name: "Sign Up" }));
    expect(
      screen.getByRole("heading", { name: "Create an Account" }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "new@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByLabelText(/I agree to the/));
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));
    expect(
      await screen.findByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();

    // Start Lesson button without active folder routes to practice
    fireEvent.click(screen.getByRole("button", { name: "Start Lesson" }));
    expect(
      screen.getByRole("heading", { name: "Practice Hub" }),
    ).toBeInTheDocument();
  });

  it("exercises PracticeHub modes (flashcards, quiz, AI generator) with active folder", async () => {
    const timestamp = "2026-08-28T00:00:00.000Z";
    const folder = {
      id: "folder-3",
      name: "Academics",
      vocabularyCount: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const words = [
      {
        id: "w1",
        folderId: folder.id,
        word: "hypothesis",
        meaning: "theory",
        ipa: "/haɪˈpɒθəsɪs/",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ];

    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);
      if (url.endsWith("/dashboard")) return json(dashboard);
      if (url.endsWith("/folders"))
        return json({ data: { folders: [folder] } });
      if (url.endsWith("/vocabulary"))
        return json({ data: { folder, vocabulary: words } });
      if (url.endsWith("/tests"))
        return json({
          data: {
            testToken: "t3",
            questions: [
              {
                vocabularyId: "w1",
                word: "hypothesis",
                choices: ["theory", "test", "study", "fact"],
              },
            ],
          },
        });
      if (url.endsWith("/ai/text"))
        return json({ data: { text: "Story on hypothesis" } });
      return json({ data: {} });
    });

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Vocabulary" }));
    await screen.findByText("Academics");
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByText("hypothesis");

    // Mobile Start Lesson preserves the active folder and opens flashcards.
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    const mobileNavigation = screen.getByRole("navigation", {
      name: "Mobile navigation",
    });
    fireEvent.click(
      within(mobileNavigation).getByRole("button", { name: "Start Lesson" }),
    );
    expect(
      screen.getByRole("heading", { name: "Flashcards", level: 1 }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Back to Academics/ }));

    // Go to Practice Hub
    fireEvent.click(screen.getByRole("button", { name: "Practice" }));
    expect(
      screen.getByRole("heading", { name: "Practice Hub" }),
    ).toBeInTheDocument();

    // Start AI story
    fireEvent.click(screen.getByRole("button", { name: "Start AI story" }));
    expect(
      screen.getByRole("heading", { name: "AI Story Generator" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("hypothesis"));
    fireEvent.click(screen.getByRole("button", { name: "Generate text" }));
    await screen.findByLabelText("Generated text");

    // Finish session -> PracticeHub
    fireEvent.click(screen.getByRole("button", { name: "Finish Session" }));
    expect(
      screen.getByRole("heading", { name: "Practice Hub" }),
    ).toBeInTheDocument();

    // Start Quiz from PracticeHub
    fireEvent.click(screen.getByRole("button", { name: "Start quiz" }));
    await screen.findByRole("heading", { name: "Test your knowledge" });
    fireEvent.click(screen.getByRole("button", { name: /Back to Academics/ }));

    // Start Flashcards from PracticeHub
    fireEvent.click(screen.getByRole("button", { name: "Practice" }));
    fireEvent.click(screen.getByRole("button", { name: "Start flashcards" }));
    expect(
      screen.getByRole("heading", { name: "Flashcards", level: 1 }),
    ).toBeInTheDocument();
  });
});
