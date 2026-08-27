import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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
});
