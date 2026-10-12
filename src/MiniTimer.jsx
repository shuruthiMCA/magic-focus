import { createPortal } from "react-dom";

function MiniTimer({
  win,
  formattedTime,
  isRunning,
  progress,
  subjectLabel,
  onToggle,
  onClose,
}) {
  return createPortal(
    <div className="mini">
      <div className="mini-label">{isRunning ? "FOCUSING" : "FOCUS SPELL"}</div>

      <div className="mini-time">{formattedTime}</div>

      <div className="mini-subject">{subjectLabel || "\u00A0"}</div>

      <div className="mini-bar">
        <div
          className="mini-bar-fill"
          style={{ width: `${Math.round(progress * 100)}%` }}
        ></div>
      </div>

      <div className="mini-actions">
        <button className="mini-button" onClick={onToggle}>
          {isRunning ? "⏸ Pause" : "▶ Start"}
        </button>

        <button className="mini-button ghost" onClick={onClose}>
          ✕ Close
        </button>
      </div>
    </div>,
    win.document.body
  );
}

export default MiniTimer;