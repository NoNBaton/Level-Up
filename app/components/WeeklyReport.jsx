"use client";

import React, { useState } from "react";
import { FileText, X } from "lucide-react";

const DAYS = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];

function dayLabel(raw) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw || "—").slice(-5);
  return DAYS[d.getDay()];
}

function gradeOf(pct, total) {
  if (!total)
    return { letter: "—", color: "#94a3b8", text: "НЕТ ДАННЫХ ЗА НЕДЕЛЮ" };
  if (pct >= 90)
    return {
      letter: "S",
      color: "#ffd34d",
      text: "БЕЗУПРЕЧНАЯ НЕДЕЛЯ. СИСТЕМА ВПЕЧАТЛЕНА.",
    };
  if (pct >= 75)
    return {
      letter: "A",
      color: "#ff9f43",
      text: "ОТЛИЧНЫЙ РЕЗУЛЬТАТ. ТАК ДЕРЖАТЬ.",
    };
  if (pct >= 55)
    return {
      letter: "B",
      color: "#c084fc",
      text: "СТАБИЛЬНО. ЕСТЬ КУДА РАСТИ.",
    };
  if (pct >= 35)
    return {
      letter: "C",
      color: "#5ecbff",
      text: "СРЕДНЕ. ПОДТЯНИТЕ ДИСЦИПЛИНУ.",
    };
  return {
    letter: "D",
    color: "#f87171",
    text: "СЛАБАЯ НЕДЕЛЯ. СИСТЕМА ЖДЁТ БОЛЬШЕГО.",
  };
}

export default function WeeklyReport({ player }) {
  const [open, setOpen] = useState(false);
  if (!player) return null;

  const history = Array.isArray(player.history) ? player.history : [];
  const done = history.reduce((s, d) => s + (Number(d.completed) || 0), 0);
  const total = history.reduce((s, d) => s + (Number(d.total) || 0), 0);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const activeDays = history.filter((d) => Number(d.completed) > 0).length;
  const perfectDays = history.filter(
    (d) => Number(d.total) > 0 && Number(d.completed) >= Number(d.total),
  ).length;

  let best = null;
  for (const d of history) {
    if (!best || Number(d.completed) > Number(best.completed)) best = d;
  }

  const grade = gradeOf(pct, total);
  const maxBar = Math.max(1, ...history.map((d) => Number(d.total) || 0));

  const rows = [
    ["ВЫПОЛНЕНО КВЕСТОВ", `${done} / ${total}`],
    ["ПРОЦЕНТ ВЫПОЛНЕНИЯ", `${pct}%`],
    ["АКТИВНЫХ ДНЕЙ", `${activeDays} / ${history.length || 7}`],
    ["ИДЕАЛЬНЫХ ДНЕЙ", perfectDays],
    [
      "ЛУЧШИЙ ДЕНЬ",
      best && best.completed > 0
        ? `${dayLabel(best.date)} · ${best.completed}`
        : "—",
    ],
    ["ТЕКУЩИЙ СТРИК", `${player.streak ?? 0}D`],
    [
      "РЕКОРД СТРИКА",
      `${Math.max(player.longestStreak ?? 0, player.streak ?? 0)}D`,
    ],
    ["УРОВЕНЬ / РАНГ", `${player.level} · ${player.rank}`],
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 border border-[#5ecbff]/50 bg-[#020817]/60 text-[#5ecbff] py-2.5 text-xs tracking-[0.2em] uppercase hover:bg-[#5ecbff]/10 transition cursor-pointer"
      >
        <FileText className="w-4 h-4" />
        ОТЧЁТ ОХОТНИКА
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-sm max-h-[92dvh] overflow-y-auto bg-[#020817] border p-4 space-y-4"
            style={{
              borderColor: grade.color,
              boxShadow: `0 0 24px ${grade.color}55`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-slate-400 hover:text-white cursor-pointer"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <div className="text-[9px] tracking-[0.3em] text-[#7fa8d6]">
                СИСТЕМА: ОТЧЁТ ОХОТНИКА
              </div>
              <div className="text-sm font-black text-white tracking-wider mt-1">
                {player.nickname}
              </div>
              <div className="text-[9px] tracking-widest text-[#5f86b3]">
                ПОСЛЕДНИЕ 7 ДНЕЙ
              </div>
            </div>

            <div
              className="flex items-center gap-4 border p-3"
              style={{ borderColor: `${grade.color}88` }}
            >
              <div
                className="text-6xl font-black leading-none"
                style={{
                  color: grade.color,
                  textShadow: `0 0 14px ${grade.color}`,
                }}
              >
                {grade.letter}
              </div>
              <div
                className="text-[10px] tracking-widest leading-snug"
                style={{ color: grade.color }}
              >
                {grade.text}
              </div>
            </div>

            {history.length > 0 && (
              <div>
                <div className="text-[9px] tracking-[0.2em] text-[#5f86b3] mb-1.5">
                  АКТИВНОСТЬ ПО ДНЯМ
                </div>
                <div className="flex items-end gap-1.5 h-24 border border-cyan-500/20 p-2">
                  {history.map((d, i) => {
                    const t = Number(d.total) || 0;
                    const c = Number(d.completed) || 0;
                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center justify-end h-full gap-1"
                      >
                        <div className="w-full flex-1 flex items-end bg-cyan-500/10">
                          <div
                            className="w-full"
                            style={{
                              height: `${(c / maxBar) * 100}%`,
                              background: grade.color,
                              minHeight: c > 0 ? 3 : 0,
                            }}
                            title={`${c}/${t}`}
                          />
                        </div>
                        <div className="text-[8px] text-[#7fa8d6]">
                          {dayLabel(d.date)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-1">
              {rows.map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between border-b border-cyan-500/15 py-1 text-[10px] tracking-wider"
                >
                  <span className="text-[#7fa8d6]">{k}</span>
                  <span className="font-bold text-white">{v}</span>
                </div>
              ))}
            </div>

            <div className="text-[9px] tracking-widest text-center text-slate-500">
              ОТЧЁТ СФОРМИРОВАН СИСТЕМОЙ
            </div>
          </div>
        </div>
      )}
    </>
  );
}
