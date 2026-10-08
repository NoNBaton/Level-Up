"use client";

import React, { useEffect, useState } from "react";
import { Lock, Check } from "lucide-react";
import { ITEMS, RARITY_COLOR, SOURCE_HINT } from "@/lib/items";
import ItemPreview from "./ItemPreview";

export default function CosmeticsPanel({ player, onChange }) {
  const [owned, setOwned] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

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
      onChange?.({ frame: data.frame, title: data.title, pet: data.pet });
    } catch {
      setError("НЕТ СВЯЗИ С СЕРВЕРОМ");
    } finally {
      setBusy(false);
    }
  };

  const equippedOf = {
    frame: player?.frame || "frame_rank",
    title: player?.title || "",
    pet: player?.pet || "",
  };

  const Tile = ({ item }) => {
    const has = owned?.has(item.id);
    const equipped = equippedOf[item.type] === item.id;
    const color = item.color || RARITY_COLOR[item.rarity];
    return (
      <button
        onClick={() => setPreview(item)}
        disabled={busy}
        className={`relative text-left border px-2 py-2 transition flex items-center gap-2 cursor-pointer hover:bg-white/5 ${
          has ? "" : "opacity-50"
        }`}
        style={{
          borderColor: equipped ? color : `${color}66`,
          boxShadow: equipped ? `0 0 10px ${color}88` : "none",
        }}
      >
        {item.emoji && (
          <span
            className="text-2xl leading-none"
            style={{
              filter: has ? `drop-shadow(0 0 4px ${color})` : "grayscale(1)",
            }}
          >
            {item.emoji}
          </span>
        )}
        <div className="min-w-0 flex-1 pr-3">
          <div className="text-[10px] font-bold tracking-wider text-white leading-tight">
            {item.name}
          </div>
          <div className="text-[8px] tracking-widest mt-0.5" style={{ color }}>
            {has ? (equipped ? "НАДЕТО" : "ВЫБРАТЬ") : SOURCE_HINT[item.source]}
          </div>
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

  const NoneTile = ({ slot, label }) => {
    const active = equippedOf[slot] === "";
    return (
      <button
        onClick={() => !active && equip(slot, "")}
        disabled={busy}
        className="text-left border px-2 py-2 cursor-pointer hover:bg-white/5"
        style={{ borderColor: active ? "#94a3b8" : "#94a3b866" }}
      >
        <div className="text-[10px] font-bold tracking-wider text-white">
          {label}
        </div>
        <div className="text-[8px] tracking-widest mt-0.5 text-slate-400">
          {active ? "НАДЕТО" : "ВЫБРАТЬ"}
        </div>
      </button>
    );
  };

  const Section = ({ title, items, none }) => {
    const have = items.filter((i) => owned?.has(i.id)).length;
    return (
      <div className="mb-4 last:mb-0">
        <div className="text-[9px] tracking-[0.2em] text-[#5f86b3] mb-1.5">
          {title} · {have}/{items.length}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {none}
          {items.map((it) => (
            <Tile key={it.id} item={it} />
          ))}
        </div>
      </div>
    );
  };

  const frames = ITEMS.filter((i) => i.type === "frame");
  const pets = ITEMS.filter((i) => i.type === "pet");
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
          <Section
            title="ПИТОМЦЫ"
            items={pets}
            none={<NoneTile slot="pet" label="БЕЗ ПИТОМЦА" />}
          />
          <Section title="РАМКИ УДОСТОВЕРЕНИЯ" items={frames} />
          <Section
            title="ТИТУЛЫ"
            items={titles}
            none={<NoneTile slot="title" label="БЕЗ ТИТУЛА" />}
          />
        </>
      )}

      {error && (
        <div className="mt-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-500/50 p-2 tracking-wider">
          {error}
        </div>
      )}

      <ItemPreview
        item={preview}
        nickname={player?.nickname}
        onClose={() => setPreview(null)}
      >
        {preview && owned?.has(preview.id) ? (
          equippedOf[preview.type] === preview.id ? (
            <div className="text-center text-[10px] tracking-widest text-emerald-300 border border-emerald-400/40 py-2">
              УЖЕ НАДЕТО
            </div>
          ) : (
            <button
              onClick={async () => {
                await equip(preview.type, preview.id);
                setPreview(null);
              }}
              disabled={busy}
              className="w-full text-[11px] font-bold tracking-wider border border-cyan-400 text-cyan-200 py-2 hover:bg-cyan-400 hover:text-slate-950 transition cursor-pointer"
            >
              НАДЕТЬ
            </button>
          )
        ) : (
          <div className="text-center text-[10px] tracking-widest text-slate-400 border border-slate-600/50 py-2">
            НЕ ПОЛУЧЕНО · {preview ? SOURCE_HINT[preview.source] : ""}
          </div>
        )}
      </ItemPreview>
    </div>
  );
}
