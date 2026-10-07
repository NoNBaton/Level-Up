"use client";

import React, { useEffect, useState } from "react";
import { Lock, Check } from "lucide-react";
import { ITEMS, RARITY_COLOR, SOURCE_HINT } from "@/lib/items";

export default function CosmeticsPanel({ player, onChange }) {
  const [owned, setOwned] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/cosmetics", { cache: "no-store" });
        if (!res.ok) throw new Error("bad");
        const data = await res.json();
        if (!cancelled) setOwned(new Set(data.owned));
      } catch {
        if (!cancelled) setError("НЕ УДАЛОСЬ ЗАГРУЗИТЬ ИНВЕНТАРЬ");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const equip = async (slot, itemId) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/cosmetics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, itemId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(String(data?.error || "ОШИБКА СИСТЕМЫ"));
        return;
      }
      onChange?.({ frame: data.frame, title: data.title });
    } catch {
      setError("НЕТ СВЯЗИ С СЕРВЕРОМ");
    } finally {
      setBusy(false);
    }
  };

  const equippedFrame = player?.frame || "frame_rank";
  const equippedTitle = player?.title || "";

  const Tile = ({ item }) => {
    const has = owned?.has(item.id);
    const equipped =
      item.type === "frame"
        ? equippedFrame === item.id
        : equippedTitle === item.id;
    const color = item.color || RARITY_COLOR[item.rarity];
    return (
      <button
        onClick={() => has && !equipped && equip(item.type, item.id)}
        disabled={!has || busy}
        className={`relative text-left border px-2 py-2 transition ${
          has
            ? "cursor-pointer hover:bg-white/5"
            : "opacity-40 cursor-not-allowed"
        }`}
        style={{
          borderColor: equipped ? color : `${color}66`,
          boxShadow: equipped ? `0 0 10px ${color}88` : "none",
        }}
      >
        <div className="text-[10px] font-bold tracking-wider text-white leading-tight pr-4">
          {item.name}
        </div>
        <div className="text-[8px] tracking-widest mt-0.5" style={{ color }}>
          {has ? (equipped ? "НАДЕТО" : "ВЫБРАТЬ") : SOURCE_HINT[item.source]}
        </div>
        <div className="absolute top-1.5 right-1.5" style={{ color }}>
          {has ? (
            equipped ? (
              <Check className="w-3 h-3" />
            ) : null
          ) : (
            <Lock className="w-3 h-3" />
          )}
        </div>
      </button>
    );
  };

  const frames = ITEMS.filter((i) => i.type === "frame");
  const titles = ITEMS.filter((i) => i.type === "title");

  return (
    <div className="border border-[#5ecbff]/40 bg-[#020817]/60 p-3">
      <div className="text-[10px] tracking-[0.25em] uppercase text-[#7fa8d6] mb-3">
        ИНВЕНТАРЬ
      </div>

      {!owned && !error && (
        <div className="text-center text-[10px] tracking-widest animate-pulse py-4">
          ЗАГРУЗКА...
        </div>
      )}

      {owned && (
        <>
          <div className="text-[9px] tracking-[0.2em] text-[#5f86b3] mb-1.5">
            РАМКИ УДОСТОВЕРЕНИЯ
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {frames.map((it) => (
              <Tile key={it.id} item={it} />
            ))}
          </div>

          <div className="text-[9px] tracking-[0.2em] text-[#5f86b3] mb-1.5">
            ТИТУЛЫ
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => equippedTitle !== "" && equip("title", "")}
              disabled={busy}
              className="text-left border px-2 py-2 cursor-pointer hover:bg-white/5"
              style={{
                borderColor: equippedTitle === "" ? "#94a3b8" : "#94a3b866",
              }}
            >
              <div className="text-[10px] font-bold tracking-wider text-white">
                БЕЗ ТИТУЛА
              </div>
              <div className="text-[8px] tracking-widest mt-0.5 text-slate-400">
                {equippedTitle === "" ? "НАДЕТО" : "ВЫБРАТЬ"}
              </div>
            </button>
            {titles.map((it) => (
              <Tile key={it.id} item={it} />
            ))}
          </div>
        </>
      )}

      {error && (
        <div className="mt-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-500/50 p-2 tracking-wider">
          {error}
        </div>
      )}
    </div>
  );
}
