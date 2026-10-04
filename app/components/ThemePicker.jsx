"use client";

import React from "react";
import { Palette } from "lucide-react";
import { useTheme, THEME_OPTIONS } from "./ThemeContext";
import { TONES } from "./SystemWindow";

export default function ThemePicker() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-[#7fa8d6]">
        <Palette className="w-3 h-3" />
        ТЕМА ОФОРМЛЕНИЯ
      </div>
      <div className="flex gap-2 flex-wrap">
        {THEME_OPTIONS.map((opt) => {
          const t = TONES[opt.id];
          const active = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`px-2.5 py-1.5 border text-[9px] font-bold tracking-wider uppercase transition cursor-pointer ${
                active ? "scale-105" : "opacity-60 hover:opacity-100"
              }`}
              style={{
                borderColor: t.main,
                color: t.main,
                background: active ? `rgba(${t.glow},0.15)` : "transparent",
                boxShadow: active ? `0 0 10px rgba(${t.glow},0.4)` : "none",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
