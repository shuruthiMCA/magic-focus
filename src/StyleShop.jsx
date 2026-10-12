import { AVATARS, DEFAULT_OWNED, THEMES } from "./data";

function StyleShop({ extra, onBuy, onSelect }) {
  const owned = extra.owned || DEFAULT_OWNED;
  const currentTheme = extra.theme || "galaxy";
  const currentAvatar = extra.avatar || "sparkle";

  const renderButton = (kind, item, current) => {
    if (current === item.id) {
      return <span className="style-inuse">✓ In use</span>;
    }

    if (owned.includes(item.id)) {
      return (
        <button className="item-button" onClick={() => onSelect(kind, item.id)}>
          Use
        </button>
      );
    }

    return (
      <button className="item-button" onClick={() => onBuy(kind, item)}>
        {item.price} 💎
      </button>
    );
  };

  return (
    <>
      <div className="style-heading">Themes</div>

      <div className="style-grid">
        {THEMES.map((theme) => (
          <div
            className={`style-card ${currentTheme === theme.id ? "active" : ""}`}
            key={theme.id}
          >
            <div
              className="style-swatch"
              style={{
                background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]}, ${theme.colors[2]})`,
              }}
            ></div>

            <div className="style-name">
              {theme.icon} {theme.name}
            </div>

            {renderButton("theme", theme, currentTheme)}
          </div>
        ))}
      </div>

      <div className="style-heading">Avatars</div>

      <div className="style-grid">
        {AVATARS.map((avatar) => (
          <div
            className={`style-card ${currentAvatar === avatar.id ? "active" : ""}`}
            key={avatar.id}
          >
            <div className="style-avatar">{avatar.icon}</div>

            <div className="style-name">{avatar.name}</div>

            {renderButton("avatar", avatar, currentAvatar)}
          </div>
        ))}
      </div>
    </>
  );
}

export default StyleShop;