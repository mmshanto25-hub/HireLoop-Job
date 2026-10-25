import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "hireloop-theme";

export function resolveTheme(preference: ThemePreference, prefersDark: boolean): "light" | "dark" {
  if (preference === "system") return prefersDark ? "dark" : "light";
  return preference;
}

/** Writes the resolved theme onto <html>. Tailwind's `dark:` variant reads this class. */
export function applyThemeToDocument(
  theme: "light" | "dark",
  root: HTMLElement = document.documentElement,
) {
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

/** Persisted user preference. The preference is stored locally; it is not personal data. */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: "system",
      setPreference: (preference) => set({ preference }),
    }),
    { name: THEME_STORAGE_KEY },
  ),
);
