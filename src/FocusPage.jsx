import { useState } from "react";
import { GOALS, SUBJECTS, clampChange } from "./data";
import { playClick } from "./sound";

const RADIUS = 110;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function FocusPage({
  goal,
  isRunning,
  onSelectGoal,
  subject,
  onSelectSubject,
  customHours,
  customMinutes,
  customSeconds,
  setCustomHours,
  setCustomMinutes,
  setCustomSeconds,
  onSetTime,
  formattedTime,
  boost,
  onStartPause,
  onOpenMini,
  miniOpen,
  ambient,
  setAmbient,
  streak,
  xp,
  crystals,
}) {
  const [showCustom, setShowCustom] = useState(false);

  // Time left (seconds), read from the HH:MM:SS text
  const [h, m, s] = formattedTime.split(":").map(Number);
  const timeLeft = h * 3600 + m * 60 + s;

  const totalSeconds =
    Number(customHours) * 3600 +
    Number(customMinutes) * 60 +
    Number(customSeconds);

  const progress = totalSeconds > 0 ? Math.min(1, timeLeft / totalSeconds) : 1;

  const subjectInfo = SUBJECTS.find((item) => item.id === subject);

  return (
    <div className="page">
      {/* TIMER RING */}
      <div className="ring-wrap">
        <svg className="ring" viewBox="0 0 260 260">
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0d4ff" />
              <stop offset="100%" stopColor="#9550c5" />
            </linearGradient>
          </defs>

          <circle className="ring-track" cx="130" cy="130" r={RADIUS} />

          <circle
            className="ring-progress"
            cx="130"
            cy="130"
            r={RADIUS}
            stroke="url(#ringGradient)"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            transform="rotate(-90 130 130)"
          />
        </svg>

        <div className="ring-center">
          <div className="ring-label">
            {isRunning ? "FOCUSING" : "FOCUS SPELL"}
          </div>

          <div className="timer">{formattedTime}</div>

          <div className="ring-subject">
            {subjectInfo ? `${subjectInfo.icon} ${subjectInfo.name}` : "\u00A0"}
          </div>
        </div>
      </div>

      {boost && (
        <div className="boost-badge">🧪 Double XP is active for this spell!</div>
      )}

      <button
        className={`magic-button ${isRunning ? "running" : ""}`}
        onClick={onStartPause}
      >
        {isRunning ? "⏸ Pause Spell" : "✨ Start Focus"}
      </button>

      <button className="mini-open" onClick={onOpenMini}>
        🪟 {miniOpen ? "Mini timer is open" : "Open mini timer"}
      </button>

      {/* STATS CHIPS */}
      <div className="chip-row">
        <div className="chip">🔥 {streak} <span>day streak</span></div>
        <div className="chip">⭐ {xp} <span>XP</span></div>
        <div className="chip">💎 {crystals} <span>crystals</span></div>
      </div>

      {/* SETUP - hidden while a spell is running so nothing distracts you */}
      {!isRunning && (
        <>
          <div className="goal-section">
            <div className="goal-title">✦ CHOOSE YOUR GOAL ✦</div>

            <div className="goal-buttons">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  className={`goal-button ${goal === g.id ? "active" : ""}`}
                  onClick={() => onSelectGoal(g)}
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
          </div>

          <div className="subject-section">
            <div className="goal-title">✦ WHAT ARE YOU STUDYING? ✦</div>

            <div className="subject-row">
              {SUBJECTS.map((item) => (
                <button
                  key={item.id}
                  className={`subject-chip ${subject === item.id ? "active" : ""}`}
                  onClick={() => onSelectSubject(item.id)}
                >
                  {item.icon} {item.name}
                </button>
              ))}
            </div>
          </div>

          <button
            className="custom-toggle"
            onClick={() => {
              playClick();
              setShowCustom(!showCustom);
            }}
          >
            ⚙ {showCustom ? "Hide custom time" : "Custom time"}
          </button>

          {showCustom && (
            <div className="custom-time">
              <div className="custom-time-controls">
                <div className="time-field">
                  <input
                    type="number"
                    min="0"
                    max="12"
                    value={customHours}
                    onChange={clampChange(setCustomHours, 12)}
                  />
                  <span>Hours</span>
                </div>

                <div className="time-colon">:</div>

                <div className="time-field">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={customMinutes}
                    onChange={clampChange(setCustomMinutes, 59)}
                  />
                  <span>Minutes</span>
                </div>

                <div className="time-colon">:</div>

                <div className="time-field">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={customSeconds}
                    onChange={clampChange(setCustomSeconds, 59)}
                  />
                  <span>Seconds</span>
                </div>
              </div>

              <button className="set-time-button" onClick={onSetTime}>
                ✨ Set Magical Time
              </button>
            </div>
          )}
        </>
      )}

      {/* RELAXING SOUNDS */}
      <div className="ambient-row">
        {[
          ["off", "🔕 Silent"],
          ["ocean", "🌊 Ocean"],
          ["calm", "🎵 Calm"],
          ["zen", "🔔 Zen"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={`ambient-button ${ambient === id ? "active" : ""}`}
            onClick={() => {
              playClick();
              setAmbient(id);
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default FocusPage;