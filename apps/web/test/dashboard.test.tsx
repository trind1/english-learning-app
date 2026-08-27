import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dashboard } from "../src/Dashboard";
describe("TEST-018 dashboard UI", () => {
  it("renders all metrics", async () => {
    const load = vi.fn().mockResolvedValue({
      folderCount: 1,
      vocabularyCount: 2,
      completedSessionCount: 3,
      correctAnswerCount: 4,
      incorrectAnswerCount: 1,
      accuracyPercent: 80,
    });
    render(<Dashboard load={load} />);
    await waitFor(() => expect(screen.getByText("80%")).toBeInTheDocument());
    expect(screen.getByText("Completed sessions")).toBeInTheDocument();
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
