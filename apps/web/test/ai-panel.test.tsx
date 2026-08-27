import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AiPanel } from "../src/AiPanel";
const words = [{ id: "1", word: "journey" }];
describe("TEST-019 AI UI", () => {
  it("generates display-only text", async () => {
    const generate = vi.fn().mockResolvedValue("A journey story");
    render(<AiPanel words={words} generate={generate} />);
    fireEvent.click(screen.getByLabelText("journey"));
    fireEvent.click(screen.getByRole("button", { name: "Generate text" }));
    await waitFor(() =>
      expect(screen.getByLabelText("Generated text")).toHaveTextContent(
        "A journey story",
      ),
    );
  });
  it("handles disabled, empty, and failure states", async () => {
    const generate = vi.fn().mockRejectedValue(new Error("x"));
    render(<AiPanel words={[]} generate={generate} enabled={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Generate text" }));
    expect(screen.getByRole("alert")).toHaveTextContent("unavailable");
  });
  it("shows a recoverable provider failure", async () => {
    const generate = vi.fn().mockRejectedValue(new Error("offline"));
    render(<AiPanel words={words} generate={generate} />);
    fireEvent.click(screen.getByLabelText("journey"));
    fireEvent.click(screen.getByRole("button", { name: "Generate text" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "AI generation failed",
      ),
    );
  });
  it("toggles selections and caps selection at ten", () => {
    const many = Array.from({ length: 11 }, (_, i) => ({
      id: String(i),
      word: `w${i}`,
    }));
    render(<AiPanel words={many} generate={vi.fn()} />);
    fireEvent.click(screen.getByLabelText("w0"));
    fireEvent.click(screen.getByLabelText("w0"));
    many
      .slice(0, 11)
      .forEach((w) => fireEvent.click(screen.getByLabelText(w.word)));
    expect(screen.getByRole("button", { name: "Generate text" })).toBeEnabled();
  });
});
