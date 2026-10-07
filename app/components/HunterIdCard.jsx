"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Maximize2,
  X,
  Flame,
  Trophy,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ITEM_BY_ID, frameColors } from "@/lib/items";
const RANKS = [
  { min: 25, letter: "S", color: "#ffd34d", glow: "255,211,77" },
  { min: 20, letter: "A", color: "#ff9f43", glow: "255,159,67" },
  { min: 15, letter: "B", color: "#c084fc", glow: "192,132,252" },
  { min: 10, letter: "C", color: "#5ecbff", glow: "94,203,255" },
  { min: 5, letter: "D", color: "#34d399", glow: "52,211,153" },
  { min: 0, letter: "E", color: "#94a3b8", glow: "148,163,184" },
];

const rankFor = (level) => RANKS.find((r) => level >= r.min) || RANKS[5];

function Seal({ color }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden>
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity="0.9"
      />
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeDasharray="3 4"
        opacity="0.7"
      />
      <g transform="rotate(-14 50 50)">
        <text
          x="50"
          y="46"
          textAnchor="middle"
          fontSize="11"
          fontWeight="900"
          letterSpacing="2"
          fill={color}
        >
          СИСТЕМА
        </text>
        <text
          x="50"
          y="60"
          textAnchor="middle"
          fontSize="7"
          letterSpacing="3"
          fill={color}
          opacity="0.8"
        >
          ВЕРИФИЦИРОВАН
        </text>
      </g>
    </svg>
  );
}

function CardFace({ player }) {
  const level = Number(player.level) || 1;
  const xp = Number(player.xp) || 0;
  const streak = Number(player.streak) || 0;
  const best = Math.max(Number(player.longestStreak) || 0, streak);
  const done = Number.isFinite(player.progress?.completedTotal)
    ? player.progress.completedTotal
    : 0;
  const ach = Array.isArray(player.achievements)
    ? player.achievements.length
    : 0;
  const baseRank = rankFor(level);
  const fc = frameColors(player.frame);
  const rank = fc ? { ...baseRank, color: fc.color, glow: fc.glow } : baseRank;
  const titleName = ITEM_BY_ID[player.title]?.name || "";
  const name = String(player.nickname || "ОХОТНИК");

  const stats = [
    { icon: Flame, label: "СТРИК", value: `${streak}D` },
    { icon: Trophy, label: "РЕКОРД", value: `${best}D` },
    { icon: CheckCircle2, label: "КВЕСТОВ", value: done },
    { icon: ShieldCheck, label: "НАГРАД", value: ach },
  ];

  return (
    <div
      className="relative overflow-hidden border-2 bg-[#020817] p-4"
      style={{
        borderColor: rank.color,
        boxShadow: `0 0 18px rgba(${rank.glow},0.55), inset 0 0 24px rgba(${rank.glow},0.12)`,
      }}
    >
      {/* голографический блик */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25 mix-blend-screen"
        style={{
          backgroundImage: `linear-gradient(115deg, transparent 30%, rgba(${rank.glow},0.55) 48%, transparent 66%)`,
          backgroundSize: "250% 250%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />

      <div
        className="text-[9px] tracking-[0.3em] uppercase text-center mb-3"
        style={{ color: rank.color }}
      >
        // УДОСТОВЕРЕНИЕ ОХОТНИКА //
      </div>

      <div className="relative flex gap-3">
        {/* портрет */}
        <div
          className="shrink-0 w-24 h-28 border flex items-center justify-center relative"
          style={{
            borderColor: rank.color,
            background: `radial-gradient(circle at 50% 35%, rgba(${rank.glow},0.35), rgba(2,8,23,0.9) 70%)`,
          }}
        >
          <span
            className="text-5xl font-black"
            style={{
              color: "#fff",
              textShadow: `0 0 10px ${rank.color}, 0 0 24px rgba(${rank.glow},0.7)`,
            }}
          >
            {name.charAt(0).toUpperCase()}
          </span>
          <span
            className="absolute bottom-0 inset-x-0 text-center text-[8px] tracking-widest py-0.5 font-bold text-black"
            style={{ background: rank.color }}
          >
            LVL {level}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[8px] tracking-[0.2em] text-[#7fa8d6] uppercase">
            Позывной
          </div>
          <div
            className="text-lg font-black text-white truncate"
            style={{ textShadow: `0 0 8px rgba(${rank.glow},0.8)` }}
          >
            {name}
          </div>
          <div className="text-[9px] text-[#7fa8d6] tracking-widest truncate">
            ID: {player.authId || "—"}
          </div>
          {titleName && (
            <div
              className="text-[9px] tracking-[0.2em] uppercase mt-0.5 truncate"
              style={{ color: rank.color }}
            >
              « {titleName} »
            </div>
          )}
          <div className="mt-2 flex items-end gap-2">
            <span
              className="text-5xl leading-none font-black"
              style={{
                color: rank.color,
                textShadow: `0 0 12px rgba(${rank.glow},0.8)`,
              }}
            >
              {rank.letter}
            </span>
            <span className="text-[10px] tracking-[0.25em] uppercase pb-1 text-[#cfe6ff]">
              ранг
            </span>
          </div>
          <div
            className="mt-2 h-1.5 border bg-[#020817]"
            style={{ borderColor: `rgba(${rank.glow},0.5)` }}
          >
            <div
              className="h-full"
              style={{ width: `${Math.min(100, xp)}%`, background: rank.color }}
            />
          </div>
          <div className="text-[8px] text-[#7fa8d6] mt-0.5 text-right">
            {xp}/100 XP
          </div>
        </div>
      </div>

      <div className="relative mt-3 grid grid-cols-4 gap-1.5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="border px-1 py-1.5 text-center"
            style={{
              borderColor: `rgba(${rank.glow},0.35)`,
              background: `rgba(${rank.glow},0.05)`,
            }}
          >
            <s.icon
              className="w-3.5 h-3.5 mx-auto mb-0.5"
              style={{ color: rank.color }}
            />
            <div className="text-sm font-black text-white leading-tight">
              {s.value}
            </div>
            <div className="text-[7px] tracking-wider text-[#7fa8d6]">
              {s.label}
            </div>
          </div>
        ))}
      </div>
      {player.stats && (
        <div className="relative mt-1.5 grid grid-cols-4 gap-1.5">
          {[
            ["STR", "str"],
            ["AGI", "agi"],
            ["VIT", "vit"],
            ["INT", "int"],
          ].map(([label, key]) => (
            <div
              key={key}
              className="border px-1 py-1 text-center"
              style={{ borderColor: `rgba(${rank.glow},0.35)` }}
            >
              <div className="text-[7px] tracking-wider text-[#7fa8d6]">
                {label}
              </div>
              <div
                className="text-sm font-black leading-tight"
                style={{ color: rank.color }}
              >
                {player.stats[key] ?? 0}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* печать */}
      {/* печать */}
      <div className="pointer-events-none absolute -bottom-3 -right-3 w-20 h-20 opacity-60 rotate-12">
        <Seal color={rank.color} />
      </div>
    </div>
  );
}

export default function HunterIdCard({ player }) {
  const [open, setOpen] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, gx: 50, gy: 50 });
  const cardRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const onMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({
      x: (0.5 - py) * 18,
      y: (px - 0.5) * 22,
      gx: px * 100,
      gy: py * 100,
    });
  };

  if (!player) return null;
  const rank = rankFor(Number(player.level) || 1);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left cursor-pointer group"
        aria-label="Показать удостоверение на весь экран"
      >
        <CardFace player={player} />
        <div
          className="mt-1.5 flex items-center justify-center gap-1.5 text-[10px] tracking-[0.25em] uppercase group-hover:text-white transition"
          style={{ color: rank.color }}
        >
          <Maximize2 className="w-3 h-3" />
          Показать удостоверение
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
            onPointerMove={onMove}
            onPointerLeave={() => setTilt({ x: 0, y: 0, gx: 50, gy: 50 })}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 50%, rgba(${rank.glow},0.18), transparent 60%)`,
              }}
            />
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-[#7fa8d6] hover:text-white cursor-pointer"
              aria-label="Закрыть"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              ref={cardRef}
              initial={{ scale: 0.7, rotateX: 40, opacity: 0 }}
              animate={{ scale: 1, rotateX: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm sm:max-w-md"
              style={{ perspective: 900 }}
            >
              <div
                className="relative transition-transform duration-100 ease-out scale-[1.08] sm:scale-[1.18]"
                style={{
                  transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <CardFace player={player} />
                <div
                  className="pointer-events-none absolute inset-0 mix-blend-overlay"
                  style={{
                    background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.45), transparent 45%)`,
                  }}
                />
              </div>
            </motion.div>

            <div className="absolute bottom-6 inset-x-0 text-center text-[10px] tracking-[0.3em] uppercase text-[#5f86b3]">
              Нажмите, чтобы закрыть
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
