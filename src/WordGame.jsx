import { useState } from "react";
import { playMatch, playWrong, playWin } from "./sound";

const TOTAL = 5;

const WORDS = [
  { word: "FOCUS", clue: "Giving all your attention to one thing" },
  { word: "MEMORY", clue: "The ability to remember things" },
  { word: "SCIENCE", clue: "Study of nature using experiments" },
  { word: "HISTORY", clue: "Study of past events" },
  { word: "PLANET", clue: "Earth and Mars are examples" },
  { word: "BRAIN", clue: "The organ you think with" },
  { word: "STUDY", clue: "To learn about a subject" },
  { word: "LOGIC", clue: "Clear and correct reasoning" },
  { word: "NUMBER", clue: "Used for counting" },
  { word: "GRAMMAR", clue: "Rules of a language" },
  { word: "LIBRARY", clue: "A place full of books" },
  { word: "TEACHER", clue: "Someone who helps you learn" },
  { word: "ENERGY", clue: "The power to do work" },
  { word: "GALAXY", clue: "A huge group of stars, like the Milky Way" },
  { word: "WISDOM", clue: "Good judgement from knowledge" },
  { word: "PUZZLE", clue: "A problem that tests your mind" },
  { word: "CLIMATE", clue: "Usual weather of a place" },
  { word: "REVISION", clue: "Reading again before an exam" },
  { word: "SUBJECT", clue: "Maths or English, for example" },
  { word: "ANSWER", clue: "The reply to a question" },
  { word: "CHAPTER", clue: "A section of a book" },
  { word: "NOTEBOOK", clue: "You write your notes in it" },
  { word: "CRYSTAL", clue: "A clear, shiny, magical stone" },
  { word: "CASTLE", clue: "Where a princess may live" },
];

function pickWords() {
  return [...WORDS].sort(() => Math.random() - 0.5).slice(0, TOTAL);
}

function scramble(word) {
  let result = word;

  for (let tries = 0; tries < 10 && result === word; tries++) {
    result = word
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }

  return result;
}

function WordGame({ onWin, onClose }) {
  const [words, setWords] = useState(pickWords);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [scrambled, setScrambled] = useState(() => scramble(words[0].word));
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [done, setDone] = useState(false);

  const current = words[index];

  const goNext = () => {
    if (index + 1 === TOTAL) {
      setDone(true);
      playWin();
    } else {
      setIndex(index + 1);
      setScrambled(scramble(words[index + 1].word));
      setAnswer("");
      setResult(null);
    }
  };

  const finishRound = (correct) => {
    setResult(correct ? "right" : "wrong");

    if (correct) {
      setScore((s) => s + 1);
      playMatch();
    } else {
      playWrong();
    }

    setTimeout(goNext, 1300);
  };

  const handleCheck = () => {
    if (result !== null || answer.trim() === "") return;

    finishRound(answer.trim().toUpperCase() === current.word);
  };

  const handleSkip = () => {
    if (result !== null) return;

    finishRound(false);
  };

  const handleAgain = () => {
    const fresh = pickWords();

    setWords(fresh);
    setIndex(0);
    setScore(0);
    setScrambled(scramble(fresh[0].word));
    setAnswer("");
    setResult(null);
    setDone(false);
  };

  return (
    <div className="game-overlay">
      <div className="game-popup">
        <div className="game-title">🔤 WORD SCRAMBLE</div>

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
              Word {index + 1} / {TOTAL} · Score {score}
            </div>

            <div className="word-tiles">
              {scrambled.split("").map((letter, i) => (
                <span key={i} className="word-tile">
                  {letter}
                </span>
              ))}
            </div>

            <div className="word-clue">💡 {current.clue}</div>

            <input
              className={`word-input ${result || ""}`}
              type="text"
              value={answer}
              placeholder="Type the word"
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCheck();
              }}
              disabled={result !== null}
            />

            <div className="word-answer">
              {result === "wrong" ? `Answer: ${current.word}` : "\u00A0"}
            </div>

            <div className="game-actions">
              <button className="reset-button" onClick={handleCheck}>
                ✅ Check
              </button>
              <button className="reset-button" onClick={handleSkip}>
                Skip
              </button>
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

export default WordGame;