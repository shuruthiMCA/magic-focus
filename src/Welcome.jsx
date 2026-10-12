import { useState } from "react";
import { GOALS } from "./data";
import { playClick, playCollect } from "./sound";

const TIPS = [
  ["⏱️", "Focus", "Pick a subject and start a spell. Finish it to earn XP, crystals and a mystery gift."],
  ["🧩", "Games", "Train your mind during breaks with 4 brain games."],
  ["📚", "Cards", "Add your own questions and answers, then revise them."],
  ["🎁", "Rewards", "Spend crystals, collect badges and see your study time."],
];

function Welcome({ onFinish }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goalId, setGoalId] = useState("");

  const next = () => {
    playClick();
    setStep(step + 1);
  };

  const finish = () => {
    playCollect();
    onFinish(name.trim(), goalId);
  };

  return (
    <div className="gift-overlay">
      <div className="welcome-popup">
        <button className="welcome-skip" onClick={() => onFinish("", "")}>
          Skip
        </button>

        {step === 0 && (
          <>
            <div className="welcome-icon">✨</div>
            <div className="welcome-title">Welcome to Magic Focus</div>
            <p className="welcome-text">
              Focus better, study smarter and train your mind — with rewards
              for every spell you finish.
            </p>

            <input
              className="flash-input welcome-input"
              type="text"
              maxLength="20"
              placeholder="What should we call you? (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") next();
              }}
            />

            <button className="flash-add" onClick={next}>
              Next →
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div className="welcome-title">What brings you here?</div>
            <p className="welcome-text">
              We will set your timer to match. You can change it any time.
            </p>

            <div className="goal-buttons">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  className={`goal-button ${goalId === g.id ? "active" : ""}`}
                  onClick={() => {
                    playClick();
                    setGoalId(g.id);
                  }}
                >
                  <span className="goal-icon">{g.icon}</span>
                  <span className="goal-name">{g.name}</span>
                  <span className="goal-time">
                    {g.h ? `${g.h}h ` : ""}
                    {g.m ? `${g.m} min` : ""}
                  </span>
                </button>
              ))}
            </div>

            <button className="flash-add welcome-next" onClick={next}>
              Next →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="welcome-title">How it works</div>

            <div className="welcome-tips">
              {TIPS.map(([icon, title, text]) => (
                <div className="welcome-tip" key={title}>
                  <span className="welcome-tip-icon">{icon}</span>

                  <div>
                    <div className="welcome-tip-title">{title}</div>
                    <div className="welcome-tip-text">{text}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="flash-add" onClick={finish}>
              ✨ Start my first spell
            </button>
          </>
        )}

        <div className="welcome-dots">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`welcome-dot ${step === i ? "on" : ""}`}></span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Welcome;