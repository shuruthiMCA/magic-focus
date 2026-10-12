import { APP_VERSION, FEEDBACK_EMAIL, ITEMS } from "./data";
import SubjectStats from "./SubjectStats";
import StyleShop from "./StyleShop";
import WeekChart from "./WeekChart";

function RewardsPage({
  extra,
  streak,
  crystals,
  level,
  onUsePotion,
  onBuy,
  onBuyStyle,
  onSelectStyle,
  onReset,
}) {
  const handleFeedback = () => {
    const subject = encodeURIComponent(`Magic Focus feedback (v${APP_VERSION})`);
    const body = encodeURIComponent(
      "Hi! Here is my feedback about Magic Focus:\n\nWhat I like:\n\nWhat can be better:\n\nA feature I would love:\n"
    );

    window.open(`mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`, "_blank");
  };

  const achievements = [
    { icon: "🌟", name: "First Spell", desc: "Finish 1 focus spell", done: extra.sessions >= 1 },
    { icon: "🔥", name: "3-Day Streak", desc: "Reach a 3 day streak", done: streak >= 3 },
    { icon: "🏰", name: "Dedicated", desc: "Finish 10 focus spells", done: extra.sessions >= 10 },
    { icon: "🧠", name: "Puzzle Master", desc: "Win 5 brain games", done: extra.gamesWon >= 5 },
    { icon: "💎", name: "Collector", desc: "Own 100 crystals", done: crystals >= 100 },
    { icon: "👑", name: "Level 5", desc: "Reach level 5", done: level >= 5 },
  ];

  const focusHours = Math.floor(extra.minutes / 60);
  const focusMins = extra.minutes % 60;

  return (
    <div className="page">
      <div className="page-title">✦ TREASURE BAG ✦</div>

      <div className="item-list">
        {Object.keys(ITEMS).map((key) => (
          <div className="item-row" key={key}>
            <span className="item-icon">{ITEMS[key].icon}</span>

            <div className="item-info">
              <div className="item-name">
                {ITEMS[key].name} × {extra.inventory[key]}
              </div>
              <div className="item-desc">{ITEMS[key].desc}</div>
            </div>

            {key === "doubleXp" ? (
              <button
                className="item-button"
                onClick={onUsePotion}
                disabled={extra.inventory.doubleXp < 1 || extra.boost}
              >
                {extra.boost ? "Active" : "Use"}
              </button>
            ) : (
              <span className="item-auto">
                {key === "hint" ? "In game" : "Auto"}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="page-title">✦ MAGIC SHOP ✦</div>

      <div className="item-list">
        {Object.keys(ITEMS).map((key) => (
          <div className="item-row" key={key}>
            <span className="item-icon">{ITEMS[key].icon}</span>

            <div className="item-info">
              <div className="item-name">{ITEMS[key].name}</div>
            </div>

            <button className="item-button" onClick={() => onBuy(key)}>
              {ITEMS[key].price} 💎
            </button>
          </div>
        ))}
      </div>

      <div className="page-title">✦ STYLE SHOP ✦</div>

      <StyleShop extra={extra} onBuy={onBuyStyle} onSelect={onSelectStyle} />

      <div className="page-title">✦ ACHIEVEMENTS ✦</div>

      <div className="badge-grid">
        {achievements.map((a) => (
          <div
            key={a.name}
            className={`badge ${a.done ? "done" : ""}`}
            title={a.desc}
          >
            <div className="badge-icon">{a.done ? a.icon : "🔒"}</div>
            <div className="badge-name">{a.name}</div>
            <div className="badge-desc">{a.desc}</div>
          </div>
        ))}
      </div>

      <div className="page-title">✦ THIS WEEK ✦</div>

      <WeekChart daily={extra.daily || {}} />

      <div className="page-title">✦ STUDY TIME BY SUBJECT ✦</div>

      <SubjectStats subjects={extra.subjects || {}} />

      <div className="page-title">✦ YOUR PROGRESS ✦</div>

      <div className="progress-grid">
        <div className="progress-card">
          <div className="progress-value">{extra.sessions}</div>
          <div className="progress-name">Spells done</div>
        </div>

        <div className="progress-card">
          <div className="progress-value">
            {focusHours}h {focusMins}m
          </div>
          <div className="progress-name">Focus time</div>
        </div>

        <div className="progress-card">
          <div className="progress-value">{extra.gamesWon}</div>
          <div className="progress-name">Games won</div>
        </div>
      </div>

      <div className="rewards-footer">
        <button className="reset-button" onClick={handleFeedback}>
          💌 Send feedback
        </button>

        <button className="reset-button" onClick={onReset}>
          ♻ Reset Progress
        </button>
      </div>
    </div>
  );
}

export default RewardsPage;