import "@testing-library/jest-dom/vitest";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Flashcards } from "../src/Flashcards";

describe("TEST-016 flashcards", () => {
  it("shows empty state and reveals meaning and ratings", () => {
    const emptyView = render(<Flashcards items={[]} />);
    expect(emptyView.getByRole("status")).toHaveTextContent("No vocabulary");
    emptyView.unmount();

    const onClose = vi.fn();
    const populatedView = render(
      <Flashcards
        items={[
          { id: "1", word: "hello", meaning: "greeting", ipa: "/həˈləʊ/" },
          { id: "2", word: "world", meaning: "earth", ipa: null },
        ]}
        shuffle={(x) => [...x]}
        onClose={onClose}
      />,
    );

    expect(
      populatedView.getByRole("button", { name: "Close session" }),
    ).toBeInTheDocument();
    fireEvent.click(
      populatedView.getByRole("button", { name: "Close session" }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);

    expect(
      populatedView.getByRole("button", { name: "Reveal meaning" }),
    ).toBeInTheDocument();

    // Click to flip
    fireEvent.click(populatedView.getByText("hello"));
    expect(populatedView.getByText("greeting")).toBeInTheDocument();

    // Click rating buttons
    fireEvent.click(populatedView.getByRole("button", { name: /Hard/ }));
    expect(
      populatedView.getByLabelText("Flashcard progress"),
    ).toHaveTextContent("2 / 2");

    fireEvent.click(
      populatedView.getByRole("button", { name: "Reveal meaning" }),
    );
    fireEvent.click(populatedView.getByRole("button", { name: /Good/ }));
    expect(
      populatedView.getByLabelText("Flashcard progress"),
    ).toHaveTextContent("1 / 2");

    fireEvent.click(
      populatedView.getByRole("button", { name: "Reveal meaning" }),
    );
    fireEvent.click(populatedView.getByRole("button", { name: /Easy/ }));

    fireEvent.click(populatedView.getByRole("button", { name: "Previous" }));
    fireEvent.click(populatedView.getByRole("button", { name: "Next" }));
    fireEvent.click(populatedView.getByRole("button", { name: "Shuffle" }));
    fireEvent.click(populatedView.getByRole("button", { name: "Restart" }));
  });
});
