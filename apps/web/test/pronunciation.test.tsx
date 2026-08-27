import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  PronunciationButton,
  browserSpeechPort,
} from "../src/PronunciationButton";
describe("TEST-015 pronunciation", () => {
  it("provides a browser speech adapter", () => {
    const speak = vi.fn();
    Object.defineProperty(window, "speechSynthesis", { value: { speak } });
    Object.defineProperty(globalThis, "SpeechSynthesisUtterance", {
      value: class {
        constructor(public text: string) {}
      },
    });
    const port = browserSpeechPort();
    expect(port.supported).toBe(true);
    port.speak("hello");
    expect(speak).toHaveBeenCalled();
  });
  it("speaks when supported", () => {
    const speak = vi.fn();
    render(
      <PronunciationButton word="hello" speech={{ supported: true, speak }} />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(speak).toHaveBeenCalledWith("hello");
  });
  it("reports unsupported and failures", () => {
    render(
      <PronunciationButton
        word="hello"
        speech={{ supported: false, speak: vi.fn() }}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("alert")).toHaveTextContent("not supported");
    const failing = vi.fn(() => {
      throw new Error("x");
    });
    render(
      <PronunciationButton
        word="hello"
        speech={{ supported: true, speak: failing }}
      />,
    );
    fireEvent.click(screen.getAllByRole("button")[1]!);
    expect(screen.getAllByRole("alert").at(-1)).toHaveTextContent("failed");
  });
});
