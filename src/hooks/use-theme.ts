import { useState, useEffect } from "react";

type Theme = "light" | "dark";

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("fintrack-theme") as Theme) || "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("fintrack-theme", theme);
  }, [theme]);

  const toggleTheme = () => setThemeState(t => (t === "light" ? "dark" : "light"));

  return { theme, toggleTheme };
};
