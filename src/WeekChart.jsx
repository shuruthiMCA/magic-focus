import { useEffect, useState } from "react";
import { dayKey } from "./data";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const GOAL_KEY = "magicFocusDailyGoal";

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return h === 0 ? `${m}m` : `${h}h ${m}m`;
}

function lastSevenDays() {
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    days.push({
      key: dayKey(d),
      label: DAY_NAMES[d.getDay()],
      isToday: i === 0,
    });
  }

  return days;
}

function loadGoal() {
  const saved = Number(localStorage.getItem(GOAL_KEY));

  return saved >= 15 && saved <= 480 ? saved : 60;
}

function WeekChart({ daily }) {
  const [days] = useState(lastSevenDays);
  const [goal, setGoal] = useState(loadGoal);

  useEffect(() => {
    localStorage.setItem(GOAL_KEY, String(goal));
  }, [goal]);

  const changeGoal = (delta) => {
    setGoal(Math.min(480, Math.max(15, goal + delta)));
  };

  const rows = days.map((day) => ({ ...day, minutes: daily[day.key] || 0 }));

  const total = rows.reduce((sum, row) => sum + row.minutes, 0);
  const max = Math.max(...rows.map((row) => row.minutes), goal);
  const average = Math.round(total / 7);
  const best = rows.reduce((a, b) => (b.minutes > a.minutes ? b : a), rows[0]);
  const goalDays = rows.filter((row) => row.minutes >= goal).length;

  const today = rows[rows.length - 1];
  const todayPercent = Math.min(100, Math.round((today.minutes / goal) * 100));
  const reached = today.minutes >= goal;

  return (
    <div className="week">
      {/* DAILY GOAL */}
      <div className="dg-card">
        <div className="dg-row">
          <span className="dg-title">🎯 Daily goal</span>

          <div className="dg-stepper">
            <button className="dg-step" onClick={() => changeGoal(-15)} title="Less">
              −
            </button>

            <span className="dg-value">{formatMinutes(goal)}</span>

            <button className="dg-step" onClick={() => changeGoal(15)} title="More">
              +
            </button>
          </div>
        </div>

        <div className="dg-bar">
          <div
            className={`dg-fill ${reached ? "done" : ""}`}
            style={{ width: `${todayPercent}%` }}
          ></div>
        </div>

        <div className={`dg-text ${reached ? "done" : ""}`}>
          {reached
            ? "🎯 Goal reached today! Great work."
            : `Today: ${formatMinutes(today.minutes)} — ${formatMinutes(
                goal - today.minutes
              )} to go`}
        </div>
      </div>

      {/* SUMMARY */}
      <div className="week-summary">
        <div className="week-stat">
          <div className="week-stat-value">{formatMinutes(total)}</div>
          <div className="week-stat-name">this week</div>
        </div>

        <div className="week-stat">
          <div className="week-stat-value">{formatMinutes(average)}</div>
          <div className="week-stat-name">daily average</div>
        </div>

        <div className="week-stat">
          <div className="week-stat-value">{goalDays} / 7</div>
          <div className="week-stat-name">goal days</div>
        </div>

        <div className="week-stat">
          <div className="week-stat-value">
            {total > 0 ? (best.isToday ? "Today" : best.label) : "—"}
          </div>
          <div className="week-stat-name">best day</div>
        </div>
      </div>

      {/* BARS */}
      <div className="week-bars">
        {rows.map((row) => (
          <div className="week-col" key={row.key}>
            <div className="week-value">
              {row.minutes > 0 ? formatMinutes(row.minutes) : ""}
            </div>

            <div className="week-track">
              <div
                className="week-goal-line"
                style={{ bottom: `${(goal / max) * 100}%` }}
              ></div>

              <div
                className={`week-fill ${row.isToday ? "today" : ""}`}
                style={{
                  height: `${(row.minutes / max) * 100}%`,
                  minHeight: row.minutes > 0 ? 6 : 0,
                }}
              ></div>
            </div>

            <div className={`week-label ${row.isToday ? "today" : ""}`}>
              {row.isToday ? "Today" : row.label}
              {row.minutes >= goal ? " ✓" : ""}
            </div>
          </div>
        ))}
      </div>

      {total === 0 && (
        <div className="week-empty">
          Finish a focus spell and your week will appear here.
        </div>
      )}
    </div>
  );
}

export default WeekChart;