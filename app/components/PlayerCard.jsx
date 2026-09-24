"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Flame,
  Calendar,
  Zap,
  Crown,
  Trophy,
  Star,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";

export const AVATAR_STYLES = {
  cyan: "border-cyan-400 text-cyan-300 bg-cyan-500/15 shadow-[0_0_20px_rgba(34,211,238,0.45)]",
  emerald:
    "border-emerald-400 text-emerald-300 bg-emerald-500/15 shadow-[0_0_20px_rgba(52,211,153,0.45)]",
  amber:
    "border-amber-400 text-amber-300 bg-amber-500/15 shadow-[0_0_20px_rgba(251,191,36,0.45)]",
  fuchsia:
    "border-fuchsia-400 text-fuchsia-300 bg-fuchsia-500/15 shadow-[0_0_20px_rgba(217,70,239,0.45)]",
  rose: "border-rose-400 text-rose-300 bg-rose-500/15 shadow-[0_0_20px_rgba(251,113,133,0.45)]",
  blue: "border-blue-400 text-blue-300 bg-blue-500/15 shadow-[0_0_20px_rgba(96,165,250,0.45)]",
};

export const AVATAR_KEYS = Object.keys(AVATAR_STYLES);

export function rankStyle(rank = "E-РАНГ") {
  const c = String(rank).charAt(0);
  if (c === "S")
    return "text-fuchsia-400 border-fuchsia-400 bg-fuchsia-950/40 shadow-[0_0_15px_rgba(217,70,239,0.5)]";
  if (c === "A")
    return "text-amber-300 border-amber-400 bg-amber-950/40 shadow-[0_0_15px_rgba(251,191,36,0.4)]";
  if (c === "B") return "text-purple-300 border-purple-400 bg-purple-950/40";
  if (c === "C") return "text-blue-300 border-blue-400 bg-blue-950/40";
  if (c === "D") return "text-cyan-300 border-cyan-400 bg-cyan-950/40";
  return "text-slate-300 border-slate-500 bg-slate-900/60";
}

const ACH_META = {
  first_task: { title: "ПЕРВЫЙ ШАГ", desc: "Первая миссия", Icon: Zap },
  streak_3: { title: "НАБИРАЯ ХОД", desc: "Стрик 3 дня", Icon: Flame },
  streak_7: { title: "КИБЕР-ВОИН", desc: "Стрик 7 дней", Icon: ShieldCheck },
  streak_30: { title: "ЛЕГЕНДА СИСТЕМЫ", desc: "Стрик 30 дней", Icon: Crown },
  level_5: { title: "ВЕТЕРАН КОДА", desc: "5 уровень", Icon: Star },
  level_25: { title: "ПОВЕЛИТЕЛЬ СИСТЕМЫ", desc: "25 уровень", Icon: Trophy },
  day_complete: {
    title: "ДЕНЬ ЗАКРЫТ",
    desc: "100% за день",
    Icon: CheckCircle2,
  },
};

export default function PlayerCard({ player, editable = false, onSaved }) {
  const [bio, setBio] = useState(player.bio || "");
  const [avatar, setAvatar] = useState(player.avatar || "cyan");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const shownAvatar = editable ? avatar : player.avatar || "cyan";
  const shownBio = editable ? bio : player.bio;
  const avatarClass = AVATAR_STYLES[shownAvatar] || AVATAR_STYLES.cyan;
  const unlocked = player.achievements || [];
  const history = player.history || [];

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, avatar }),
      });
      if (res.ok) {
        setMsg("ПРОФИЛЬ СОХРАНЁН");
        onSaved?.({ bio, avatar });
      } else {
        setMsg("ОШИБКА СОХРАНЕНИЯ");
      }
    } catch {
      setMsg("НЕТ СВЯЗИ С СЕРВЕРОМ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Шапка */}
      <div className="bg-gradient-to-r from-slate-900/90 to-cyan-950/40 border border-cyan-500/30 rounded-2xl p-4 flex items-center gap-4">
        <div
          className={`w-16 h-16 shrink-0 rounded-2xl border-2 flex items-center justify-center text-2xl font-black ${avatarClass}`}
        >
          {String(player.nickname).charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-black text-white tracking-widest truncate">
            {player.nickname}
          </h1>
          <div className="text-[10px] text-cyan-500 tracking-widest">
            {player.authId}
          </div>
          <div
            className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded border text-[10px] font-black tracking-widest ${rankStyle(player.rank)}`}
          >
            <ShieldAlert className="w-3 h-3" />
            {player.rank}
          </div>
        </div>
      </div>

      {/* Статы */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900/60 border border-cyan-500/20 rounded-xl p-3 text-center">
          <div className="text-[9px] text-cyan-500/80 tracking-widest uppercase">
            Уровень
          </div>
          <div className="text-2xl font-black text-white">{player.level}</div>
        </div>
        <div className="bg-slate-900/60 border border-cyan-500/20 rounded-xl p-3 text-center">
          <div className="text-[9px] text-cyan-500/80 tracking-widest uppercase">
            XP
          </div>
          <div className="text-2xl font-black text-white">
            {player.xp}
            <span className="text-xs text-slate-500">/100</span>
          </div>
        </div>
        <div className="bg-slate-900/60 border border-cyan-500/20 rounded-xl p-3 text-center">
          <div className="text-[9px] text-cyan-500/80 tracking-widest uppercase">
            Стрик
          </div>
          <div className="text-2xl font-black text-white flex items-center justify-center gap-1">
            <Flame className="w-4 h-4 text-cyan-400" />
            {player.streak}
          </div>
        </div>
      </div>

      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-cyan-500/30">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 rounded-full"
          style={{ width: `${Math.min(100, player.xp)}%` }}
        />
      </div>

      {/* О себе */}
      <div className="bg-slate-900/40 border border-cyan-500/20 rounded-xl p-3">
        <div className="text-[10px] text-cyan-400/80 font-bold tracking-wider uppercase mb-2">
          О себе
        </div>
        {editable ? (
          <>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={140}
              rows={3}
              placeholder="Расскажите о себе (до 140 символов)..."
              className="w-full bg-slate-950/80 border border-cyan-500/30 rounded-lg p-2 text-xs text-cyan-100 placeholder-slate-600 outline-none focus:border-cyan-400 resize-none font-mono"
            />
            <div className="text-[9px] text-slate-500 text-right">
              {bio.length}/140
            </div>

            <div className="text-[10px] text-cyan-400/80 font-bold tracking-wider uppercase mt-2 mb-2">
              Цвет аватара
            </div>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_KEYS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setAvatar(k)}
                  className={`w-8 h-8 rounded-lg border-2 text-xs font-black cursor-pointer ${AVATAR_STYLES[k]} ${avatar === k ? "scale-110" : "opacity-50"}`}
                >
                  {String(player.nickname).charAt(0)}
                </button>
              ))}
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="w-full mt-3 bg-cyan-500/15 border border-cyan-400/60 text-cyan-200 font-bold py-2 rounded-lg text-xs tracking-wider uppercase hover:bg-cyan-500/25 transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? "СОХРАНЕНИЕ..." : "СОХРАНИТЬ ПРОФИЛЬ"}
            </button>
            {msg && (
              <div className="text-[10px] text-cyan-300 mt-2 text-center">
                {msg}
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-cyan-100/90 break-words">
            {shownBio || "// ОХОТНИК НИЧЕГО О СЕБЕ НЕ НАПИСАЛ"}
          </p>
        )}
      </div>

      {/* История */}
      <div className="bg-slate-900/40 border border-cyan-500/20 rounded-xl p-3">
        <div className="text-[10px] text-cyan-400/80 font-bold tracking-wider uppercase flex items-center gap-1.5 mb-2">
          <Calendar className="w-3.5 h-3.5" />
          Активность за неделю
        </div>
        {history.length === 0 ? (
          <div className="text-center text-[10px] text-slate-600 py-3">
            // НЕТ ДАННЫХ
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1.5">
            {history.map((d) => {
              const full = d.total > 0 && d.completed === d.total;
              const pct =
                d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0;
              return (
                <div key={d.date} className="flex flex-col items-center gap-1">
                  <div className="w-full h-14 bg-slate-950 border border-cyan-500/20 rounded-md flex items-end overflow-hidden">
                    <div
                      className={`w-full ${full ? "bg-cyan-400" : "bg-cyan-700/60"}`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-slate-500">
                    {String(d.date).slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Достижения */}
      <div className="bg-slate-900/40 border border-cyan-500/20 rounded-xl p-3">
        <div className="text-[10px] text-cyan-400/80 font-bold tracking-wider uppercase mb-2">
          Достижения ({unlocked.filter((a) => ACH_META[a]).length}/
          {Object.keys(ACH_META).length})
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {Object.entries(ACH_META).map(([id, m]) => {
            const has = unlocked.includes(id);
            const { Icon } = m;
            return (
              <div
                key={id}
                className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs ${
                  has
                    ? "bg-cyan-950/30 border-cyan-500/40 text-cyan-100"
                    : "bg-slate-950/50 border-slate-800 text-slate-600"
                }`}
              >
                {has ? (
                  <Icon className="w-4 h-4 text-cyan-300 shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="font-bold tracking-wider">{m.title}</div>
                  <div className="text-[10px] opacity-70">{m.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-600 tracking-widest">
        В СИСТЕМЕ С {new Date(player.createdAt).toLocaleDateString("ru-RU")}
      </div>
    </div>
  );
}
