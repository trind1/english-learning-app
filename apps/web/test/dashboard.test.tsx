import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dashboard } from "../src/Dashboard";
describe("TEST-018 dashboard UI", () => {
  it("renders all metrics", async () => {
    const onAction = vi.fn();
    const load = vi.fn().mockResolvedValue({
      folderCount: 1,
      vocabularyCount: 2,
      completedSessionCount: 3,
      completedSessionDates: ["2026-09-02T08:00:00.000Z"],
      correctAnswerCount: 4,
      incorrectAnswerCount: 1,
      accuracyPercent: 80,
    });
    render(
      <Dashboard
        load={load}
        loadFolders={vi.fn().mockResolvedValue([])}
        onAction={onAction}
        now={new Date(2026, 8, 2, 12)}
      />,
    );
    await waitFor(() => expect(screen.getByText("80%")).toBeInTheDocument());
    expect(screen.getByText("Completed sessions")).toBeInTheDocument();
    expect(screen.getByLabelText("33.3% consistency")).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, element) =>
          element?.classList.contains("consistency-summary") === true &&
          element.textContent === "1 of 3 elapsed days active",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Wednesday, September 2, 2026: Today/),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Upcoming")).toHaveLength(4);
    expect(
      screen.getByRole("heading", { name: "Topic Folders" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start learning" }));
    fireEvent.click(screen.getByRole("button", { name: "View All" }));
    fireEvent.click(screen.getByRole("button", { name: "Browse topics" }));
    expect(onAction).toHaveBeenCalledWith("library");
  });
  it("shows loading, error, and retry", async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error("x"))
      .mockResolvedValue({
        folderCount: 0,
        vocabularyCount: 0,
        completedSessionCount: 0,
        completedSessionDates: [],
        correctAnswerCount: 0,
        incorrectAnswerCount: 0,
        accuracyPercent: 0,
      });
    render(
      <Dashboard load={load} loadFolders={vi.fn().mockResolvedValue([])} />,
    );
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() =>
      expect(screen.getByLabelText("0% consistency")).toBeInTheDocument(),
    );
  });
  it("opens a real topic folder from the dashboard carousel", async () => {
    const onOpenFolder = vi.fn();
    render(
      <Dashboard
        load={vi.fn().mockResolvedValue({
          folderCount: 1,
          vocabularyCount: 2,
          completedSessionCount: 0,
          completedSessionDates: [],
          correctAnswerCount: 0,
          incorrectAnswerCount: 0,
          accuracyPercent: 0,
        })}
        loadFolders={vi.fn().mockResolvedValue([
          {
            id: "travel",
            name: "Travel",
            vocabularyCount: 2,
            createdAt: "2026-08-28T00:00:00.000Z",
            updatedAt: "2026-08-28T00:00:00.000Z",
          },
        ])}
        onOpenFolder={onOpenFolder}
      />,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Open folder" }));
    expect(onOpenFolder).toHaveBeenCalledWith(
      expect.objectContaining({ id: "travel" }),
    );
  });
});
