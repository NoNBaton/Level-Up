"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Trophy } from "lucide-react";
import PlayerCard from "../../components/PlayerCard";

export default function PublicProfilePage() {
  const params = useParams();
  const raw = Array.isArray(params.nickname)
    ? params.nickname[0]
    : params.nickname;

  const [player, setPlayer] = useState(null);
  const [state, setState] = useState("loading"); // loading | ok | notfound | error

  useEffect(() => {
    if (!raw) return;
    let cancelled = false;

    let name = raw;
    try {
      name = decodeURIComponent(raw);
    } catch {
      // уже раскодировано
    }

    (async () => {
      try {
        const res = await fetch(`/api/profile/${encodeURIComponent(name)}`, {
          cache: "no-store",
        });
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setPlayer(data.player);
          setState("ok");
        } else if (res.status === 404) {
          setState("notfound");
        } else {
          setState("error");
        }
      } catch {
        if (!cancelled) setState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [raw]);

  return (
    <div className="min-h-[100dvh] bg-black text-cyan-400 font-mono p-3 sm:p-6 flex justify-center relative">
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>

      <main className="w-full max-w-md relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/leaderboard"
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-white tracking-widest uppercase transition"
          >
            <ArrowLeft className="w-4 h-4" />К рейтингу
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-white tracking-widest uppercase transition"
          >
            <Trophy className="w-4 h-4" />
            На главную
          </Link>
        </div>

        {state === "loading" && (
          <div className="text-center text-xs tracking-widest animate-pulse py-10">
            ЗАГРУЗКА ДОСЬЕ...
          </div>
        )}

        {state === "notfound" && (
          <div className="text-center border border-dashed border-red-500/40 rounded-xl p-6 text-xs tracking-widest text-red-400">
            ОХОТНИК НЕ НАЙДЕН
          </div>
        )}

        {state === "error" && (
          <div className="text-center text-xs text-red-400 border border-red-500/40 rounded-xl p-4">
            НЕ УДАЛОСЬ ЗАГРУЗИТЬ ПРОФИЛЬ
          </div>
        )}

        {state === "ok" && player && <PlayerCard player={player} />}
      </main>
    </div>
  );
}
