import { useEffect, useState } from "react";
import { notify } from "./notify";
import { playComplete } from "./sound";

function BreakBanner({ minutes, onPlay, onDone }) {
  const [left, setLeft] = useState(minutes * 60);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (left > 1) {
        setLeft(left - 1);
      } else {
        playComplete();
        notify("☕ Break is over", "Ready for your next focus spell?");
        onDone();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [left, onDone]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="break-banner">
      <div className="break-info">
        <span className="break-icon">☕</span>

        <div className="break-text">
          <div className="break-title">Break time</div>
          <div className="break-sub">Rest your eyes, or train your mind</div>
        </div>

        <div className="break-time">
          {mm}:{ss}
        </div>
      </div>

      <div className="break-actions">
        <button className="break-button" onClick={onPlay}>
          🧩 Play a brain game
        </button>

        <button className="break-button ghost" onClick={onDone}>
          Skip break
        </button>
      </div>
    </div>
  );
}

export default BreakBanner;