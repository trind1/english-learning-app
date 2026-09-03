import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AiPanel } from "../src/AiPanel";

const result = {
  story: "Our JOURNEY started at the airport.",
  usedWords: ["journey", "airport"],
  source: "openai" as const,
};

describe("TEST-015 AI story generation", () => {
  it("renders vocabulary details, selects words, and highlights the normalized result", async () => {
    const generate = vi.fn().mockResolvedValue(result);
    const onFinish = vi.fn();
    render(
      <AiPanel
        words={[
          { id: "1", word: "journey", ipa: "/ˈdʒɜːni/", meaning: "trip" },
          { id: "2", word: "airport", meaning: "plane terminal" },
        ]}
        generate={generate}
        onFinish={onFinish}
      />,
    );
    expect(screen.getByText("/ˈdʒɜːni/")).toBeInTheDocument();
    expect(screen.getByText("plane terminal")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate Story" }),
    ).toBeDisabled();

    fireEvent.click(screen.getByLabelText("journey"));
    fireEvent.click(screen.getByLabelText("airport"));
    expect(screen.getByText("Selected 2 / 10")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Generate Story" }));

    expect(await screen.findByLabelText("Generated story")).toHaveTextContent(
      result.story,
    );
    expect(
      screen.getAllByText(/journey/i).some((node) => node.tagName === "MARK"),
    ).toBe(true);
    expect(generate).toHaveBeenCalledWith(["1", "2"]);
    fireEvent.click(screen.getByRole("button", { name: "Generate Again" }));
    await waitFor(() => expect(generate).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByRole("button", { name: "Back to Practice" }));
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it("enforces ten selections and allows a selected word to be removed", () => {
    const words = Array.from({ length: 11 }, (_, index) => ({
      id: String(index),
      word: `word-${index}`,
    }));
    render(<AiPanel words={words} generate={vi.fn()} />);
    words.forEach(({ word }) => fireEvent.click(screen.getByLabelText(word)));
    expect(screen.getByRole("alert")).toHaveTextContent("up to 10");
    expect(screen.getByText("Selected 10 / 10")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("word-0"));
    expect(screen.getByText("Selected 9 / 10")).toBeInTheDocument();
  });

  it("renders a safe plain-text story when the normalized used-word list is empty", async () => {
    render(
      <AiPanel
        words={[{ id: "1", word: "journey" }]}
        generate={vi.fn().mockResolvedValue({
          story: "A safe plain-text response.",
          usedWords: [],
          source: "openai",
        })}
      />,
    );
    fireEvent.click(screen.getByLabelText("journey"));
    fireEvent.click(screen.getByRole("button", { name: "Generate Story" }));
    expect(await screen.findByLabelText("Generated story")).toHaveTextContent(
      "A safe plain-text response.",
    );
    expect(document.querySelector("mark")).toBeNull();
  });

  it("shows empty, explicitly disabled, loading, local, and safe failure states", async () => {
    const pending = new Promise<typeof result>(() => undefined);
    const disabledView = render(
      <AiPanel words={[]} generate={vi.fn()} enabled={false} />,
    );
    expect(
      screen.getByText("No vocabulary available to select."),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("unavailable");

    disabledView.unmount();
    const loadingView = render(
      <AiPanel words={[{ id: "1", word: "run" }]} generate={() => pending} />,
    );
    fireEvent.click(screen.getByLabelText("run"));
    fireEvent.click(screen.getByRole("button", { name: "Generate Story" }));
    expect(
      screen.getByRole("button", { name: "Generating story…" }),
    ).toBeDisabled();
    expect(screen.getByLabelText("run")).toBeDisabled();

    loadingView.unmount();
    const localView = render(
      <AiPanel
        words={[{ id: "1", word: "run" }]}
        generate={vi.fn().mockResolvedValue({
          story: "run",
          usedWords: ["run"],
          source: "local",
        })}
      />,
    );
    fireEvent.click(screen.getByLabelText("run"));
    fireEvent.click(screen.getByRole("button", { name: "Generate Story" }));
    expect(await screen.findByText("Local preview")).toBeInTheDocument();

    localView.unmount();
    render(
      <AiPanel
        words={[{ id: "1", word: "run" }]}
        generate={vi.fn().mockRejectedValue(new Error("private"))}
      />,
    );
    fireEvent.click(screen.getByLabelText("run"));
    fireEvent.click(screen.getByRole("button", { name: "Generate Story" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to generate",
    );
    expect(screen.queryByText("private")).not.toBeInTheDocument();
  });
});
