import { useState } from "react";
import type { VocabularyItem } from "./VocabularyPanel";
import { PronunciationButton } from "./PronunciationButton";
export type Shuffle = <T>(items: readonly T[]) => T[];
export const Flashcards = ({
  items,
  shuffle = (values) => [...values].sort(() => Math.random() - 0.5),
}: {
  items: readonly VocabularyItem[];
  shuffle?: Shuffle;
}) => {
  const [cards, setCards] = useState(() => shuffle(items));
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  if (!items.length)
    return (
      <section aria-label="Flashcards">
        <p role="status">No vocabulary available for flashcards.</p>
      </section>
    );
  const card = cards[index]!;
  const restart = () => {
    setCards(shuffle(items));
    setIndex(0);
    setRevealed(false);
  };
  const move = (nextIndex: number) => {
    setIndex((nextIndex + cards.length) % cards.length);
    setRevealed(false);
  };
  return (
    <section aria-label="Flashcards">
      <h2>Flashcards</h2>
      <p aria-label="Flashcard progress">
        {index + 1} / {cards.length}
      </p>
      <p>
        {card.word} — {card.ipa || "IPA unavailable"}
      </p>
      <PronunciationButton word={card.word} />
      {revealed && <p>{card.meaning}</p>}
      <button type="button" onClick={() => setRevealed(true)}>
        Reveal meaning
      </button>
      <button type="button" onClick={() => move(index - 1)}>
        Previous
      </button>
      <button type="button" onClick={() => move(index + 1)}>
        Next
      </button>
      <button type="button" onClick={restart}>
        Shuffle
      </button>
      <button type="button" onClick={restart}>
        Restart
      </button>
    </section>
  );
};
