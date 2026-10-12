import { useEffect, useRef, useState } from "react";
import "./App.css";
import MemoryGame from "./MemoryGame";
import MathGame from "./MathGame";
import WordGame from "./WordGame";
import LogicGame from "./LogicGame";
import BreakBanner from "./BreakBanner";
import FocusPage from "./FocusPage";
import GamesPage from "./GamesPage";
import RewardsPage from "./RewardsPage";
import CardsPage from "./CardsPage";
import Welcome from "./Welcome";
import MiniTimer from "./MiniTimer";
import {
  AVATARS,
  DEFAULT_EXTRA,
  DEFAULT_OWNED,
  GIFTS,
  GOALS,
  ITEMS,
  dayKey,
  daysBetween,
  SUBJECTS,
  readNumber,
} from "./data";
import {
  playClick,
  playCollect,
  playComplete,
  setSoundEnabled,
  startAmbient,
  stopAmbient,
} from "./sound";
import { askNotificationPermission, notify } from "./notify";

// Break length (minutes) for each goal
const BREAK_MINUTES = { employee: 5, student: 10, exam: 15 };

function App() {
  // =========================
  // PAGES
  // =========================

  const [page, setPage] = useState("focus");
  const [activeGame, setActiveGame] = useState(null);
  const [ambient, setAmbient] = useState("off");

  // =========================
  // GOAL + CUSTOM TIME
  // =========================

  const [goal, setGoal] = useState(
    () => localStorage.getItem("magicFocusGoal") || ""
  );

  const [customHours, setCustomHours] = useState(() =>
    Math.min(12, Math.max(0, readNumber("magicFocusHours", 0)))
  );

  const [customMinutes, setCustomMinutes] = useState(() =>
    Math.min(59, Math.max(0, readNumber("magicFocusMinutes", 25)))
  );

  const [customSeconds, setCustomSeconds] = useState(() =>
    Math.min(59, Math.max(0, readNumber("magicFocusSeconds", 0)))
  );

  // =========================
  // TIMER
  // =========================

  const [time, setTime] = useState(() => readNumber("magicFocusTime", 25 * 60));

  const [isRunning, setIsRunning] = useState(false);

  // =========================
  // XP / CRYSTALS / STREAK
  // =========================

  const [xp, setXp] = useState(() => readNumber("magicFocusXP", 0));

  const [crystals, setCrystals] = useState(() =>
    readNumber("magicFocusCrystals", 0)
  );

  const [streak, setStreak] = useState(() =>
    readNumber("magicFocusStreak", 0)
  );

  // =========================
  // EXTRA (inventory, stats, sound)
  // =========================

  const [extra, setExtra] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("magicFocusExtra"));

      if (saved) {
        return {
          ...DEFAULT_EXTRA,
          ...saved,
          inventory: { ...DEFAULT_EXTRA.inventory, ...(saved.inventory || {}) },
        };
      }
    } catch {
      /* ignore broken saved data */
    }

    return DEFAULT_EXTRA;
  });

  const [gift, setGift] = useState(null);
  const [breakInfo, setBreakInfo] = useState(null);
  const [miniWin, setMiniWin] = useState(null);
  const endAtRef = useRef(0);

  // Welcome screen: only for brand new users
  const [showWelcome, setShowWelcome] = useState(
    () =>
      localStorage.getItem("magicFocusWelcomed") !== "yes" &&
      readNumber("magicFocusXP", 0) === 0
  );

  // =========================
  // LEVEL
  // =========================

  const level = Math.floor(xp / 100) + 1;
  const currentLevelXP = xp % 100;

  const levelNames = [
    "Magic Beginner",
    "Magic Apprentice",
    "Spell Caster",
    "Mystic Mage",
    "Enchanted Wizard",
    "Master of Magic",
  ];

  const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)];

  // =========================
  // SAVE DATA
  // =========================

  useEffect(() => {
    localStorage.setItem("magicFocusTime", String(time));
    localStorage.setItem("magicFocusHours", String(customHours));
    localStorage.setItem("magicFocusMinutes", String(customMinutes));
    localStorage.setItem("magicFocusSeconds", String(customSeconds));
    localStorage.setItem("magicFocusXP", String(xp));
    localStorage.setItem("magicFocusCrystals", String(crystals));
    localStorage.setItem("magicFocusStreak", String(streak));
  }, [time, customHours, customMinutes, customSeconds, xp, crystals, streak]);

  useEffect(() => {
    localStorage.setItem("magicFocusExtra", JSON.stringify(extra));
  }, [extra]);

  // =========================
  // SOUND SETTINGS
  // =========================

  useEffect(() => {
    setSoundEnabled(extra.soundOn);
  }, [extra.soundOn]);

  useEffect(() => {
    if (ambient !== "off" && extra.soundOn) {
      startAmbient(ambient);
    } else {
      stopAmbient();
    }

    return () => stopAmbient();
  }, [ambient, extra.soundOn]);

  // =========================
  // MINI TIMER WINDOW
  // =========================

  useEffect(() => {
    if (!miniWin) return;

    const check = setInterval(() => {
      if (miniWin.closed) setMiniWin(null);
    }, 1000);

    const closeWithMain = () => miniWin.close();
    window.addEventListener("beforeunload", closeWithMain);

    return () => {
      clearInterval(check);
      window.removeEventListener("beforeunload", closeWithMain);
    };
  }, [miniWin]);

  // =========================
  // TIMER LOGIC
  // =========================

  useEffect(() => {
    if (!isRunning) return;

    const timer = setTimeout(() => {
      // Use the real clock so the timer stays accurate even when the
      // window is minimized and the browser slows timers down
      const remaining = Math.round((endAtRef.current - Date.now()) / 1000);
      const next = Math.min(time - 1, remaining);

      // Still counting down
      if (next > 0) {
        setTime(next);
        return;
      }

      // Spell finished
      setIsRunning(false);
      playComplete();

      const selectedTotalSeconds =
        Number(customHours) * 3600 +
        Number(customMinutes) * 60 +
        Number(customSeconds);

      // XP + crystals (double XP if potion is active)
      setXp((previous) => previous + (extra.boost ? 100 : 50));
      setCrystals((previous) => previous + 10);

      // Daily streak
      const today = dayKey();
      const inventory = { ...extra.inventory };
      let newStreak = streak;

      if (extra.lastDate !== today) {
        if (!extra.lastDate) {
          newStreak = 1;
        } else {
          const gap = daysBetween(extra.lastDate, today);

          if (gap === 1) {
            newStreak = streak + 1;
          } else if (gap === 2 && inventory.shield > 0) {
            inventory.shield -= 1;
            newStreak = streak + 1;
          } else {
            newStreak = 1;
          }
        }
      }

      setStreak(newStreak);

      const minutesDone = Math.round(selectedTotalSeconds / 60);

      // Minutes studied today (for the weekly chart)
      const daily = { ...(extra.daily || {}) };
      daily[today] = (daily[today] || 0) + minutesDone;
      Object.keys(daily).sort().slice(0, -60).forEach((key) => delete daily[key]);

      // Study time for the chosen subject
      const subjects = { ...(extra.subjects || {}) };

      if (extra.subject) {
        subjects[extra.subject] = (subjects[extra.subject] || 0) + minutesDone;
      }

      setExtra((previous) => ({
        ...previous,
        sessions: previous.sessions + 1,
        minutes: previous.minutes + minutesDone,
        lastDate: today,
        boost: false,
        inventory,
        subjects,
        daily,
      }));

      notify("✨ Focus spell complete!", "Great work! Come back and collect your gift.");

      // Mystery gift
      setGift(GIFTS[Math.floor(Math.random() * GIFTS.length)]);

      setTime(selectedTotalSeconds);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isRunning, time, customHours, customMinutes, customSeconds, extra, streak]);

  // =========================
  // DISPLAY TIME
  // =========================

  const formattedTime =
    `${String(Math.floor(time / 3600)).padStart(2, "0")}:` +
    `${String(Math.floor((time % 3600) / 60)).padStart(2, "0")}:` +
    `${String(time % 60).padStart(2, "0")}`;

  // =========================
  // HANDLERS
  // =========================

  const handleStartPause = () => {
    playClick();

    if (time <= 0) {
      alert("Please set a focus time first.");
      return;
    }

    if (isRunning) {
      // Pausing: save the exact time left
      setTime(Math.max(1, Math.ceil((endAtRef.current - Date.now()) / 1000)));
    } else {
      // Starting: remember when the spell will end
      endAtRef.current = Date.now() + time * 1000;
      askNotificationPermission();
      setBreakInfo(null);
    }

    setIsRunning((previous) => !previous);
  };

  const handleSetTime = () => {
    playClick();

    const totalSeconds =
      (Number(customHours) || 0) * 3600 +
      (Number(customMinutes) || 0) * 60 +
      (Number(customSeconds) || 0);

    if (totalSeconds <= 0) {
      alert("Please set a time greater than 00:00:00.");
      return;
    }

    if (totalSeconds > 12 * 60 * 60) {
      alert("Maximum focus time is 12 hours.");
      return;
    }

    setIsRunning(false);
    setTime(totalSeconds);
  };

  const handleSelectGoal = (g) => {
    if (isRunning) return;

    playClick();

    setGoal(g.id);
    setCustomHours(g.h);
    setCustomMinutes(g.m);
    setCustomSeconds(0);
    setTime(g.h * 3600 + g.m * 60);

    localStorage.setItem("magicFocusGoal", g.id);
  };

  const handleSelectSubject = (id) => {
    if (isRunning) return;

    playClick();

    setExtra((previous) => ({
      ...previous,
      subject: previous.subject === id ? "" : id,
    }));
  };

  const handleBuyStyle = (kind, item) => {
    if (crystals < item.price) {
      alert("Not enough crystals 💎 — finish focus spells to earn more!");
      return;
    }

    playCollect();
    setCrystals((previous) => previous - item.price);
    setExtra((previous) => ({
      ...previous,
      owned: [...(previous.owned || DEFAULT_OWNED), item.id],
      [kind]: item.id,
    }));
  };

  const handleSelectStyle = (kind, id) => {
    playClick();
    setExtra((previous) => ({ ...previous, [kind]: id }));
  };

  const handleOpenMini = () => {
    if (miniWin && !miniWin.closed) {
      miniWin.focus();
      return;
    }

    const w = window.open("", "mini-timer", "popup,width=300,height=210");

    if (!w) {
      alert("Please allow pop-ups to use the mini timer.");
      return;
    }

    w.document.title = "Magic Focus";

    // Copy the app styles into the small window
    document.querySelectorAll('link[rel="stylesheet"]').forEach((node) => {
      const link = w.document.createElement("link");
      link.rel = "stylesheet";
      link.href = node.href;
      w.document.head.appendChild(link);
    });

    document.querySelectorAll("style").forEach((node) => {
      const style = w.document.createElement("style");
      style.textContent = node.textContent;
      w.document.head.appendChild(style);
    });

    w.document.body.className = "mini-body";
    setMiniWin(w);
  };

  const handleCloseMini = () => {
    if (miniWin) miniWin.close();
    setMiniWin(null);
  };

  const handleWelcomeFinish = (name, goalId) => {
    playClick();
    localStorage.setItem("magicFocusWelcomed", "yes");
    setShowWelcome(false);

    if (name) {
      setExtra((previous) => ({ ...previous, name }));
    }

    const chosen = GOALS.find((g) => g.id === goalId);

    if (chosen) handleSelectGoal(chosen);
  };

  const addItem = (key) => {
    setExtra((previous) => ({
      ...previous,
      inventory: {
        ...previous.inventory,
        [key]: previous.inventory[key] + 1,
      },
    }));
  };

  const handleCollectGift = () => {
    if (!gift) return;

    playCollect();

    if (gift.type === "xp") setXp((previous) => previous + gift.amount);

    if (gift.type === "crystals") {
      setCrystals((previous) => previous + gift.amount);
    }

    if (gift.type === "item") addItem(gift.item);

    setGift(null);
    setBreakInfo({ id: Date.now(), minutes: BREAK_MINUTES[goal] || 5 });
  };

  const handlePlayRandomGame = () => {
    const ids = ["memory", "math", "word", "logic"];

    playClick();
    setActiveGame(ids[Math.floor(Math.random() * ids.length)]);
  };

  const handleStudyReward = (xpAmount, crystalAmount) => {
    playCollect();
    setXp((previous) => previous + xpAmount);
    setCrystals((previous) => previous + crystalAmount);
  };

  const handleUsePotion = () => {
    if (extra.inventory.doubleXp < 1 || extra.boost) return;

    playCollect();

    setExtra((previous) => ({
      ...previous,
      boost: true,
      inventory: {
        ...previous.inventory,
        doubleXp: previous.inventory.doubleXp - 1,
      },
    }));
  };

  const handleBuy = (key) => {
    const price = ITEMS[key].price;

    if (crystals < price) {
      alert("Not enough crystals 💎 — finish focus spells to earn more!");
      return;
    }

    playCollect();
    setCrystals((previous) => previous - price);
    addItem(key);
  };

  const handleUseHint = () => {
    setExtra((previous) => ({
      ...previous,
      inventory: {
        ...previous.inventory,
        hint: Math.max(0, previous.inventory.hint - 1),
      },
    }));
  };

  const handleGameWin = (xpAmount, crystalAmount) => {
    playCollect();
    setXp((previous) => previous + xpAmount);
    setCrystals((previous) => previous + crystalAmount);
    setExtra((previous) => ({ ...previous, gamesWon: previous.gamesWon + 1 }));
    setActiveGame(null);
  };

  const handleReset = () => {
    if (!window.confirm("Are you sure you want to reset all your magical progress?")) {
      return;
    }

    [
      "magicFocusTime",
      "magicFocusHours",
      "magicFocusMinutes",
      "magicFocusSeconds",
      "magicFocusXP",
      "magicFocusCrystals",
      "magicFocusStreak",
      "magicFocusGoal",
    ].forEach((key) => localStorage.removeItem(key));

    setTime(25 * 60);
    setCustomHours(0);
    setCustomMinutes(25);
    setCustomSeconds(0);
    setXp(0);
    setCrystals(0);
    setStreak(0);
    setGoal("");
    setIsRunning(false);
    setGift(null);
    setBreakInfo(null);
    setAmbient("off");
    setExtra({ ...DEFAULT_EXTRA, soundOn: extra.soundOn });
  };

  const goToPage = (id) => {
    playClick();
    setPage(id);
  };

  // =========================
  // STYLE + MINI TIMER VALUES
  // =========================

  const avatarIcon = (
    AVATARS.find((item) => item.id === (extra.avatar || "sparkle")) || AVATARS[0]
  ).icon;

  const customTotal =
    Number(customHours) * 3600 +
    Number(customMinutes) * 60 +
    Number(customSeconds);

  const miniProgress = customTotal > 0 ? Math.min(1, time / customTotal) : 1;

  const subjectInfo = SUBJECTS.find((item) => item.id === extra.subject);

  // =========================
  // UI
  // =========================

  return (
    <div className="magic-app" data-theme={extra.theme || "galaxy"}>
      <div className="stars"></div>
      <div className="moon"></div>

      <div className="glow glow-one"></div>
      <div className="glow glow-two"></div>
      <div className="glow glow-three"></div>

      <div className="butterfly butterfly-one">🦋</div>
      <div className="butterfly butterfly-two">🦋</div>
      <div className="butterfly butterfly-three">🦋</div>
      <div className="butterfly butterfly-four">🦋</div>

      <main className="magic-card">
        <button
          className="sound-toggle"
          onClick={() =>
            setExtra((previous) => ({ ...previous, soundOn: !previous.soundOn }))
          }
          title="Sound on / off"
        >
          {extra.soundOn ? "🔊" : "🔇"}
        </button>

        <div className="magic-symbol">{avatarIcon}</div>

        <h1>Magic Focus</h1>

        <p className="subtitle">
          {extra.name
            ? `Hello, ${extra.name}! Let's focus.`
            : "Focus. Study. Train your mind."}
        </p>

        {/* LEVEL */}
        <div className="level-card">
          <div className="level-top">
            <span>Level {level}</span>
            <span>{levelName}</span>
          </div>

          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${currentLevelXP}%` }}></div>
          </div>

          <div className="xp-text">{currentLevelXP} / 100 XP</div>
        </div>

        {/* NAVIGATION */}
        <nav className="nav-tabs">
          {[
            ["focus", "⏱️", "Focus"],
            ["games", "🧩", "Games"],
            ["cards", "📚", "Cards"],
            ["rewards", "🎁", "Rewards"],
          ].map(([id, icon, label]) => (
            <button
              key={id}
              className={`nav-tab ${page === id ? "active" : ""}`}
              onClick={() => goToPage(id)}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </nav>

        {/* BREAK TIME */}
        {breakInfo && (
          <BreakBanner
            key={breakInfo.id}
            minutes={breakInfo.minutes}
            onPlay={handlePlayRandomGame}
            onDone={() => setBreakInfo(null)}
          />
        )}

        {page === "focus" && (
          <FocusPage
            goal={goal}
            isRunning={isRunning}
            onSelectGoal={handleSelectGoal}
            subject={extra.subject || ""}
            onSelectSubject={handleSelectSubject}
            customHours={customHours}
            customMinutes={customMinutes}
            customSeconds={customSeconds}
            setCustomHours={setCustomHours}
            setCustomMinutes={setCustomMinutes}
            setCustomSeconds={setCustomSeconds}
            onSetTime={handleSetTime}
            formattedTime={formattedTime}
            boost={extra.boost}
            onStartPause={handleStartPause}
            onOpenMini={handleOpenMini}
            miniOpen={Boolean(miniWin)}
            ambient={ambient}
            setAmbient={setAmbient}
            streak={streak}
            xp={xp}
            crystals={crystals}
          />
        )}

        {page === "games" && (
          <GamesPage isRunning={isRunning} onOpenGame={setActiveGame} />
        )}

        {page === "cards" && <CardsPage onReward={handleStudyReward} />}

        {page === "rewards" && (
          <RewardsPage
            extra={extra}
            streak={streak}
            crystals={crystals}
            level={level}
            onUsePotion={handleUsePotion}
            onBuy={handleBuy}
            onBuyStyle={handleBuyStyle}
            onSelectStyle={handleSelectStyle}
            onReset={handleReset}
          />
        )}
      </main>

      {/* BRAIN GAMES */}
      {activeGame === "memory" && (
        <MemoryGame
          hints={extra.inventory.hint}
          onUseHint={handleUseHint}
          onWin={handleGameWin}
          onClose={() => setActiveGame(null)}
        />
      )}

      {activeGame === "math" && (
        <MathGame onWin={handleGameWin} onClose={() => setActiveGame(null)} />
      )}

      {activeGame === "word" && (
        <WordGame onWin={handleGameWin} onClose={() => setActiveGame(null)} />
      )}

      {activeGame === "logic" && (
        <LogicGame onWin={handleGameWin} onClose={() => setActiveGame(null)} />
      )}

      {miniWin && (
        <MiniTimer
          win={miniWin}
          formattedTime={formattedTime}
          isRunning={isRunning}
          progress={miniProgress}
          subjectLabel={subjectInfo ? `${subjectInfo.icon} ${subjectInfo.name}` : ""}
          onToggle={handleStartPause}
          onClose={handleCloseMini}
        />
      )}

      {showWelcome && <Welcome onFinish={handleWelcomeFinish} />}

      {/* MYSTERY GIFT */}
      {gift && (
        <div className="gift-overlay">
          <div className="gift-popup">
            <div className="gift-sparkles">✨ ✦ ✨</div>
            <div className="gift-title">MYSTERY GIFT</div>
            <div className="gift-icon">{gift.icon}</div>
            <div className="gift-name">{gift.name}</div>
            <div className="gift-reward">{gift.reward}</div>

            <button className="collect-button" onClick={handleCollectGift}>
              ✨ COLLECT ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;