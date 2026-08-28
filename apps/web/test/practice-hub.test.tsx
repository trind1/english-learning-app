import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PracticeHub } from "../src/PracticeHub";

describe("PracticeHub component", () => {
  it("renders modes and handles triggers", () => {
    const onStartFlashcards = vi.fn();
    const onStartQuiz = vi.fn();
    const onStartAi = vi.fn();

    render(
      <PracticeHub
        wordCount={12}
        onStartFlashcards={onStartFlashcards}
        onStartQuiz={onStartQuiz}
        onStartAi={onStartAi}
      />,
    );

    expect(screen.getByRole("heading", { name: "Practice Hub" })).toBeInTheDocument();
    expect(screen.getByText("Flashcard Mode")).toBeInTheDocument();
    expect(screen.getByText("Multiple Choice Quiz")).toBeInTheDocument();
    expect(screen.getByText("AI Story Generator")).toBeInTheDocument();
    expect(screen.getByText("12 Cards Due")).toBeInTheDocument();

    const startButtons = screen.getAllByRole("button", { name: /Start/i });
    fireEvent.click(startButtons[0]!);
    expect(onStartFlashcards).toHaveBeenCalledTimes(1);

    fireEvent.click(startButtons[1]!);
    expect(onStartQuiz).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByPlaceholderText(/e.g., resilient/), {
      target: { value: "ubiquitous" },
    });
    fireEvent.click(startButtons[2]!);
    expect(onStartAi).toHaveBeenCalledWith("ubiquitous");
  });
});
