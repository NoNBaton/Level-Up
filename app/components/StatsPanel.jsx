"use client";

import React, { useState } from "react";
import { Dumbbell, Zap, Heart, Brain, Plus } from "lucide-react";

const STAT_META = [
  {
    key: "str",
    label: "СИЛА",
    short: "STR",
    icon: Dumbbell,
    hint: "урон по боссу",
  },
  {
    key: "agi",
    label: "ЛОВКОСТЬ",
    short: "AGI",
    icon: Zap,
    hint: "монеты за квесты",
  },
  {
    key: "vit",
    label: "ЖИВУЧЕСТЬ",
    short: "VIT",
    icon: Heart,
    hint: "штраф за пропуск",
  },
  {
    key: "int",
    label: "ИНТЕЛЛЕКТ",
    short: "INT",
    icon: Brain,
    hint: "XP за учёбу",
  },
];

export default function StatsPanel({ player, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const stats = player?.stats || { str: 0, agi: 0, vit: 0, int: 0 };
  const points = Number(player?.statPoints) || 0;

  const add = async (key) => {
    if (busy || points < 1) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stat: key, amount: 1 }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(String(data?.error || "ОШИБКА СИСТЕМЫ"));
        return;
      }
      onChange?.({ stats: data.stats, statPoints: data.statPoints });
    } catch {
      setError("НЕТ СВЯЗИ С СЕРВЕРОМ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border border-[#5ecbff]/40 bg-[#020817]/60 p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] tracking-[0.25em] uppercase text-[#7fa8d6]">
          ХАРАКТЕРИСТИКИ
        </div>
        <div
          className={`text-[10px] tracking-widest font-bold px-2 py-0.5 border ${
            points > 0
              ? "border-amber-400/70 text-amber-200 bg-amber-400/10 animate-pulse"
              : "border-[#5ecbff]/25 text-[#5f86b3]"
          }`}
        >
          ОЧКОВ: {points}
        </div>
      </div>

      <div className="space-y-2">
        {STAT_META.map(({ key, label, short, icon: Icon, hint }) => (
          <div
            key={key}
            className="flex items-center gap-2.5 border border-[#5ecbff]/25 bg-[#5ecbff]/[0.04] px-2.5 py-2"
          >
            <Icon className="w-4 h-4 shrink-0 text-[#5ecbff]" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-white tracking-wider">
                {label}{" "}
                <span className="text-[#5f86b3] font-normal">{short}</span>
              </div>
              <div className="text-[9px] text-[#7fa8d6] tracking-wider uppercase">
                {hint}
              </div>
            </div>
            <div className="text-xl font-black text-white w-8 text-center">
              {stats[key] ?? 0}
            </div>
            <button
              onClick={() => add(key)}
              disabled={busy || points < 1}
              aria-label={`Вложить очко: ${label}`}
              className="w-8 h-8 flex items-center justify-center border border-[#5ecbff]/60 text-[#cfe6ff] hover:bg-[#5ecbff] hover:text-[#020617] transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-2 text-[9px] text-[#5f86b3] tracking-wider text-center">
        +3 ОЧКА ЗА КАЖДЫЙ НОВЫЙ УРОВЕНЬ
      </div>

      {error && (
        <div className="mt-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-500/50 p-2 tracking-wider">
          {error}
        </div>
      )}
    </div>
  );
}
