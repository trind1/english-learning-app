import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Flashcards } from "../src/Flashcards";
const items = [{ id: "1", word: "hello", meaning: "greeting", ipa: null }];
describe("TEST-016 flashcards", () => {
  it("shows empty state and reveals meaning", () => {
    render(<Flashcards items={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent("No vocabulary");
    const populated = render(
      <Flashcards items={items} shuffle={(x) => [...x]} />,
    );
    const populatedView = within(populated.container);
    expect(
      [...populated.container.querySelectorAll("p")].find((node) =>
        node.textContent?.includes("IPA unavailable"),
      ),
    ).toBeInTheDocument();
    fireEvent.click(
      populatedView.getByRole("button", { name: "Reveal meaning" }),
    );
    expect(populatedView.getByText("greeting")).toBeInTheDocument();
    expect(
      populatedView.getByLabelText("Flashcard progress"),
    ).toHaveTextContent("1 / 1");
    expect(
      populatedView.getByRole("button", { name: "Pronounce hello" }),
    ).toBeInTheDocument();
    fireEvent.click(populatedView.getByRole("button", { name: "Previous" }));
    fireEvent.click(populatedView.getByRole("button", { name: "Next" }));
    fireEvent.click(populatedView.getByRole("button", { name: "Shuffle" }));
    fireEvent.click(populatedView.getByRole("button", { name: "Restart" }));
  });
});
