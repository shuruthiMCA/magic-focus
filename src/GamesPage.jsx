import { playClick } from "./sound";

function GamesPage({ isRunning, onOpenGame }) {
  const open = (id) => {
    playClick();
    onOpenGame(id);
  };

  return (
    <div className="page">
      <div className="page-title">✦ BRAIN GAMES ✦</div>
      <p className="page-sub">Train your mind during your breaks</p>

      {isRunning && (
        <div className="notice">
          ⏳ Your focus spell is running. Pause it to play.
        </div>
      )}

      <div className="game-list">
        <button
          className="game-tile"
          disabled={isRunning}
          onClick={() => open("memory")}
        >
          <span className="tile-icon">🧩</span>
          <span className="tile-name">Memory Match</span>
          <span className="tile-desc">Trains your memory</span>
          <span className="tile-reward">+20 XP · +5 💎</span>
        </button>

        <button
          className="game-tile"
          disabled={isRunning}
          onClick={() => open("math")}
        >
          <span className="tile-icon">➕</span>
          <span className="tile-name">Quick Math</span>
          <span className="tile-desc">Speed &amp; aptitude</span>
          <span className="tile-reward">up to +20 XP · +5 💎</span>
        </button>

        <button
          className="game-tile"
          disabled={isRunning}
          onClick={() => open("word")}
        >
          <span className="tile-icon">🔤</span>
          <span className="tile-name">Word Scramble</span>
          <span className="tile-desc">Study vocabulary</span>
          <span className="tile-reward">up to +20 XP · +5 💎</span>
        </button>

        <button
          className="game-tile"
          disabled={isRunning}
          onClick={() => open("logic")}
        >
          <span className="tile-icon">🧠</span>
          <span className="tile-name">Logic Patterns</span>
          <span className="tile-desc">Number reasoning</span>
          <span className="tile-reward">up to +20 XP · +5 💎</span>
        </button>
      </div>
    </div>
  );
}

export default GamesPage;