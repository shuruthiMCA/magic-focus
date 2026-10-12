import { useEffect, useState } from "react";
import { playCollect, playFlip, playMatch, playWrong } from "./sound";

const STORAGE_KEY = "magicFocusCards";
const SESSION_SIZE = 10;

const makeId = (n = 0) =>
  `${Date.now()}-${n}-${Math.floor(Math.random() * 100000)}`;

function loadCards() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function CardsPage({ onReward }) {
  const [cards, setCards] = useState(loadCards);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [message, setMessage] = useState("");
  const [session, setSession] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  const mastered = cards.filter((card) => card.box >= 3).length;

  // =========================
  // ADD / DELETE
  // =========================

  const handleAdd = () => {
    const q = question.trim();
    const a = answer.trim();

    if (!q || !a) {
      setMessage("Please type both a question and an answer.");
      return;
    }

    setCards([...cards, { id: makeId(), q, a, box: 1 }]);
    setQuestion("");
    setAnswer("");
    setMessage("Card added ✅");
    playMatch();
  };

  const handleBulkAdd = () => {
    const added = bulkText
      .split("\n")
      .map((line) => line.split("|"))
      .filter(
        (parts) =>
          parts.length >= 2 &&
          parts[0].trim() !== "" &&
          parts.slice(1).join("|").trim() !== ""
      )
      .map((parts, i) => ({
        id: makeId(i),
        q: parts[0].trim(),
        a: parts.slice(1).join("|").trim(),
        box: 1,
      }));

    if (added.length === 0) {
      setMessage("Write one card per line like:  question | answer");
      return;
    }

    setCards([...cards, ...added]);
    setBulkText("");
    setMessage(`${added.length} cards added ✅`);
    playMatch();
  };

  const handleDelete = (id) => {
    setCards(cards.filter((card) => card.id !== id));
  };

  // =========================
  // STUDY
  // =========================

  const handleStudy = () => {
    if (cards.length === 0) return;

    const ordered = [...cards]
      .sort((x, y) => x.box - y.box || Math.random() - 0.5)
      .slice(0, SESSION_SIZE);

    playCollect();
    setSession({
      ids: ordered.map((card) => card.id),
      index: 0,
      flipped: false,
      got: 0,
    });
  };

  const handleFlip = () => {
    playFlip();
    setSession({ ...session, flipped: !session.flipped });
  };

  const handleAnswer = (knew) => {
    const id = session.ids[session.index];

    setCards(
      cards.map((card) =>
        card.id === id
          ? { ...card, box: knew ? Math.min(3, card.box + 1) : 1 }
          : card
      )
    );

    if (knew) playMatch();
    else playWrong();

    setSession({
      ...session,
      got: session.got + (knew ? 1 : 0),
      index: session.index + 1,
      flipped: false,
    });
  };

  // =========================
  // STUDY SCREEN
  // =========================

  if (session) {
    const total = session.ids.length;
    const finished = session.index >= total;

    if (finished) {
      const xp = session.got * 2;
      const crystals = Math.floor(session.got / 2);

      return (
        <div className="page">
          <div className="page-title">✦ ROUND COMPLETE ✦</div>

          <div className="flash-done">
            <div className="flash-done-score">
              You knew {session.got} of {total}
            </div>

            {session.got > 0 ? (
              <button
                className="collect-button"
                onClick={() => {
                  onReward(xp, crystals);
                  setSession(null);
                }}
              >
                ✨ Collect +{xp} XP{crystals > 0 ? ` +${crystals} 💎` : ""}
              </button>
            ) : (
              <div className="flash-hint">
                No worries — these cards will come back so you can learn them.
              </div>
            )}

            <div className="flash-actions">
              <button className="reset-button" onClick={handleStudy}>
                🔁 Study again
              </button>

              <button className="reset-button" onClick={() => setSession(null)}>
                Back to cards
              </button>
            </div>
          </div>
        </div>
      );
    }

    const current = cards.find((card) => card.id === session.ids[session.index]);

    return (
      <div className="page">
        <div className="page-title">✦ STUDY TIME ✦</div>

        <div className="flash-progress">
          Card {session.index + 1} / {total}
        </div>

        <div className="flash-scene" onClick={handleFlip}>
          <div className={`flash-card ${session.flipped ? "flipped" : ""}`}>
            <div className="flash-face flash-front">
              <span className="flash-tag">QUESTION</span>
              {current.q}
            </div>

            <div className="flash-face flash-back">
              <span className="flash-tag">ANSWER</span>
              {current.a}
            </div>
          </div>
        </div>

        {session.flipped ? (
          <div className="flash-actions">
            <button className="flash-again" onClick={() => handleAnswer(false)}>
              🔁 Again
            </button>

            <button className="flash-got" onClick={() => handleAnswer(true)}>
              ✅ Got it
            </button>
          </div>
        ) : (
          <div className="flash-hint">Tap the card to see the answer</div>
        )}

        <button className="reset-button" onClick={() => setSession(null)}>
          Stop studying
        </button>
      </div>
    );
  }

  // =========================
  // LIST SCREEN
  // =========================

  return (
    <div className="page">
      <div className="page-title">✦ MY FLASHCARDS ✦</div>
      <p className="page-sub">Add questions you want to remember, then study them</p>

      <div className="flash-form">
        <input
          className="flash-input"
          type="text"
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <input
          className="flash-input"
          type="text"
          placeholder="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />

        <button className="flash-add" onClick={handleAdd}>
          ➕ Add card
        </button>
      </div>

      <button
        className="custom-toggle"
        onClick={() => setBulkOpen(!bulkOpen)}
      >
        📋 {bulkOpen ? "Hide" : "Add many cards at once"}
      </button>

      {bulkOpen && (
        <div className="flash-bulk">
          <textarea
            className="flash-textarea"
            rows="5"
            placeholder={"One card per line, like this:\nCapital of India | New Delhi\n7 x 8 | 56"}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
          />

          <button className="flash-add" onClick={handleBulkAdd}>
            ➕ Add these cards
          </button>
        </div>
      )}

      <div className="flash-message">{message || "\u00A0"}</div>

      <div className="chip-row">
        <div className="chip">
          📚 {cards.length} <span>cards</span>
        </div>

        <div className="chip">
          🏆 {mastered} <span>mastered</span>
        </div>
      </div>

      <button
        className="magic-button"
        onClick={handleStudy}
        disabled={cards.length === 0}
      >
        ▶ Study now
      </button>

      {cards.length === 0 ? (
        <div className="subject-empty flash-empty">
          No cards yet. Add your first question above!
        </div>
      ) : (
        <div className="flash-list">
          {cards.map((card) => (
            <div className="flash-item" key={card.id}>
              <div className="flash-item-text">
                <div className="flash-q">{card.q}</div>
                <div className="flash-a">{card.a}</div>
              </div>

              <div className="flash-box" title="Memory level">
                {"●".repeat(card.box)}
                {"○".repeat(3 - card.box)}
              </div>

              <button
                className="flash-delete"
                onClick={() => handleDelete(card.id)}
                title="Delete card"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CardsPage;