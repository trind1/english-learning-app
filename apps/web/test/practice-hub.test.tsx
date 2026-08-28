import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PracticeHub } from "../src/PracticeHub";

describe("PracticeHub component", () => {
  it("renders modes and handles triggers with wordCount > 0", () => {
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

    expect(
      screen.getByRole("heading", { name: "Practice Hub" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Flashcard Mode")).toBeInTheDocument();
    expect(screen.getByText("Multiple Choice Quiz")).toBeInTheDocument();
    expect(screen.getByText("AI Story Generator")).toBeInTheDocument();
    expect(screen.getByText("12 Cards Due")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Start flashcards" }));
    expect(onStartFlashcards).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Start quiz" }));
    expect(onStartQuiz).toHaveBeenCalledTimes(1);

    expect(
      screen.getByText("Choose up to 10 saved words in the next step."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start AI story" }));
    expect(onStartAi).toHaveBeenCalledTimes(1);
  });

  it("renders modes with wordCount = 0 and handles missing callbacks", () => {
    render(<PracticeHub wordCount={0} />);
    expect(screen.getByText("Vocabulary Cards")).toBeInTheDocument();
    expect(screen.getByText("Adaptive Questions")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start flashcards" }));
    fireEvent.click(screen.getByRole("button", { name: "Start quiz" }));
    fireEvent.click(screen.getByRole("button", { name: "Start AI story" }));
  });
});
