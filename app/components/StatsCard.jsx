"use client";

import React from "react";
import { Flame, Trophy, Target, CalendarCheck } from "lucide-react";

export default function StatsCard({ player }) {
  const history = player.history || [];
  const totalDays = history.length;
  const perfectDays = history.filter(
    (d) => d.total > 0 && d.completed === d.total,
  ).length;
  const perfectPct =
    totalDays > 0 ? Math.round((perfectDays / totalDays) * 100) : 0;

  const items = [
    {
      Icon: Flame,
      label: "Текущий стрик",
      value: `${player.streak}D`,
    },
    {
      Icon: Trophy,
      label: "Лучший стрик",
      value: `${player.longestStreak ?? player.streak}D`,
    },
    {
      Icon: Target,
      label: "Всего миссий",
      value: player.completedTotal ?? "—",
    },
    {
      Icon: CalendarCheck,
      label: "Идеальных дней (7д)",
      value: `${perfectPct}%`,
    },
  ];

  return (
    <div className="bg-slate-900/40 border border-cyan-500/20 rounded-xl p-3">
      <div className="text-[10px] text-cyan-400/80 font-bold tracking-wider uppercase mb-2">
        Статистика
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map(({ Icon, label, value }) => (
          <div
            key={label}
            className="bg-slate-950/60 border border-cyan-500/20 rounded-lg p-2.5 flex items-center gap-2"
          >
            <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-black text-white leading-none">
                {value}
              </div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wide truncate">
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
