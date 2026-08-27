import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";

describe("TEST-011 web shell", () => {
  it("provides named navigation, main content, and live status", async () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "English Learning" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Primary navigation" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("status")
        .some((node) => node.textContent === "Ready to learn."),
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "View folders" }));
    expect(
      screen
        .getAllByRole("status")
        .some((node) => node.textContent === "Your folders are ready."),
    ).toBe(true);
    fireEvent.change(screen.getByLabelText("Folder name"), {
      target: { value: "Demo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create folder" }));
  });
  it("boots the browser entry point", async () => {
    document.body.innerHTML = '<div id="root"></div>';
    await import("../src/main");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.getElementById("root")).toContainElement(
      screen.getByRole("main"),
    );
  });
});
