import { useState } from "react";
import { playMatch, playWrong, playWin } from "./sound";

const TOTAL = 5;

function QuizGame({ title, makeQuestion, onWin, onClose }) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState(makeQuestion);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);

  const handlePick = (option) => {
    if (picked !== null) return;

    setPicked(option);

    if (option === question.answer) {
      setScore((s) => s + 1);
      playMatch();
    } else {
      playWrong();
    }

    setTimeout(() => {
      if (index + 1 === TOTAL) {
        setDone(true);
        playWin();
      } else {
        setIndex((i) => i + 1);
        setQuestion(makeQuestion());
        setPicked(null);
      }
    }, 1400);
  };

  const handleAgain = () => {
    setIndex(0);
    setScore(0);
    setQuestion(makeQuestion());
    setPicked(null);
    setDone(false);
  };

  return (
    <div className="game-overlay">
      <div className="game-popup">
        <div className="game-title">{title}</div>

        {done ? (
          <div className="game-win">
            <div className="game-win-text">
              You scored {score} / {TOTAL}
            </div>

            {score > 0 ? (
              <button
                className="collect-button"
                onClick={() => onWin(score * 4, score)}
              >
                ✨ Collect +{score * 4} XP +{score} 💎
              </button>
            ) : null}

            <div className="game-actions">
              <button className="reset-button" onClick={handleAgain}>
                🔁 Try again
              </button>
              <button className="reset-button" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="game-moves">
              Question {index + 1} / {TOTAL} · Score {score}
            </div>

            <div className="math-question">{question.text}</div>

            <div className="math-options">
              {question.options.map((option) => {
                let state = "";

                if (picked !== null) {
                  if (option === question.answer) state = "right";
                  else if (option === picked) state = "wrong";
                }

                return (
                  <button
                    key={option}
                    className={`math-option ${state}`}
                    onClick={() => handlePick(option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="game-moves">
              {picked !== null && question.rule ? question.rule : "\u00A0"}
            </div>

            <div className="game-actions">
              <button className="reset-button" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default QuizGame;