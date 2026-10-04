"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "blue", setTheme: () => {} });

export const THEME_OPTIONS = [
  { id: "blue", label: "КИБЕР СИНИЙ", main: "#5ecbff", glow: "94,203,255" },
  { id: "green", label: "МАТРИЦА", main: "#34d399", glow: "52,211,153" },
  { id: "purple", label: "ТЬМА", main: "#a855f7", glow: "168,85,247" },
  { id: "amber", label: "ЯНТАРЬ", main: "#fbbf24", glow: "251,191,36" },
  { id: "red", label: "ТРЕВОГА", main: "#ff4d6d", glow: "255,77,109" },
];

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("blue");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("levelup_theme");
      if (saved) setThemeState(saved);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const opt = THEME_OPTIONS.find((o) => o.id === theme) || THEME_OPTIONS[0];
    document.documentElement.style.setProperty("--accent", opt.main);
    document.documentElement.style.setProperty("--accent-glow", opt.glow);
  }, [theme]);

  const setTheme = (t) => {
    setThemeState(t);
    try {
      localStorage.setItem("levelup_theme", t);
    } catch {
      // ignore
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
