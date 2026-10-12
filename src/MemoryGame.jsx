import { useEffect, useState } from "react";
import { playFlip, playMatch, playWrong, playWin } from "./sound";

const EMOJIS = ["🦋", "🔮", "👑", "⭐", "🧚", "💎", "🌙", "🌸"];

function shuffleCards() {
  return [...EMOJIS, ...EMOJIS]
    .sort(() => Math.random() - 0.5)
    .map((emoji, index) => ({ id: index, emoji }));
}

function MemoryGame({ hints, onUseHint, onWin, onClose }) {
  const [cards, setCards] = useState(shuffleCards);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [peek, setPeek] = useState([]);
  const [moves, setMoves] = useState(0);

  const won = matched.length === cards.length;

  useEffect(() => {
    if (won) playWin();
  }, [won]);

  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;

      const timer = setTimeout(() => {
        if (cards[a].emoji === cards[b].emoji) {
          setMatched((prev) => [...prev, a, b]);
          playMatch();
        } else {
          playWrong();
        }

        setFlipped([]);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [flipped, cards]);

  const handleFlip = (index) => {
    if (flipped.length === 2) return;
    if (peek.length > 0) return;
    if (flipped.includes(index)) return;
    if (matched.includes(index)) return;

    playFlip();

    if (flipped.length === 1) {
      setMoves((m) => m + 1);
    }

    setFlipped([...flipped, index]);
  };

  const handleHint = () => {
    if (hints < 1 || peek.length > 0 || flipped.length > 0) return;

    const unmatched = cards
      .map((card, i) => i)
      .filter((i) => !matched.includes(i));

    if (unmatched.length === 0) return;

    const first = unmatched[Math.floor(Math.random() * unmatched.length)];
    const second = unmatched.find(
      (i) => i !== first && cards[i].emoji === cards[first].emoji
    );

    onUseHint();
    setPeek([first, second]);

    setTimeout(() => setPeek([]), 1200);
  };

  const handleShuffle = () => {
    setCards(shuffleCards());
    setFlipped([]);
    setMatched([]);
    setPeek([]);
    setMoves(0);
  };

  return (
    <div className="game-overlay">
      <div className="game-popup">
        <div className="game-title">🧩 MEMORY MATCH</div>
        <div className="game-moves">Moves: {moves}</div>

        <div className="game-grid">
          {cards.map((card, index) => {
            const isOpen =
              flipped.includes(index) ||
              matched.includes(index) ||
              peek.includes(index);

            return (
              <button
                key={card.id}
                className={`game-card ${isOpen ? "open" : ""} ${
                  matched.includes(index) ? "matched" : ""
                }`}
                onClick={() => handleFlip(index)}
              >
                {isOpen ? card.emoji : "✦"}
              </button>
            );
          })}
        </div>

        {won ? (
          <div className="game-win">
            <div className="game-win-text">🎉 You won in {moves} moves!</div>
            <button className="collect-button" onClick={() => onWin(20, 5)}>
              ✨ Collect +20 XP +5 💎
            </button>
          </div>
        ) : (
          <div className="game-actions">
            <button
              className="reset-button"
              onClick={handleHint}
              disabled={hints < 1}
            >
              📜 Hint ({hints})
            </button>
            <button className="reset-button" onClick={handleShuffle}>
              🔀 Shuffle
            </button>
            <button className="reset-button" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MemoryGame;