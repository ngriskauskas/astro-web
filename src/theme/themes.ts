import { readChoice, writeChoice } from "../utils/storage";

// The colour values live in index.css. Each theme re-points the white and gray tokens the
// whole app uses, and Midnight and Dusk also swap the indigo accent. The swatch and ring
// colours here only draw the picker.
export const THEMES = [
  { id: "paper", label: "Paper", swatch: "#fffdf9", ring: "#cfc8b8" },
  { id: "midnight", label: "Midnight", swatch: "#161e33", ring: "#d97706" },
  { id: "dusk", label: "Dusk", swatch: "#22192f", ring: "#e11d48" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

const THEME_IDS: readonly ThemeId[] = THEMES.map((theme) => theme.id);
const THEME_KEY = "astro-theme";
export const DEFAULT_THEME: ThemeId = "paper";

export const readStoredTheme = (): ThemeId => readChoice(THEME_KEY, THEME_IDS, DEFAULT_THEME);

export const applyTheme = (theme: ThemeId) => {
  document.documentElement.dataset.theme = theme;
  writeChoice(THEME_KEY, theme);
};
