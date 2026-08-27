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
      correctAnswerCount: 4,
      incorrectAnswerCount: 1,
      accuracyPercent: 80,
    });
    render(<Dashboard load={load} onAction={onAction} />);
    await waitFor(() => expect(screen.getByText("80%")).toBeInTheDocument());
    expect(screen.getByText("Completed sessions")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Create folder" }));
    fireEvent.click(screen.getByRole("button", { name: "Add vocabulary" }));
    fireEvent.click(screen.getByRole("button", { name: "Import CSV" }));
    fireEvent.click(screen.getByRole("button", { name: "Start study" }));
    expect(onAction).toHaveBeenCalledWith("library");
    expect(onAction).toHaveBeenCalledWith("flashcards");
  });
  it("shows loading, error, and retry", async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error("x"))
      .mockResolvedValue({
        folderCount: 0,
        vocabularyCount: 0,
        completedSessionCount: 0,
        correctAnswerCount: 0,
        incorrectAnswerCount: 0,
        accuracyPercent: 0,
      });
    render(<Dashboard load={load} />);
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(screen.getByText("0%")).toBeInTheDocument());
  });
});
