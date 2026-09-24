"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export const TONES = {
  blue: { main: "#5ecbff", glow: "94,203,255" },
  green: { main: "#34d399", glow: "52,211,153" },
  red: { main: "#ff4d6d", glow: "255,77,109" },
  purple: { main: "#a855f7", glow: "168,85,247" },
  amber: { main: "#fbbf24", glow: "251,191,36" },
};

const BTN = {
  blue: "border-[#5ecbff]/60 text-[#cdeeff] bg-[#5ecbff]/[0.06] hover:bg-[#5ecbff] hover:text-[#020617] shadow-[0_0_8px_rgba(94,203,255,0.2)]",
  green:
    "border-emerald-400/60 text-emerald-200 bg-emerald-400/[0.06] hover:bg-emerald-400 hover:text-slate-950 shadow-[0_0_8px_rgba(52,211,153,0.2)]",
  red: "border-rose-400/60 text-rose-200 bg-rose-400/[0.06] hover:bg-rose-400 hover:text-slate-950 shadow-[0_0_8px_rgba(251,113,133,0.2)]",
  purple:
    "border-purple-400/60 text-purple-200 bg-purple-400/[0.06] hover:bg-purple-400 hover:text-slate-950 shadow-[0_0_8px_rgba(168,85,247,0.2)]",
  amber:
    "border-amber-400/60 text-amber-200 bg-amber-400/[0.06] hover:bg-amber-400 hover:text-slate-950 shadow-[0_0_8px_rgba(251,191,36,0.2)]",
};

// Скошенный «гранёный» край панели, как на референсе System window
const notch = (size) =>
  `polygon(${size}px 0, calc(100% - ${size}px) 0, 100% ${size}px, 100% calc(100% - ${size}px), calc(100% - ${size}px) 100%, ${size}px 100%, 0 calc(100% - ${size}px), 0 ${size}px)`;

// Шрифт, парение, мерцание
function SysStyles() {
  return (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');
.sys-body{font-family:'Rajdhani','Segoe UI',sans-serif;font-weight:400;letter-spacing:0.02em;}
.sys-title{font-family:'Rajdhani','Segoe UI',sans-serif;font-weight:600;letter-spacing:0.1em;}
.sys-tilt{transform:none;}

@keyframes sysFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
.sys-float{animation:sysFloat 5s ease-in-out infinite;}

@keyframes sysFloatSoft{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
.sys-float-soft{animation:sysFloatSoft 6s ease-in-out infinite;}

@keyframes sysFlicker{
  0%,86%,100%{opacity:1;transform:translateX(0);filter:brightness(1)}
  87%{opacity:.55;transform:translateX(-2px);filter:brightness(1.4)}
  88%{opacity:1;transform:translateX(2px)}
  89%{opacity:.7;transform:translateX(0);filter:brightness(.9)}
  90%{opacity:1;filter:brightness(1.25)}
  93%{opacity:.85;filter:brightness(1)}
  94%{opacity:1}
  97%{opacity:.9;transform:translateX(1px)}
  98%{opacity:1;transform:translateX(0)}
}
.sys-flicker{animation:sysFlicker 4.5s infinite;}

@keyframes sysGlow{0%,100%{filter:brightness(1)}50%{filter:brightness(1.08)}}
.sys-glow{animation:sysGlow 3s ease-in-out infinite;}

@media (prefers-reduced-motion:reduce){
.sys-float,.sys-float-soft,.sys-flicker,.sys-glow{animation:none;}
}
`}</style>
  );
}

// Тонкая двойная линия-скоба над/под окном, как парящие HUD-рамки на референсе
function HudBracket({ t, side }) {
  const isTop = side === "top";
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute left-[12%] right-[12%] ${isTop ? "-top-2.5" : "-bottom-2.5"} h-2`}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: t.main,
          boxShadow: `0 0 3px ${t.main}, 0 0 8px rgba(${t.glow},0.5)`,
        }}
      />
      <div
        className="absolute inset-x-[20%] bottom-0 h-px opacity-60"
        style={{ background: t.main, boxShadow: `0 0 3px ${t.main}` }}
      />
    </div>
  );
}

// Рамка «системного окна»: тёмная почти непрозрачная панель со скошенными углами
export function SystemFrame({
  tone = "blue",
  className = "",
  outer = false,
  glass = false,
  style,
  children,
}) {
  const t = TONES[tone] || TONES.blue;
  const cut = 14;

  return (
    <div
      className={`sys-body relative ${className}`}
      style={{
        clipPath: notch(cut),
        background: glass
          ? "linear-gradient(180deg, rgba(8,16,30,0.74), rgba(2,7,16,0.84))"
          : "linear-gradient(180deg, rgba(6,13,26,0.95), rgba(2,6,13,0.98))",
        border: `1.5px solid ${t.main}`,
        boxShadow: `0 0 10px rgba(${t.glow},0.32), inset 0 0 22px rgba(${t.glow},0.05)`,
        backdropFilter: glass ? "blur(3px)" : "none",
        ...style,
      }}
    >
      <SysStyles />
      {outer && (
        <>
          <HudBracket t={t} side="top" />
          <HudBracket t={t} side="bottom" />
        </>
      )}
      {children}
    </div>
  );
}

// Круг с «!» — тоньше и спокойнее прежнего
export function IconBox({ tone = "blue", children = "!", size = "w-12 h-12" }) {
  const t = TONES[tone] || TONES.blue;
  const isDefault = children === "!";
  return (
    <div
      className={`${size} shrink-0 flex items-center justify-center text-white`}
      style={{
        clipPath: notch(6),
        border: `1px solid ${t.main}`,
        background: `rgba(${t.glow},0.07)`,
        boxShadow: `0 0 8px rgba(${t.glow},0.4)`,
      }}
    >
      {isDefault ? (
        <div
          className="w-6 h-6 rounded-full border border-white/80 flex items-center justify-center font-semibold text-sm leading-none"
          style={{ textShadow: `0 0 4px ${t.main}` }}
        >
          !
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// Подзаголовок с тонкой чертой-разделителем под текстом, как «GOAL» на референсе
export function SysSubtitle({ children, tone = "blue" }) {
  const t = TONES[tone] || TONES.blue;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="sys-title text-center text-xs tracking-[0.22em] uppercase"
        style={{ color: t.main, textShadow: `0 0 4px rgba(${t.glow},0.5)` }}
      >
        {children}
      </div>
      <div
        className="w-10 h-px"
        style={{ background: `rgba(${t.glow},0.5)` }}
      />
    </div>
  );
}

// Строка списка: «- ЗАДАЧА ........ [0/1]», без свечения на тексте
export function SysRow({ label, value, done = false }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm tracking-wide">
      <span className="min-w-0 break-words uppercase text-[#dbe7f4]">
        - {String(label)}
      </span>
      <span
        className="shrink-0 font-semibold"
        style={{ color: done ? "#4ade80" : "#a8c6e6" }}
      >
        [{value}]
      </span>
    </div>
  );
}

export function SysInput({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full bg-[#050b16]/70 border border-[#5ecbff]/25 focus:border-[#5ecbff] focus:shadow-[0_0_8px_rgba(94,203,255,0.4)] text-[#e6f1ff] placeholder-[#5f86a8] p-3 text-sm outline-none transition ${className}`}
    />
  );
}

// Кнопка со скошенными углами, как панель
export function SysButton({
  tone = "blue",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      {...props}
      style={{ clipPath: notch(6) }}
      className={`sys-title border py-2.5 px-4 text-xs tracking-[0.15em] uppercase transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait ${BTN[tone] || BTN.blue} ${className}`}
    >
      {children}
    </button>
  );
}

// Таймер до конца суток
export function MidnightTimer({ label = "ДО НОВОГО ДНЯ", tone = "blue" }) {
  const t = TONES[tone] || TONES.blue;
  const [left, setLeft] = useState("--:--:--");

  useEffect(() => {
    const p = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      const s = Math.max(0, Math.floor((end - now) / 1000));
      setLeft(
        `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`,
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1.5 mt-6">
      <div
        className="sys-title text-3xl tracking-widest text-white"
        style={{
          textShadow: `0 0 6px ${t.main}, 0 0 14px rgba(${t.glow},0.5)`,
        }}
      >
        {left}
      </div>
      <svg
        viewBox="0 0 48 48"
        className="w-11 h-11"
        fill="none"
        stroke="#e6f1ff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 4px ${t.main})` }}
      >
        <circle cx="24" cy="27" r="16" />
        <path d="M19 5h10M24 5v6" />
        <path d="M16 27l6 6 11-12" />
      </svg>
      <div className="text-[10px] tracking-[0.25em] uppercase text-[#8fb6e6]">
        {label}
      </div>
    </div>
  );
}

// Модальное окно в стиле системы
export default function SystemWindow({
  open = true,
  tone = "blue",
  icon = "!",
  title = "",
  onClose,
  children,
  maxWidth = "max-w-sm",
  z = "z-50",
}) {
  const t = TONES[tone] || TONES.blue;

  return (
    <AnimatePresence>
      {open && (
        <div
          className={`fixed inset-0 ${z} flex items-center justify-center p-6 sm:p-10`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, scaleY: 0.06, scaleX: 0.8 }}
            animate={{ opacity: 1, scaleY: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleY: 0.06, scaleX: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`relative w-full ${maxWidth}`}
          >
            <div className="sys-float">
              <div className="sys-flicker">
                <div className="sys-glow">
                  <SystemFrame
                    tone={tone}
                    glass
                    outer
                    className="flex flex-col"
                  >
                    <div className="flex items-stretch gap-3 px-5 pt-6 pb-3 relative">
                      <IconBox tone={tone}>{icon}</IconBox>
                      <div className="flex-1 min-w-0 border border-[#5ecbff]/25 flex items-center justify-center px-3 py-2">
                        <h2
                          className="sys-title uppercase tracking-[0.1em] text-base sm:text-xl truncate text-white"
                          style={{
                            textShadow: `0 0 4px ${t.main}, 0 0 10px rgba(${t.glow},0.4)`,
                          }}
                        >
                          {title}
                        </h2>
                      </div>
                      {onClose && (
                        <button
                          onClick={onClose}
                          aria-label="Закрыть"
                          className="shrink-0 w-8 flex items-center justify-center text-[#7fb3d9] hover:text-white transition cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="px-5 pb-6 max-h-[62dvh] overflow-y-auto text-[#e6f1ff] relative">
                      {children}
                    </div>
                  </SystemFrame>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
