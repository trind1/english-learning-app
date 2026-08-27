import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VocabularyPanel } from "../src/VocabularyPanel";
const item = { id: "1", word: "journey", meaning: "trip", ipa: null };
describe("TEST-013 vocabulary and IPA UI", () => {
  it("renders vocabulary and the IPA fallback, then creates an item", async () => {
    const api = {
      list: vi.fn().mockResolvedValue([item]),
      create: vi.fn().mockResolvedValue({ ...item, id: "2", ipa: "/dʒ/" }),
    };
    render(<VocabularyPanel api={api} />);
    await waitFor(() =>
      expect(screen.getByText("IPA unavailable")).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: "Pronounce journey" }),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Word"), {
      target: { value: "road" },
    });
    fireEvent.change(screen.getByLabelText("Meaning"), {
      target: { value: "way" },
    });
    fireEvent.change(screen.getByLabelText("IPA (optional)"), {
      target: { value: "/weɪ/" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add vocabulary" }));
    await waitFor(() => expect(screen.getByText("/dʒ/")).toBeInTheDocument());
  });
  it("shows validation and load errors", async () => {
    const api = {
      list: vi.fn().mockRejectedValue(new Error("load")),
      create: vi.fn(),
    };
    render(<VocabularyPanel api={api} />);
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Unable to load"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Add vocabulary" }));
    expect(screen.getByRole("alert")).toHaveTextContent("required");
  });
  it("renders a safe fallback for non-Error save failures", async () => {
    const api = {
      list: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockRejectedValue("failure"),
    };
    render(<VocabularyPanel api={api} />);
    await waitFor(() =>
      expect(screen.getByText("No vocabulary yet.")).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByLabelText("Word"), {
      target: { value: "word" },
    });
    fireEvent.change(screen.getByLabelText("Meaning"), {
      target: { value: "meaning" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add vocabulary" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Unable to save vocabulary",
      ),
    );
  });
});
