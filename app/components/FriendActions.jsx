"use client";

import React, { useEffect, useState, useCallback } from "react";
import { UserPlus, Check, Clock, Users } from "lucide-react";

const EMOJIS = ["🔥", "💪", "👏", "⚡"];

const box = "bg-slate-900/40 border border-cyan-500/20 rounded-xl p-3";
const btn =
  "w-full flex items-center justify-center gap-2 border py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition disabled:opacity-50 cursor-pointer";

export default function FriendActions({ nickname }) {
  const [rel, setRel] = useState(null);
  const [react, setReact] = useState({
    counts: {},
    mine: null,
    canReact: false,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    try {
      const q = encodeURIComponent(nickname);
      const [a, b] = await Promise.all([
        fetch(`/api/friends/status?nickname=${q}`, { cache: "no-store" }),
        fetch(`/api/reactions?nickname=${q}`, { cache: "no-store" }),
      ]);
      if (a.ok) setRel(await a.json());
      if (b.ok) setReact(await b.json());
    } catch {
      // ignore
    }
  }, [nickname]);

  useEffect(() => {
    load();
  }, [load]);

  const post = async (url, body) => {
    if (busy) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) setMsg(String(j.error || "ОШИБКА СИСТЕМЫ"));
      await load();
    } catch {
      setMsg("НЕТ СВЯЗИ С СЕРВЕРОМ");
    } finally {
      setBusy(false);
    }
  };

  const relation = rel?.relation;
  const showHint =
    relation && relation !== "self" && relation !== "guest" && !react.canReact;

  return (
    <div className="space-y-4">
      {relation === "none" && (
        <button
          disabled={busy}
          onClick={() => post("/api/friends/request", { nickname })}
          className={`${btn} border-emerald-400/60 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/25`}
        >
          <UserPlus className="w-4 h-4" />
          Добавить в друзья
        </button>
      )}
      {relation === "incoming" && (
        <button
          disabled={busy}
          onClick={() =>
            post("/api/friends/respond", { id: rel.id, accept: true })
          }
          className={`${btn} border-emerald-400/60 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/25`}
        >
          <Check className="w-4 h-4" />
          Принять заявку
        </button>
      )}
      {relation === "outgoing" && (
        <div
          className={`${btn} border-slate-600 text-slate-400 cursor-default`}
        >
          <Clock className="w-4 h-4" />
          Заявка отправлена
        </div>
      )}
      {relation === "friends" && (
        <div
          className={`${btn} border-cyan-500/40 text-cyan-300 cursor-default`}
        >
          <Users className="w-4 h-4" />
          Вы друзья
        </div>
      )}

      <div className={box}>
        <div className="text-[10px] text-cyan-400/80 font-bold tracking-wider uppercase mb-2">
          Реакции
        </div>
        <div className="flex gap-2 justify-center flex-wrap">
          {EMOJIS.map((e) => {
            const count = react.counts?.[e] || 0;
            const active = react.mine === e;
            return (
              <button
                key={e}
                type="button"
                disabled={busy || !react.canReact}
                onClick={() => post("/api/reactions", { nickname, emoji: e })}
                className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-sm transition ${
                  active
                    ? "border-amber-400 bg-amber-400/15 text-amber-200"
                    : "border-cyan-500/30 bg-slate-950/60 text-cyan-100"
                } ${react.canReact ? "cursor-pointer hover:border-cyan-300" : "cursor-default opacity-80"}`}
              >
                <span>{e}</span>
                <span className="text-xs">{count}</span>
              </button>
            );
          })}
        </div>
        {showHint && (
          <div className="text-[10px] text-slate-500 text-center mt-2">
            РЕАГИРОВАТЬ МОГУТ ТОЛЬКО ДРУЗЬЯ
          </div>
        )}
        {msg && (
          <div className="text-[10px] text-red-400 text-center mt-2">{msg}</div>
        )}
      </div>
    </div>
  );
}
