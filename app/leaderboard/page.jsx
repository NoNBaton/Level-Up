"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Flame, Crown } from "lucide-react";
import { AVATAR_STYLES, rankStyle } from "../components/PlayerCard";

const PLACE_STYLES = [
  "border-amber-400/70 bg-amber-950/30 shadow-[0_0_20px_rgba(251,191,36,0.25)]",
  "border-slate-300/60 bg-slate-800/40",
  "border-orange-400/60 bg-orange-950/25",
];

export default function LeaderboardPage() {
  const [players, setPlayers] = useState([]);
  const [me, setMe] = useState(null);
  const [state, setState] = useState("loading"); // loading | ok | error

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [lb, meRes] = await Promise.all([
          fetch("/api/leaderboard", { cache: "no-store" }),
          fetch("/api/me", { cache: "no-store" }),
        ]);
        if (cancelled) return;
        if (!lb.ok) {
          setState("error");
          return;
        }
        const data = await lb.json();
        setPlayers(Array.isArray(data.players) ? data.players : []);
        if (meRes.ok) {
          const m = await meRes.json();
          setMe(m.player?.nickname ?? null);
        }
        setState("ok");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-[100dvh] bg-black text-cyan-400 font-mono p-3 sm:p-6 flex justify-center relative">
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>

      <main className="w-full max-w-md relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-white tracking-widest uppercase transition"
          >
            <ArrowLeft className="w-4 h-4" />
            На главную
          </Link>
          <Link
            href="/profile"
            className="text-xs text-cyan-400 hover:text-white tracking-widest uppercase transition"
          >
            Мой профиль
          </Link>
        </div>

        <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-3">
          <Trophy className="w-5 h-5 text-amber-300" />
          <h1 className="text-sm font-black text-white tracking-[0.2em] uppercase">
            РЕЙТИНГ ОХОТНИКОВ
          </h1>
        </div>

        {state === "loading" && (
          <div className="text-center text-xs tracking-widest animate-pulse py-10">
            ЗАГРУЗКА РЕЙТИНГА...
          </div>
        )}

        {state === "error" && (
          <div className="text-center text-xs text-red-400 border border-red-500/40 rounded-xl p-4">
            НЕ УДАЛОСЬ ЗАГРУЗИТЬ РЕЙТИНГ
          </div>
        )}

        {state === "ok" && players.length === 0 && (
          <div className="text-center border border-dashed border-cyan-500/20 rounded-xl p-6 text-xs tracking-widest text-slate-600">
            // ПОКА НЕТ ОХОТНИКОВ
          </div>
        )}

        {state === "ok" && players.length > 0 && (
          <ol className="space-y-2">
            {players.map((p, i) => {
              const isMe = me && p.nickname === me;
              const place =
                i < 3 ? PLACE_STYLES[i] : "border-cyan-500/20 bg-slate-900/50";
              return (
                <li key={p.nickname}>
                  <Link
                    href={`/u/${encodeURIComponent(p.nickname)}`}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition hover:scale-[1.01] ${place} ${isMe ? "ring-1 ring-cyan-300" : ""}`}
                  >
                    <div className="w-7 text-center font-black text-sm text-white">
                      {i === 0 ? (
                        <Crown className="w-5 h-5 mx-auto text-amber-300" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <div
                      className={`w-9 h-9 shrink-0 rounded-lg border-2 flex items-center justify-center font-black text-sm ${AVATAR_STYLES[p.avatar] || AVATAR_STYLES.cyan}`}
                    >
                      {String(p.nickname).charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate tracking-wider">
                        {p.nickname}
                        {isMe && (
                          <span className="ml-1.5 text-[9px] text-cyan-300">
                            (ВЫ)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`px-1.5 py-px rounded border text-[8px] font-black tracking-widest ${rankStyle(p.rank)}`}
                        >
                          {p.rank}
                        </span>
                        <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5" />
                          {p.streak}D
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-white">
                        LVL {p.level}
                      </div>
                      <div className="text-[9px] text-cyan-500">{p.xp} XP</div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </main>
    </div>
  );
}
