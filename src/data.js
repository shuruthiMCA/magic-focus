// Magic Focus - shared data and helper functions

export const GOALS = [
  { id: "employee", icon: "👨‍💼", name: "Employee", h: 0, m: 25 },
  { id: "student", icon: "🎓", name: "Student", h: 0, m: 50 },
  { id: "exam", icon: "📚", name: "Govt Exam", h: 1, m: 30 },
];

export const ITEMS = {
  doubleXp: {
    icon: "🧪",
    name: "Double XP Potion",
    desc: "Your next focus spell gives double XP",
    price: 30,
  },
  hint: {
    icon: "📜",
    name: "Hint Scroll",
    desc: "Shows a matching pair in Memory Match",
    price: 10,
  },
  shield: {
    icon: "🛡️",
    name: "Streak Shield",
    desc: "Saves your streak if you miss one day",
    price: 50,
  },
};

export const GIFTS = [
  { icon: "🧪", name: "Double XP Potion", reward: "Doubles XP of your next spell", type: "item", item: "doubleXp" },
  { icon: "📜", name: "Hint Scroll", reward: "Use it in Memory Match", type: "item", item: "hint" },
  { icon: "🛡️", name: "Streak Shield", reward: "Protects your streak for one missed day", type: "item", item: "shield" },
  { icon: "💎", name: "Crystal Treasure", reward: "+20 Crystals", type: "crystals", amount: 20 },
  { icon: "⭐", name: "Star Dust", reward: "+25 XP", type: "xp", amount: 25 },
];

export const DEFAULT_EXTRA = {
  sessions: 0,
  minutes: 0,
  gamesWon: 0,
  lastDate: "",
  boost: false,
  soundOn: true,
  inventory: { doubleXp: 0, hint: 0, shield: 0 },
};

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

export const daysBetween = (a, b) =>
  Math.round((new Date(b) - new Date(a)) / 86400000);

export function readNumber(key, fallback) {
  const saved = localStorage.getItem(key);

  return saved !== null ? Number(saved) || 0 : fallback;
}

export const clampChange = (setter, max) => (e) => {
  let value = Number(e.target.value);

  if (Number.isNaN(value)) value = 0;

  setter(Math.max(0, Math.min(max, value)));
};
export const SUBJECTS = [
  { id: "work", icon: "💼", name: "Work" },
  { id: "maths", icon: "➕", name: "Maths" },
  { id: "science", icon: "🔬", name: "Science" },
  { id: "english", icon: "📖", name: "English" },
  { id: "reasoning", icon: "🧠", name: "Reasoning" },
  { id: "gk", icon: "🌍", name: "GK" },
  { id: "coding", icon: "💻", name: "Coding" },
  { id: "other", icon: "✨", name: "Other" },
];
// IMPORTANT: change this to your own email address
export const FEEDBACK_EMAIL = "shuruthimca17@gmail.com";
export const APP_VERSION = "1.0.0";

export const DEFAULT_OWNED = ["galaxy", "sparkle"];

export const THEMES = [
  { id: "galaxy", icon: "🌌", name: "Purple Galaxy", price: 0, colors: ["#c084fc", "#6366f1", "#f472b6"] },
  { id: "ocean", icon: "🌊", name: "Ocean Night", price: 40, colors: ["#67e8f9", "#0ea5e9", "#6366f1"] },
  { id: "sunset", icon: "🌅", name: "Sunset Glow", price: 60, colors: ["#fdba74", "#f97316", "#ec4899"] },
  { id: "emerald", icon: "🌿", name: "Emerald Aurora", price: 80, colors: ["#6ee7b7", "#10b981", "#22d3ee"] },
];

export const AVATARS = [
  { id: "sparkle", icon: "✨", name: "Sparkle", price: 0 },
  { id: "rocket", icon: "🚀", name: "Rocket", price: 30 },
  { id: "owl", icon: "🦉", name: "Wise Owl", price: 30 },
  { id: "fox", icon: "🦊", name: "Fox", price: 40 },
  { id: "wizard", icon: "🧙", name: "Wizard", price: 50 },
  { id: "dragon", icon: "🐉", name: "Dragon", price: 60 },
  { id: "crown", icon: "👑", name: "Crown", price: 80 },
];