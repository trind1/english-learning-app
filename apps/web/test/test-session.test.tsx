import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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
  it("selects once and shows results", async () => {
    const api = {
      submit: vi.fn().mockResolvedValue({
        correctCount: 1,
        incorrectCount: 0,
        totalCount: 1,
      }),
    };
    render(<TestSession questions={questions} api={api} />);
    fireEvent.click(screen.getByRole("button", { name: "greeting" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    await waitFor(() =>
      expect(screen.getByText("1 correct of 1")).toBeInTheDocument(),
    );
    expect(api.submit).toHaveBeenCalledTimes(1);
  });
  it("shows ineligible and failure states", async () => {
    render(<TestSession questions={[]} api={{ submit: vi.fn() }} />);
    expect(screen.getByRole("status")).toHaveTextContent("not available");
    cleanup();
    const api = { submit: vi.fn().mockRejectedValue(new Error("x")) };
    render(<TestSession questions={questions} api={api} />);
    fireEvent.click(screen.getByRole("button", { name: "greeting" }));
    fireEvent.click(
      screen.getAllByRole("button", { name: "Submit answer" })[0]!,
    );
    await waitFor(() =>
      expect(screen.getAllByRole("alert").at(-1)).toHaveTextContent("Unable"),
    );
  });
  it("advances through multiple questions", () => {
    const api = { submit: vi.fn() };
    const two = [
      ...questions,
      { vocabularyId: "2", word: "bye", choices: questions[0]!.choices },
    ];
    render(<TestSession questions={two} api={api} />);
    fireEvent.click(screen.getByRole("button", { name: "greeting" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    expect(screen.getByText("Question 2 of 2")).toBeInTheDocument();
  });
});
