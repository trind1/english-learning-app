import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
    fireEvent.click(
      screen.getAllByRole("button", { name: "Create folder" }).at(-1)!,
    );
  });
  it("boots the browser entry point", async () => {
    document.body.innerHTML = '<div id="root"></div>';
    await import("../src/main");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.getElementById("root")).toContainElement(
      screen.getByRole("main"),
    );
    document.body.innerHTML = "";
  });

  it("loads folders through the same-origin API client", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: { folders: [] } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    render(<App />);
    expect(await screen.findByText("No folders yet.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/folders$/),
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            id: "folder-1",
            name: "Demo",
            vocabularyCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      ),
    );
    fireEvent.change(screen.getByLabelText("Folder name"), {
      target: { value: "Demo" },
    });
    fireEvent.click(
      screen.getAllByRole("button", { name: "Create folder" }).at(-1)!,
    );
    expect((await screen.findAllByText("Demo")).length).toBeGreaterThan(0);
    fetchMock.mockRestore();
  });
});
