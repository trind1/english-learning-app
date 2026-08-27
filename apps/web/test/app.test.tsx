import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/App";

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
  afterEach(() => vi.restoreAllMocks());
  it("shows the real dashboard and navigates to the library", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) =>
      String(input).endsWith("/dashboard")
        ? json(dashboard)
        : json({ data: { folders: [] } }),
    );
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Primary navigation" }),
    ).toBeInTheDocument();
    await screen.findByText("0%");
    fireEvent.click(screen.getByRole("button", { name: "Library" }));
    expect(await screen.findByText("No folders yet.")).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole("button", { name: "Library" }));
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
    fireEvent.click(screen.getByRole("button", { name: "Study" }));
    expect(
      screen.getByRole("heading", { name: "Your vocabulary topics" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "+ Add vocabulary" }));
    fireEvent.click(screen.getByRole("button", { name: "Dashboard" }));
    await screen.findByText("0%");
    fireEvent.click(screen.getByRole("button", { name: "Library" }));
    await screen.findByText("No folders yet.");
    fireEvent.click(
      screen.getByRole("button", { name: "English Learning home" }),
    );
    expect(
      screen.getByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();
    await screen.findByText("0%");
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
    fireEvent.click(screen.getByRole("button", { name: "Library" }));
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
    fireEvent.click(screen.getByRole("button", { name: "Study" }));
    expect(
      screen.getByRole("heading", { name: "Flashcards", level: 1 }),
    ).toBeInTheDocument();
    expect(
      requests.some(
        (request) =>
          request.includes("POST") && request.endsWith("/test-sessions"),
      ),
    ).toBe(true);
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
    fireEvent.click(screen.getByRole("button", { name: "Library" }));
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
});
