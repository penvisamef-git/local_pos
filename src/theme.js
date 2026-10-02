// POS colours follow the admin web: General settings → System theme (forest / ocean / candy / navy).
// The theme comes with the shop data (sync) and is kept on this computer so the screen opens in the right colours.
// POS fonts stay the bundled ones (they work offline).
const KEY = "pos_theme";

const T = (o) => o;
export const POS_THEMES = {
  forest: T({
    "--pos-green": "#1f7a4d", "--pos-green-dark": "#14532d", "--pos-green-light": "#2a8a57", "--pos-green-soft": "#e7f3ec", "--pos-mint": "#b9dcc8", "--pos-rgb": "31, 122, 77",
    "--pos-gold": "#f59e0b", "--pos-gold-soft": "#fff4dd", "--pos-gold-rgb": "245, 158, 11", "--pos-gold-line": "#e7b766", "--pos-gold-text": "#8a5a00", "--pos-gold-bright": "#ffd27a",
    "--pos-bg": "#eef1ef", "--pos-line": "#e3e8e5", "--pos-text": "#18221d", "--pos-muted": "#66706b", "--pos-soft": "#fafbfa", "--pos-soft2": "#f3f6f4",
    "--pos-on-dark": "#d4f5e2", "--pos-shadow-rgb": "16, 40, 28", "--pos-radius": "16px",
  }),
  ocean: T({
    "--pos-green": "#1d64d8", "--pos-green-dark": "#1748a6", "--pos-green-light": "#2d74e6", "--pos-green-soft": "#e8f0fd", "--pos-mint": "#bcd5fa", "--pos-rgb": "29, 100, 216",
    "--pos-gold": "#f59e0b", "--pos-gold-soft": "#fff6e5", "--pos-gold-rgb": "245, 158, 11", "--pos-gold-line": "#f2c46b", "--pos-gold-text": "#8a5a00", "--pos-gold-bright": "#fcd34d",
    "--pos-bg": "#e9edf3", "--pos-line": "#e2e7ef", "--pos-text": "#172033", "--pos-muted": "#5b6576", "--pos-soft": "#f6f8fb", "--pos-soft2": "#f1f4f9",
    "--pos-on-dark": "#dbe8fd", "--pos-shadow-rgb": "15, 35, 70", "--pos-radius": "10px",
  }),
  candy: T({
    "--pos-green": "#c2417f", "--pos-green-dark": "#8f2b5c", "--pos-green-light": "#e0609c", "--pos-green-soft": "#fdeaf3", "--pos-mint": "#f7c3dc", "--pos-rgb": "194, 65, 127",
    "--pos-gold": "#8b5cf6", "--pos-gold-soft": "#f1ecff", "--pos-gold-rgb": "139, 92, 246", "--pos-gold-line": "#c4b5fd", "--pos-gold-text": "#5b21b6", "--pos-gold-bright": "#e9d5ff",
    "--pos-bg": "#f4ecf4", "--pos-line": "#f1e3ef", "--pos-text": "#2a1f2b", "--pos-muted": "#7a6479", "--pos-soft": "#fdf8fc", "--pos-soft2": "#faf1f7",
    "--pos-on-dark": "#fde4f0", "--pos-shadow-rgb": "120, 40, 100", "--pos-radius": "20px",
  }),
  navy: T({
    "--pos-green": "#1f3a63", "--pos-green-dark": "#132843", "--pos-green-light": "#2a4a7a", "--pos-green-soft": "#e9eef5", "--pos-mint": "#c9d5e6", "--pos-rgb": "31, 58, 99",
    "--pos-gold": "#c9962b", "--pos-gold-soft": "#fbf3e2", "--pos-gold-rgb": "201, 150, 43", "--pos-gold-line": "#e8c77a", "--pos-gold-text": "#7a5a12", "--pos-gold-bright": "#e8c77a",
    "--pos-bg": "#eceef2", "--pos-line": "#e3e7ed", "--pos-text": "#16202e", "--pos-muted": "#5d6878", "--pos-soft": "#f7f8fa", "--pos-soft2": "#f2f4f7",
    "--pos-on-dark": "#e8c77a", "--pos-shadow-rgb": "10, 20, 40", "--pos-radius": "12px",
  }),
};

let current = "";
export const currentTheme = () => current;
export function applyTheme(key) {
  const k = POS_THEMES[key] ? key : "forest";
  if (k === current) return;
  current = k;
  const root = document.documentElement;
  Object.entries(POS_THEMES[k]).forEach(([n, v]) => root.style.setProperty(n, v));
  root.dataset.posTheme = k;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", POS_THEMES[k]["--pos-green"]);
  try {
    localStorage.setItem(KEY, k);
  } catch {
    // storage blocked → default next time
  }
}

// at start: the last theme used on this computer (no flash of green)
let saved = "forest";
try {
  saved = localStorage.getItem(KEY) || "forest";
} catch {
  // ignore
}
applyTheme(saved);
