"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Coins, Check, Gift } from "lucide-react";
import { ITEMS, RARITY_COLOR } from "@/lib/items";
import { BOX_INFO, BOX_TIERS } from "@/lib/lootboxes";
import ItemPreview from "../components/ItemPreview";
import CardBackground from "../components/CardBackground";
import LootboxPreview from "../components/LootboxPreview";

const RARITY_LABEL = {
  common: "ОБЫЧНЫЙ",
  rare: "РЕДКИЙ",
  epic: "ЭПИЧЕСКИЙ",
  legendary: "ЛЕГЕНДАРНЫЙ",
};

export default function ShopPage() {
  const [state, setState] = useState("loading"); // loading | ok | guest | error
  const [coins, setCoins] = useState(0);
  const [owned, setOwned] = useState(new Set());
  const [boxes, setBoxes] = useState({ normal: 0, rare: 0, legendary: 0 });
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState(null);
  const [boxPreview, setBoxPreview] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/shop", { cache: "no-store" });
        if (cancelled) return;
        if (res.status === 401) return setState("guest");
        if (!res.ok) return setState("error");
        const data = await res.json();
        setCoins(data.coins);
        setOwned(new Set(data.owned));
        setState("ok");
      } catch {
        if (!cancelled) setState("error");
      }
      // количество коробок: не критично, если не загрузится
      try {
        const r2 = await fetch("/api/lootbox", { cache: "no-store" });
        if (!cancelled && r2.ok) {
          const d2 = await r2.json();
          if (d2.boxes) setBoxes(d2.boxes);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const buy = async (item) => {
    if (busyId) return;
    setBusyId(item.id);
    setMsg("");
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setMsg(String(data?.error || "ОШИБКА СИСТЕМЫ"));
        return;
      }
      setCoins(data.coins);
      setOwned(new Set(data.owned));
      setMsg(`КУПЛЕНО: ${item.name}. НАДЕТЬ МОЖНО В ПРОФИЛЕ`);
    } catch {
      setMsg("НЕТ СВЯЗИ С СЕРВЕРОМ");
    } finally {
      setBusyId(null);
    }
  };

  const buyBox = async (tier) => {
    if (busyId) return;
    setBusyId(`box_${tier}`);
    setMsg("");
    try {
      const res = await fetch("/api/lootbox/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setMsg(String(data?.error || "ОШИБКА СИСТЕМЫ"));
        return;
      }
      setCoins(data.coins);
      setBoxes(data.boxes);
      setMsg(
        `КУПЛЕНО: ${BOX_INFO[tier].name}. ОТКРЫТЬ МОЖНО В РАЗДЕЛЕ ЛУТБОКСЫ`,
      );
    } catch {
      setMsg("НЕТ СВЯЗИ С СЕРВЕРОМ");
    } finally {
      setBusyId(null);
    }
  };

  const goods = ITEMS.filter((i) => i.source === "shop" && i.price).sort(
    (a, b) => a.price - b.price,
  );
  const pets = goods.filter((i) => i.type === "pet");
  const frames = goods.filter((i) => i.type === "frame");
  const titles = goods.filter((i) => i.type === "title");
  const bgs = goods.filter((i) => i.type === "bg");

  const BoxCard = ({ tier }) => {
    const info = BOX_INFO[tier];
    const canBuy = coins >= info.price;
    return (
      <div
        onClick={() => setBoxPreview(tier)}
        className="border cursor-pointer bg-[#020817]/70 p-2 flex flex-col gap-2"
        style={{ borderColor: `${info.color}88` }}
      >
        <div
          className="h-12 flex items-center justify-center"
          style={{ filter: `drop-shadow(0 0 8px ${info.color})` }}
        >
          <Gift className="w-9 h-9" style={{ color: info.color }} />
        </div>
        <div>
          <div className="text-[10px] font-bold text-white tracking-wider leading-tight">
            {info.name}
          </div>
          <div
            className="text-[8px] tracking-widest mt-0.5"
            style={{ color: info.color }}
          >
            В НАЛИЧИИ: {boxes[tier] ?? 0}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            buyBox(tier);
          }}
          disabled={!canBuy || !!busyId}
          className="flex items-center justify-center gap-1 text-[11px] font-bold tracking-wider border border-amber-400/70 text-amber-200 py-1.5 hover:bg-amber-400 hover:text-slate-950 transition disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
        >
          <Coins className="w-3.5 h-3.5" />
          {busyId === `box_${tier}` ? "..." : info.price}
        </button>
      </div>
    );
  };

  const Card = ({ item }) => {
    const has = owned.has(item.id);
    const color = item.color || RARITY_COLOR[item.rarity];
    const canBuy = !has && coins >= item.price;
    return (
      <div
        onClick={() => setPreview(item)}
        className="border cursor-pointer bg-[#020817]/70 p-2.5 flex flex-col gap-2"
        style={{ borderColor: `${color}88` }}
      >
        {item.type === "frame" && (
          <div
            className="h-10 border-2 flex items-center justify-center text-[9px] tracking-widest text-white"
            style={{ borderColor: color, boxShadow: `0 0 10px ${color}99` }}
          >
            РАМКА
          </div>
        )}
        {item.type === "title" && (
          <div
            className="h-10 flex items-center justify-center text-[10px] tracking-[0.15em] text-center"
            style={{ color }}
          >
            « {item.name} »
          </div>
        )}
        {item.type === "pet" && (
          <div
            className="h-10 flex items-center justify-center text-4xl"
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          >
            {item.emoji}
          </div>
        )}
        {item.type === "bg" && (
          <div
            className="relative isolate h-12 border overflow-hidden"
            style={{ borderColor: `${color}88` }}
          >
            <CardBackground id={item.id} glow="94,203,255" z="z-0" />
          </div>
        )}
        <div>
          <div className="text-[11px] font-bold text-white tracking-wider leading-tight">
            {item.name}
          </div>
          <div className="text-[8px] tracking-widest" style={{ color }}>
            {RARITY_LABEL[item.rarity]}
          </div>
        </div>
        {has ? (
          <div className="flex items-center justify-center gap-1 text-[10px] tracking-widest text-emerald-300 border border-emerald-400/40 py-1.5">
            <Check className="w-3 h-3" /> В ИНВЕНТАРЕ
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              buy(item);
            }}
            disabled={!canBuy || !!busyId}
            className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-wider border border-amber-400/70 text-amber-200 py-1.5 hover:bg-amber-400 hover:text-slate-950 transition disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5" />
            {busyId === item.id ? "..." : item.price}
          </button>
        )}
      </div>
    );
  };

  const Group = ({ title, items }) => (
    <div>
      <div className="text-[10px] tracking-[0.2em] text-[#5f86b3] mb-2">
        {title}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map((it) => (
          <Card key={it.id} item={it} />
        ))}
      </div>
    </div>
  );

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

        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
          <h1 className="text-sm font-black text-white tracking-[0.2em] uppercase">
            МАГАЗИН СИСТЕМЫ
          </h1>
          <div className="flex items-center gap-1.5 border border-amber-400/60 bg-amber-400/10 text-amber-200 px-2.5 py-1 text-xs font-bold">
            <Coins className="w-3.5 h-3.5" />
            {coins}
          </div>
        </div>

        {state === "loading" && (
          <div className="text-center text-xs tracking-widest animate-pulse py-10">
            ЗАГРУЗКА МАГАЗИНА...
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
            НЕ УДАЛОСЬ ЗАГРУЗИТЬ МАГАЗИН
          </div>
        )}

        {state === "ok" && (
          <>
            <div className="text-[10px] text-[#7fa8d6] tracking-wider text-center">
              КВЕСТ +5 · АНОМАЛИЯ +40 · БОСС НЕДЕЛИ +100
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] tracking-[0.2em] text-[#5f86b3]">
                  ЛУТБОКСЫ
                </div>
                <Link
                  href="/lootbox"
                  className="text-[10px] tracking-widest text-amber-300 hover:text-white underline"
                >
                  ОТКРЫТЬ МОИ
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {BOX_TIERS.map((t) => (
                  <BoxCard key={t} tier={t} />
                ))}
              </div>
            </div>

            <Group title="ПИТОМЦЫ" items={pets} />
            <Group title="РАМКИ УДОСТОВЕРЕНИЯ" items={frames} />
            <Group title="ФОНЫ УДОСТОВЕРЕНИЯ" items={bgs} />
            <Group title="ТИТУЛЫ" items={titles} />
            <div className="text-[9px] text-[#5f86b3] tracking-wider text-center">
              ЧАСТЬ ПРЕДМЕТОВ ОТКРЫВАЕТСЯ ДОСТИЖЕНИЯМИ, ЧАСТЬ ВЫПАДАЕТ ИЗ
              ЛУТБОКСОВ
            </div>
            {msg && (
              <div className="text-xs text-cyan-200 bg-cyan-950/40 border border-cyan-500/40 p-2.5 tracking-wider text-center">
                {msg}
              </div>
            )}
          </>
        )}

        <ItemPreview item={preview} onClose={() => setPreview(null)}>
          {preview &&
            (owned.has(preview.id) ? (
              <div className="text-center text-[10px] tracking-widest text-emerald-300 border border-emerald-400/40 py-2">
                В ИНВЕНТАРЕ
              </div>
            ) : (
              <button
                onClick={async () => {
                  await buy(preview);
                  setPreview(null);
                }}
                disabled={coins < preview.price || !!busyId}
                className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-wider border border-amber-400/70 text-amber-200 py-2 hover:bg-amber-400 hover:text-slate-950 transition disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
              >
                <Coins className="w-3.5 h-3.5" /> КУПИТЬ ЗА {preview.price}
              </button>
            ))}
        </ItemPreview>

        <LootboxPreview
          tier={boxPreview}
          owned={owned}
          onClose={() => setBoxPreview(null)}
        >
          {boxPreview && (
            <button
              onClick={async () => {
                await buyBox(boxPreview);
              }}
              disabled={coins < BOX_INFO[boxPreview].price || !!busyId}
              className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-wider border border-amber-400/70 text-amber-200 py-2 hover:bg-amber-400 hover:text-slate-950 transition disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5" /> КУПИТЬ ЗА{" "}
              {BOX_INFO[boxPreview].price}
            </button>
          )}
        </LootboxPreview>
      </main>
    </div>
  );
}
