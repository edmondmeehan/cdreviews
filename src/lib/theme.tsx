import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
const STORAGE_KEY = "cdreviews-theme";
const ThemeContext = createContext({ theme: "dark" as Theme, setTheme: (_theme: Theme) => {} });

// Apply the saved choice before styles paint; dark remains the default.
export const themeBootstrap = `try{var t=localStorage.getItem("${STORAGE_KEY}");document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, updateTheme] = useState<Theme>("dark");
  useEffect(() => {
    updateTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
    const sync = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const next = event.newValue === "light" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      updateTheme(next);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function setTheme(next: Theme) {
    document.documentElement.dataset.theme = next;
    updateTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* Still works without storage. */ }
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--color-bone").trim());
  }
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }