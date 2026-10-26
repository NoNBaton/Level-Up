"use client";

import React, { useEffect, useState } from "react";

const SEGMENTS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

const pad = (n) => String(n).padStart(2, "0");

const msLeftToday = () => {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  return end - now;
};

export default function DailyTimer({ title = "ВЫЖИТЬ", done = false }) {
  const [left, setLeft] = useState(null);

  useEffect(() => {
    setLeft(msLeftToday());
    const t = setInterval(() => setLeft(msLeftToday()), 1000);
    return () => clearInterval(t);
  }, []);

  if (left === null) return null;

  const total = Math.floor(left / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  const danger = !done && left < 60 * 60 * 1000; // меньше часа
  const main = done ? "#34d399" : danger ? "#ff4d6d" : "#dff4ff";
  const glow = done ? "52,211,153" : danger ? "255,77,109" : "94,203,255";
  const filled = Math.ceil((left / DAY_MS) * SEGMENTS);

  return (
    <div className="my-4 flex flex-col items-center select-none">
      <div
        className="text-lg tracking-[0.2em] uppercase"
        style={{
          color: main,
          textShadow: `0 0 8px rgba(${glow},0.9), 0 0 18px rgba(${glow},0.5)`,
        }}
      >
        {done ? "ВСЁ ВЫПОЛНЕНО" : title}
      </div>

      <div className="mt-1 flex items-baseline gap-1.5">
        <span
          className="sys-title text-4xl sm:text-5xl font-black tabular-nums"
          style={{
            color: main,
            textShadow: `0 0 10px rgba(${glow},1), 0 0 28px rgba(${glow},0.6)`,
          }}
        >
          {pad(h)}:{pad(m)}:{pad(s)}
        </span>
        <span
          className="text-sm italic"
          style={{ color: main, textShadow: `0 0 8px rgba(${glow},0.8)` }}
        >
          /24h
        </span>
      </div>

      <svg viewBox="0 0 100 100" className="mt-3 w-24 h-24">
        {Array.from({ length: SEGMENTS }).map((_, i) => {
          const on = i < filled;
          return (
            <g key={i} transform={`rotate(${(i * 360) / SEGMENTS} 50 50)`}>
              <rect
                x="47.5"
                y="6"
                width="5"
                height="10"
                rx="2.5"
                fill={on ? main : "transparent"}
                stroke={main}
                strokeOpacity={on ? 1 : 0.35}
                strokeWidth="1"
                style={{
                  filter: on
                    ? `drop-shadow(0 0 3px rgba(${glow},0.9))`
                    : "none",
                  transition: "fill 0.4s",
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
