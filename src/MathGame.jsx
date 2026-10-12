import { useState } from "react";
import { playMatch, playWrong, playWin } from "./sound";

const TOTAL = 5;

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeQuestion() {
  const ops = ["+", "-", "×"];
  const op = ops[rand(0, 2)];

  let a;
  let b;
  let answer;

  if (op === "+") {
    a = rand(10, 99);
    b = rand(10, 99);
    answer = a + b;
  } else if (op === "-") {
    a = rand(30, 99);
    b = rand(10, a - 1);
    answer = a - b;
  } else {
    a = rand(3, 12);
    b = rand(3, 12);
    answer = a * b;
  }

  const options = new Set([answer]);

  while (options.size < 4) {
    const wrong = answer + rand(1, 10) * (Math.random() < 0.5 ? -1 : 1);

    if (wrong > 0) options.add(wrong);
  }

  return {
    text: `${a} ${op} ${b}`,
    answer,
    options: [...options].sort(() => Math.random() - 0.5),
  };
}

function MathGame({ onWin, onClose }) {
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
    }, 800);
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
        <div className="game-title">➕ QUICK MATH</div>

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

            <div className="math-question">{question.text} = ?</div>

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

export default MathGame;