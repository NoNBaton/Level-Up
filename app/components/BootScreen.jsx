"use client";

import React, { useEffect, useState } from "react";
import { Cpu } from "lucide-react";

const BOOT_LINES = [
  "ИНИЦИАЛИЗАЦИЯ ЯДРА СИСТЕМЫ...",
  "ПРОВЕРКА ДОСТУПА ОПЕРАТОРА...",
  "ЗАГРУЗКА ПРОТОКОЛА LEVEL_UP...",
  "СИНХРОНИЗАЦИЯ С СЕРВЕРОМ...",
];

function GlitchText({ text, className, style }) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    setDisplay(text);
    let cancelled = false;
    const glitchOnce = () => {
      if (cancelled) return;
      const chars = "!<>/\\#$%01".split("");
      const arr = text.split("");
      const idx = Math.floor(Math.random() * arr.length);
      arr[idx] = chars[Math.floor(Math.random() * chars.length)];
      setDisplay(arr.join(""));
      setTimeout(() => !cancelled && setDisplay(text), 70);
    };
    const id = setInterval(glitchOnce, 1400 + Math.random() * 900);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [text]);

  return (
    <span className={className} style={style}>
      {display}
    </span>
  );
}

// powerOn=false: экран "идёт загрузка". powerOn=true: эпичное открытие системы.
export default function BootScreen({ powerOn = false }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [pct, setPct] = useState(4);

  useEffect(() => {
    if (powerOn) return;
    const li = setInterval(
      () => setLineIndex((i) => (i + 1) % BOOT_LINES.length),
      900,
    );
    const pi = setInterval(() => {
      setPct((p) => Math.min(96, p + Math.random() * 14));
    }, 260);
    return () => {
      clearInterval(li);
      clearInterval(pi);
    };
  }, [powerOn]);

  return (
    <div className="fixed inset-0 z-[200] bg-black overflow-hidden select-none">
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Play:wght@400;700&family=Russo+One&display=swap');
.boot-title{font-family:'Russo One','Play','Segoe UI',sans-serif;}

@keyframes bootScan{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}
@keyframes bootBlink{0%,49%{opacity:1}50%,100%{opacity:0}}
.boot-cursor{animation:bootBlink 1s step-end infinite;}
.boot-scanline{animation:bootScan 2.6s linear infinite;}

/* Раскрытие: рамка чертится крест-накрест */
@keyframes drawX{0%{transform:scaleX(0)}100%{transform:scaleX(1)}}
@keyframes drawY{0%{transform:scaleY(0)}100%{transform:scaleY(1)}}
@keyframes rectGlowPulse{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes cornerIn{0%{opacity:0;transform:scale(0.4)}100%{opacity:1;transform:scale(1)}}
@keyframes titleIn{
  0%{opacity:0;letter-spacing:.9em;filter:blur(8px)}
  55%{opacity:1;letter-spacing:.18em;filter:blur(0)}
  100%{opacity:1;letter-spacing:.14em}
}
@keyframes fadeOut{0%{opacity:1}100%{opacity:0}}
@keyframes panelUp{0%{transform:translateY(0)}100%{transform:translateY(-100%)}}
@keyframes panelDown{0%{transform:translateY(0)}100%{transform:translateY(100%)}}
@keyframes burst{
  0%{opacity:0}
  8%{opacity:1}
  22%{opacity:.15}
  34%{opacity:.85}
  50%{opacity:0}
  100%{opacity:0}
}
@keyframes noiseFade{0%{opacity:.35}100%{opacity:0}}
`}</style>

      {!powerOn && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-6 px-6 relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-[#3b9dff]/10 to-transparent boot-scanline"
          />
          <div className="flex items-center gap-3">
            <Cpu
              className="w-7 h-7 text-[#3b9dff] animate-spin"
              style={{ animationDuration: "2.2s" }}
            />
            <GlitchText
              text="LEVEL_UP // OS"
              className="text-lg sm:text-xl font-black tracking-[0.2em] text-white"
              style={{ textShadow: "0 0 10px #3b9dff, 0 0 24px #3b9dff" }}
            />
          </div>

          <div className="w-full max-w-xs">
            <div className="h-2 border border-[#3b9dff]/50 bg-[#020817]/70 p-0.5">
              <div
                className="h-full transition-all duration-200"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg,#3b9dff,#dff0ff)",
                  boxShadow: "0 0 10px #3b9dff",
                }}
              />
            </div>
            <div className="mt-2 text-[10px] text-[#8fb6e6] tracking-widest text-right">
              {Math.floor(pct)}%
            </div>
          </div>

          <div className="text-[10px] sm:text-xs text-[#9fd0ff] tracking-widest uppercase text-center min-h-[1.4em]">
            {BOOT_LINES[lineIndex]}
            <span className="boot-cursor">_</span>
          </div>
        </div>
      )}

      {powerOn && (
        <div className="w-full h-full relative">
          {/* Две половинки, которые в конце разъедутся вверх/вниз */}
          <div
            className="absolute inset-x-0 top-0 h-1/2 bg-black"
            style={{ animation: "panelUp 0.5s 0.75s ease-in forwards" }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-black"
            style={{ animation: "panelDown 0.5s 0.75s ease-in forwards" }}
          />

          {/* Рамка, которая "чертится" крест-накрест */}
          <div
            className="absolute inset-0 flex items-center justify-center px-6"
            style={{ animation: "fadeOut 0.25s 0.85s ease-in forwards" }}
          >
            <div className="relative w-full max-w-md h-40">
              {/* горизонтальные линии */}
              <div
                className="absolute left-0 right-0 top-0 h-[3px]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #dff0ff 20%, #ffffff 50%, #dff0ff 80%, transparent)",
                  boxShadow: "0 0 10px #fff, 0 0 26px #3b9dff",
                  animation:
                    "drawX 0.35s 0.08s cubic-bezier(.2,.9,.2,1) both, rectGlowPulse 1.4s 0.5s ease-in-out infinite",
                }}
              />
              <div
                className="absolute left-0 right-0 bottom-0 h-[3px]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #dff0ff 20%, #ffffff 50%, #dff0ff 80%, transparent)",
                  boxShadow: "0 0 10px #fff, 0 0 26px #3b9dff",
                  animation:
                    "drawX 0.35s 0.08s cubic-bezier(.2,.9,.2,1) both, rectGlowPulse 1.4s 0.5s ease-in-out infinite",
                }}
              />
              {/* вертикальные линии */}
              <div
                className="absolute top-0 bottom-0 left-0 w-[3px]"
                style={{
                  background:
                    "linear-gradient(180deg, transparent, #dff0ff 20%, #ffffff 50%, #dff0ff 80%, transparent)",
                  boxShadow: "0 0 10px #fff, 0 0 26px #3b9dff",
                  animation:
                    "drawY 0.35s 0.16s cubic-bezier(.2,.9,.2,1) both, rectGlowPulse 1.4s 0.5s ease-in-out infinite",
                }}
              />
              <div
                className="absolute top-0 bottom-0 right-0 w-[3px]"
                style={{
                  background:
                    "linear-gradient(180deg, transparent, #dff0ff 20%, #ffffff 50%, #dff0ff 80%, transparent)",
                  boxShadow: "0 0 10px #fff, 0 0 26px #3b9dff",
                  animation:
                    "drawY 0.35s 0.16s cubic-bezier(.2,.9,.2,1) both, rectGlowPulse 1.4s 0.5s ease-in-out infinite",
                }}
              />

              {/* уголки */}
              {[
                "left-[-3px] top-[-3px] border-l-2 border-t-2",
                "right-[-3px] top-[-3px] border-r-2 border-t-2",
                "left-[-3px] bottom-[-3px] border-l-2 border-b-2",
                "right-[-3px] bottom-[-3px] border-r-2 border-b-2",
              ].map((pos, i) => (
                <div
                  key={pos}
                  className={`absolute w-4 h-4 ${pos}`}
                  style={{
                    borderColor: "#ffffff",
                    boxShadow: "0 0 10px #3b9dff",
                    opacity: 0,
                    animation: `cornerIn 0.25s ${0.3 + i * 0.05}s ease-out forwards`,
                  }}
                />
              ))}

              {/* заголовок */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="boot-title text-white text-sm sm:text-lg uppercase text-center px-4"
                  style={{
                    opacity: 0,
                    textShadow: "0 0 10px #3b9dff, 0 0 28px #3b9dff",
                    animation: "titleIn 0.4s 0.45s ease-out forwards",
                  }}
                >
                  СИСТЕМА АКТИВИРОВАНА
                </span>
              </div>
            </div>
          </div>

          {/* Короткая вспышка в момент раскрытия */}
          <div
            className="absolute inset-0 bg-white"
            style={{
              opacity: 0,
              animation: "burst 0.4s 0.72s ease-out forwards",
            }}
          />

          {/* Лёгкие помехи поверх раскрытия */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.09) 0px, transparent 1px, transparent 3px)",
              mixBlendMode: "overlay",
              opacity: 0.35,
              animation: "noiseFade 0.5s 0.75s ease-out forwards",
            }}
          />
        </div>
      )}
    </div>
  );
}
