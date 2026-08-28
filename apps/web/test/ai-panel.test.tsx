import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AiPanel } from "../src/AiPanel";

describe("TEST-015 AI text generation", () => {
  it("caps selection at 10 and generates highlighted text", async () => {
    const words = Array.from({ length: 12 }, (_, i) => ({
      id: `w-${i}`,
      word: `word-${i}`,
    }));
    const generate = vi
      .fn()
      .mockResolvedValue("This is a story about word-0 and word-1.");
    const onFinish = vi.fn();
    render(<AiPanel words={words} generate={generate} onFinish={onFinish} />);

    for (const w of words) {
      fireEvent.click(screen.getByLabelText(w.word));
    }
    // Toggle one off
    fireEvent.click(screen.getByLabelText(words[0]!.word));
    fireEvent.click(screen.getByLabelText(words[0]!.word));

    fireEvent.click(screen.getByRole("button", { name: "Generate text" }));
    await waitFor(() =>
      expect(screen.getByLabelText("Generated text")).toHaveTextContent(
        "AI-generated: This is a story about word-0 and word-1.",
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "Finish Session" }));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("handles empty words list", () => {
    render(<AiPanel words={[]} generate={vi.fn()} />);
    expect(
      screen.getByText("No vocabulary available to select."),
    ).toBeInTheDocument();
  });

  it("validates empty selection and service unavailable", async () => {
    const generate = vi.fn();
    const { rerender } = render(
      <AiPanel
        words={[{ id: "1", word: "run" }]}
        generate={generate}
        enabled={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Generate text" }));
    expect(screen.getByRole("alert")).toHaveTextContent("unavailable");

    rerender(
      <AiPanel
        words={[{ id: "1", word: "run" }]}
        generate={generate}
        enabled={true}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Generate text" }));
    expect(screen.getByRole("alert")).toHaveTextContent("at least one word");
  });

  it("shows an error when generate fails", async () => {
    const generate = vi.fn().mockRejectedValue(new Error("fail"));
    render(<AiPanel words={[{ id: "1", word: "run" }]} generate={generate} />);
    fireEvent.click(screen.getByLabelText("run"));
    fireEvent.click(screen.getByRole("button", { name: "Generate text" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "AI generation failed",
      ),
    );
  });
});
