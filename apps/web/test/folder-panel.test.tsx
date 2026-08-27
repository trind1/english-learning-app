import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FolderPanel } from "../src/FolderPanel";
describe("TEST-012 folder UI", () => {
  it("shows empty state and creates a folder", async () => {
    const api = {
      list: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({
        id: "1",
        name: "Travel",
        vocabularyCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    };
    render(<FolderPanel api={api} />);
    await waitFor(() =>
      expect(screen.getByText("No folders yet.")).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByLabelText("Folder name"), {
      target: { value: "Travel" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create folder" }));
    await waitFor(() => expect(screen.getByText("Travel")).toBeInTheDocument());
  });
  it("validates blank names and supports retry", async () => {
    const api = {
      list: vi.fn().mockRejectedValue(new Error("load")),
      create: vi.fn(),
    };
    render(<FolderPanel api={api} />);
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(api.list).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByRole("button", { name: "Create folder" }));
    expect(screen.getByRole("alert")).toHaveTextContent("1 to 50");
  });
  it("renders a safe fallback for non-Error create failures", async () => {
    const api = {
      list: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockRejectedValue("failure"),
    };
    render(<FolderPanel api={api} />);
    await waitFor(() =>
      expect(screen.getByText("No folders yet.")).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByLabelText("Folder name"), {
      target: { value: "Demo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create folder" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Unable to create folder",
      ),
    );
  });
  it("handles a non-Error list failure", async () => {
    const api = { list: vi.fn().mockRejectedValue("failure"), create: vi.fn() };
    render(<FolderPanel api={api} />);
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Unable to load folders",
      ),
    );
  });
  it("handles an Error create failure", async () => {
    const api = {
      list: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockRejectedValue(new Error("duplicate")),
    };
    render(<FolderPanel api={api} />);
    await waitFor(() =>
      expect(screen.getByText("No folders yet.")).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByLabelText("Folder name"), {
      target: { value: "Demo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create folder" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("duplicate"),
    );
  });
});
