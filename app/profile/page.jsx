"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Copy, Check } from "lucide-react";
import PlayerCard from "../components/PlayerCard";

export default function ProfilePage() {
  const [player, setPlayer] = useState(null);
  const [state, setState] = useState("loading"); // loading | ok | guest | error
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setPlayer(data.player);
          setState("ok");
        } else if (res.status === 401) {
          setState("guest");
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
  }, []);

  const copyLink = async () => {
    try {
      const url = `${window.location.origin}/u/${encodeURIComponent(player.nickname)}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

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
            href="/leaderboard"
            className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-white tracking-widest uppercase transition"
          >
            <Trophy className="w-4 h-4" />
            Рейтинг
          </Link>
        </div>

        {state === "loading" && (
          <div className="text-center text-xs tracking-widest animate-pulse py-10">
            ЗАГРУЗКА ПРОФИЛЯ...
          </div>
        )}

        {state === "guest" && (
          <div className="text-center border border-dashed border-cyan-500/30 rounded-xl p-6 text-xs tracking-widest">
            ВЫ НЕ АВТОРИЗОВАНЫ.
            <br />
            <Link href="/" className="underline text-cyan-300 hover:text-white">
              ВОЙТИ В СИСТЕМУ
            </Link>
          </div>
        )}

        {state === "error" && (
          <div className="text-center text-xs text-red-400 border border-red-500/40 rounded-xl p-4">
            НЕ УДАЛОСЬ ЗАГРУЗИТЬ ПРОФИЛЬ
          </div>
        )}

        {state === "ok" && player && (
          <>
            <PlayerCard
              player={player}
              editable
              onSaved={(v) => setPlayer((p) => ({ ...p, ...v }))}
            />
            <button
              onClick={copyLink}
              className="w-full flex items-center justify-center gap-2 bg-slate-900/60 border border-cyan-500/30 text-cyan-300 py-2.5 rounded-xl text-xs tracking-wider uppercase hover:bg-cyan-950/40 transition cursor-pointer"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "ССЫЛКА СКОПИРОВАНА" : "СКОПИРОВАТЬ ССЫЛКУ НА ПРОФИЛЬ"}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
