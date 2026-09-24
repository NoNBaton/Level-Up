"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export const TONES = {
  blue: { main: "#4fa3e0", glow: "79,163,224" },
  green: { main: "#34d399", glow: "52,211,153" },
  red: { main: "#ff4d6d", glow: "255,77,109" },
  purple: { main: "#a855f7", glow: "168,85,247" },
  amber: { main: "#fbbf24", glow: "251,191,36" },
};

const BTN = {
  blue: "border-[#3b9dff] text-[#cfe6ff] bg-[#3b9dff]/10 hover:bg-[#3b9dff] hover:text-[#020617] shadow-[0_0_14px_rgba(59,157,255,0.4)]",
  green:
    "border-emerald-400 text-emerald-200 bg-emerald-400/10 hover:bg-emerald-400 hover:text-slate-950 shadow-[0_0_14px_rgba(52,211,153,0.4)]",
  red: "border-rose-400 text-rose-200 bg-rose-400/10 hover:bg-rose-400 hover:text-slate-950 shadow-[0_0_14px_rgba(251,113,133,0.4)]",
  purple:
    "border-purple-400 text-purple-200 bg-purple-400/10 hover:bg-purple-400 hover:text-slate-950 shadow-[0_0_14px_rgba(168,85,247,0.4)]",
  amber:
    "border-amber-400 text-amber-200 bg-amber-400/10 hover:bg-amber-400 hover:text-slate-950 shadow-[0_0_14px_rgba(251,191,36,0.4)]",
};

// Шрифты, наклон и мерцание
function SysStyles() {
  return (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=Titillium+Web:wght@400;500;600;700&family=Audiowide&display=swap');
.sys-body{font-family:'Titillium Web','Segoe UI',sans-serif;font-weight:500;letter-spacing:0.015em;}
.sys-title{font-family:'Audiowide','Titillium Web','Segoe UI',sans-serif;font-weight:400;letter-spacing:0.05em;}
.sys-tilt{transform:none;}

/* Парение: окно медленно покачивается в воздухе */
@keyframes sysFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
.sys-float{animation:sysFloat 5s ease-in-out infinite;}

/* Парение (мягкое, для главного экрана) */
@keyframes sysFloatSoft{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
.sys-float-soft{animation:sysFloatSoft 6s ease-in-out infinite;}

/* Мерцание с глитчем: редкие провалы яркости и дрожание по X */
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

/* Пульсация свечения */
@keyframes sysGlow{0%,100%{filter:brightness(1)}50%{filter:brightness(1.18)}}
.sys-glow{animation:sysGlow 3s ease-in-out infinite;}

@media (prefers-reduced-motion:reduce){
.sys-float,.sys-float-soft,.sys-flicker,.sys-glow{animation:none;}
}
`}</style>
  );
}
// Толстая неоновая полоса. outer=true: выступает за края окна, как на картинке
function NeonBar({ t, side, outer }) {
  const inset = outer ? "-9%" : "0px";
  const offset = outer ? -22 : 0;
  const bar = {
    left: inset,
    right: inset,
    [side]: offset,
    height: outer ? 9 : 3,
  };
  const core = {
    background: `linear-gradient(90deg, transparent 0%, ${t.main} 6%, #dff0ff 30%, #ffffff 50%, #dff0ff 70%, ${t.main} 94%, transparent 100%)`,
    boxShadow: `0 0 5px #ffffff, 0 0 10px ${t.main}, 0 0 22px rgba(${t.glow},0.55)`,
    borderRadius: 2,
  };
  const tick = (left, w, h) => ({
    position: "absolute",
    left,
    width: w,
    height: h,
    [side]: -7,
    background: t.main,
    boxShadow: `0 0 8px ${t.main}`,
  });

  return (
    <div aria-hidden className="pointer-events-none absolute" style={bar}>
      <div className="absolute inset-0" style={core} />
      {outer && (
        <>
          <div style={tick("24%", "5%", 4)} />
          <div style={tick("31%", "2%", 4)} />
          <div style={tick("66%", "4%", 4)} />
          <div style={tick("72%", "1.5%", 4)} />
        </>
      )}
    </div>
  );
}

// Рамка «системного окна»
export function SystemFrame({
  tone = "blue",
  className = "",
  outer = false,
  glass = false,
  children,
}) {
  const t = TONES[tone] || TONES.blue;
  const corner = "pointer-events-none absolute w-3.5 h-3.5";
  const c = "rgba(226,240,255,0.95)";

  return (
    <div
      className={`sys-body relative ${className}`}
      style={{
        background: glass
          ? "linear-gradient(180deg, rgba(8,22,52,0.55), rgba(3,10,26,0.68))"
          : "linear-gradient(180deg, rgba(6,14,32,0.94), rgba(3,8,20,0.96))",
        border: `1px solid rgba(214,232,255,${glass ? 0.55 : 0.4})`,
        boxShadow: `0 0 18px rgba(${t.glow},0.18), inset 0 0 30px rgba(${t.glow},0.06)`,
        backdropFilter: `blur(${glass ? 6 : 10}px)`,
      }}
    >
      <SysStyles />
      <NeonBar t={t} side="top" outer={outer} />
      <NeonBar t={t} side="bottom" outer={outer} />

      <div
        aria-hidden
        className={`${corner} -left-1 -top-1 border-t-2 border-l-2`}
        style={{ borderColor: c }}
      />
      <div
        aria-hidden
        className={`${corner} -right-1 -top-1 border-t-2 border-r-2`}
        style={{ borderColor: c }}
      />
      <div
        aria-hidden
        className={`${corner} -left-1 -bottom-1 border-b-2 border-l-2`}
        style={{ borderColor: c }}
      />
      <div
        aria-hidden
        className={`${corner} -right-1 -bottom-1 border-b-2 border-r-2`}
        style={{ borderColor: c }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          background:
            "repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 3px)",
        }}
      />
      {children}
    </div>
  );
}

// Квадрат с иконкой; по умолчанию круг с «!»
export function IconBox({ tone = "blue", children = "!", size = "w-12 h-12" }) {
  const t = TONES[tone] || TONES.blue;
  const isDefault = children === "!";
  return (
    <div
      className={`${size} shrink-0 flex items-center justify-center border text-white`}
      style={{
        borderColor: t.main,
        background: `rgba(${t.glow},0.14)`,
        boxShadow: `0 0 12px rgba(${t.glow},0.7), inset 0 0 10px rgba(${t.glow},0.35)`,
      }}
    >
      {isDefault ? (
        <div
          className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center font-black text-base leading-none"
          style={{ textShadow: `0 0 8px ${t.main}` }}
        >
          !
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// Зелёный подзаголовок, как «OBJECTIFS» на картинке
export function SysSubtitle({ children, tone = "blue" }) {
  const t = TONES[tone] || TONES.green;
  return (
    <div
      className="sys-title text-center text-sm tracking-[0.22em] uppercase"
      style={{ color: t.main, textShadow: `0 0 6px rgba(${t.glow},0.55)` }}
    >
      {children}
    </div>
  );
}

// Строка списка: «- ЗАДАЧА ........ [0/1]»
export function SysRow({ label, value, done = false }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm tracking-wider">
      <span
        className="min-w-0 break-words uppercase text-[#e6f1ff]"
        style={{ textShadow: "0 0 8px rgba(120,180,255,0.55)" }}
      >
        - {String(label)}
      </span>
      <span
        className="shrink-0 font-bold"
        style={{
          color: done ? "#4ade80" : "#dcebff",
          textShadow: done
            ? "0 0 10px rgba(74,222,128,0.7)"
            : "0 0 8px rgba(120,180,255,0.6)",
        }}
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
      className={`w-full bg-[#020817]/60 border border-[#d6e8ff]/40 focus:border-[#3b9dff] focus:shadow-[0_0_14px_rgba(59,157,255,0.55)] text-[#e6f1ff] placeholder-[#4f7fb5] p-3 text-sm outline-none transition ${className}`}
    />
  );
}

export function SysButton({
  tone = "blue",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      {...props}
      className={`sys-title border py-2.5 px-4 text-xs tracking-[0.2em] uppercase transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait ${BTN[tone] || BTN.blue} ${className}`}
    >
      {children}
    </button>
  );
}

// Таймер до конца суток с большими часами-секундомером, как на картинке
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
        style={{ textShadow: `0 0 12px ${t.main}, 0 0 26px ${t.main}` }}
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
        style={{ filter: `drop-shadow(0 0 6px ${t.main})` }}
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
                      <div className="flex-1 min-w-0 border border-[#d6e8ff]/40 flex items-center justify-center px-3 py-2">
                        <h2
                          className="sys-title uppercase tracking-[0.08em] text-base sm:text-xl truncate text-white"
                          style={{
                            textShadow: `0 0 5px ${t.main}, 0 0 12px rgba(${t.glow},0.55)`,
                          }}
                        >
                          {title}
                        </h2>
                      </div>
                      {onClose && (
                        <button
                          onClick={onClose}
                          aria-label="Закрыть"
                          className="shrink-0 w-8 flex items-center justify-center text-[#8fb6e6] hover:text-white transition cursor-pointer"
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
