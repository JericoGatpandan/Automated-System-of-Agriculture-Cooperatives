export type ThemeMode = "light" | "dark";

const THEME_KEY = "asac_theme";

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(THEME_KEY);
  return stored === "dark" ? "dark" : "light";
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.setAttribute("data-theme", theme);
}

export function setStoredTheme(theme: ThemeMode) {
  if (typeof window !== "undefined") {
    localStorage.setItem(THEME_KEY, theme);
  }
  applyTheme(theme);
}
