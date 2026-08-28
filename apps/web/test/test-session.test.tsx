import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestSession } from "../src/TestSession";

const questions = [
  {
    vocabularyId: "1",
    word: "hello",
    choices: ["greeting", "farewell", "object", "place"],
  },
];

describe("TEST-017 multiple choice", () => {
  it("shows unavailable state for empty question list", () => {
    render(<TestSession questions={[]} api={{ submit: vi.fn() }} />);
    expect(screen.getByRole("status")).toHaveTextContent("not available");
  });

  it("selects once and shows results for high score", async () => {
    const onNavigate = vi.fn();
    const api = {
      submit: vi.fn().mockResolvedValue({
        correctCount: 1,
        incorrectCount: 0,
        totalCount: 1,
      }),
    };
    render(
      <TestSession questions={questions} api={api} onNavigate={onNavigate} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "greeting" }));
    fireEvent.click(screen.getByRole("button", { name: "farewell" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    await waitFor(() =>
      expect(screen.getByText("1 correct of 1")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Back to folder" }));
    fireEvent.click(screen.getByRole("button", { name: "Dashboard" }));
    expect(onNavigate).toHaveBeenCalledWith("folder");
    expect(onNavigate).toHaveBeenCalledWith("dashboard");
  });

  it("shows results for low score (<70%) and renders without onNavigate", async () => {
    const api = {
      submit: vi.fn().mockResolvedValue({
        correctCount: 0,
        incorrectCount: 2,
        totalCount: 2,
      }),
    };
    render(
      <TestSession
        questions={[
          ...questions,
          { vocabularyId: "2", word: "world", choices: ["a", "b"] },
        ]}
        api={api}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "greeting" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    fireEvent.click(screen.getByRole("button", { name: "a" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    await waitFor(() =>
      expect(screen.getByText("0 correct of 2")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Back to folder" }));
    fireEvent.click(screen.getByRole("button", { name: "Dashboard" }));
  });

  it("shows a user-facing error if submission fails and handles skip", async () => {
    const api = { submit: vi.fn().mockRejectedValue(new Error("x")) };
    render(<TestSession questions={questions} api={api} />);
    fireEvent.click(screen.getByRole("button", { name: "greeting" }));
    fireEvent.click(
      screen.getAllByRole("button", { name: "Submit answer" })[0]!,
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Unable"),
    );
  });

  it("advances through multiple questions and handles skip question", () => {
    const api = { submit: vi.fn() };
    const two = [
      ...questions,
      {
        vocabularyId: "2",
        word: "world",
        choices: ["earth", "sky", "sea", "space"],
      },
    ];
    render(<TestSession questions={two} api={api} />);
    fireEvent.click(screen.getByRole("button", { name: "Skip Question" }));
    expect(screen.getByText("Question 2 of 2")).toBeInTheDocument();
  });
});
