"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { ArrowLeft, Gift, Coins, Eye } from "lucide-react";
import { RARITY_COLOR } from "@/lib/items";
import {
  ChargeBox,
  RevealFx,
  RarityBanner,
  Shine,
  vibrateFor,
} from "../components/LootboxFx";
import {
  BOX_INFO,
  BOX_TIERS,
  RARITIES,
  poolFor,
  tierChances,
} from "@/lib/lootboxes";
import CardBackground from "../components/CardBackground";
import LootboxPreview from "../components/LootboxPreview";

const RARITY_LABEL = {
  common: "ОБЫЧНЫЙ",
  rare: "РЕДКИЙ",
  epic: "ЭПИЧЕСКИЙ",
  legendary: "ЛЕГЕНДАРНЫЙ",
};

const TYPE_LABEL = {
  frame: "РАМКА",
  title: "ТИТУЛ",
  pet: "ПИТОМЕЦ",
  bg: "ФОН",
};

// Параметры рулетки
const TILE = 96;
const GAP = 8;
const STEP = TILE + GAP;
const WIN_INDEX = 44;
const REEL_LEN = 56;
const SPIN_SECONDS = 6.5;

// Параметры открытия
const SHAKE_MS = 1600; // зарядка
const BURST_MS = 900; // взрыв

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function buildReel(tier, winItem) {
  const pool = poolFor(tier);
  const ch = tierChances(tier);
  const pick = () => {
    let n = Math.random() * 100;
    let rarity = "common";
    for (const k of RARITIES) {
      if (ch[k] <= 0) continue;
      rarity = k;
      n -= ch[k];
      if (n < 0) break;
    }
    const list = pool.filter((i) => i.rarity === rarity);
    const src = list.length ? list : pool;
    return src[Math.floor(Math.random() * src.length)];
  };
  const items = Array.from({ length: REEL_LEN }, pick);
  items[WIN_INDEX] = winItem;
  return items;
}

function ReelTile({ item }) {
  const c = item.color || RARITY_COLOR[item.rarity];
  return (
    <div
      className="shrink-0 border flex flex-col items-center justify-center text-center overflow-hidden relative"
      style={{
        width: TILE,
        height: 112,
        borderColor: `${c}99`,
        background: `linear-gradient(180deg, ${c}1f, rgba(2,8,23,0.95) 75%)`,
      }}
    >
      <div className="flex-1 flex items-center justify-center w-full px-1">
        {item.emoji ? (
          <span
            className="text-4xl leading-none"
            style={{ filter: `drop-shadow(0 0 6px ${c})` }}
          >
            {item.emoji}
          </span>
        ) : item.type === "frame" ? (
          <div
            className="w-14 h-14 border-2"
            style={{ borderColor: c, boxShadow: `0 0 10px ${c}` }}
          />
        ) : item.type === "bg" ? (
          <div
            className="w-14 h-14 border text-[8px] flex items-center justify-center tracking-widest"
            style={{
              borderColor: c,
              color: c,
              background: `radial-gradient(circle at 50% 40%, ${c}55, transparent 70%)`,
            }}
          >
            ФОН
          </div>
        ) : (
          <div
            className="text-[9px] tracking-widest leading-tight"
            style={{ color: c }}
          >
            ТИТУЛ
          </div>
        )}
      </div>
      <div className="w-full px-1 pb-1.5 text-[8px] leading-tight text-white truncate">
        {item.name}
      </div>
      <div
        className="absolute bottom-0 inset-x-0 h-0.5"
        style={{ background: c }}
      />
    </div>
  );
}

// Лента сама запускает прокрутку при появлении на экране
function ReelView({ reel, color, onDone, skipRef }) {
  const controls = useAnimation();
  const viewRef = useRef(null);
  const finalX = useRef(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    let alive = true;
    const w = viewRef.current?.offsetWidth || 320;
    const jitter = (Math.random() - 0.5) * (TILE - 20);
    finalX.current = -(WIN_INDEX * STEP + TILE / 2 - w / 2 + jitter);

    controls.set({ x: 0 });
    controls
      .start({
        x: finalX.current,
        transition: { duration: SPIN_SECONDS, ease: [0.08, 0.7, 0.12, 1] },
      })
      .then(() => {
        if (alive) onDoneRef.current();
      })
      .catch(() => {});

    skipRef.current = () => {
      controls.stop();
      controls.set({ x: finalX.current });
      onDoneRef.current();
    };

    return () => {
      alive = false;
      controls.stop();
      skipRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <div
        ref={viewRef}
        className="relative w-full overflow-hidden border-y-2 py-2"
        style={{
          borderColor: color,
          background: "rgba(2,8,23,0.9)",
          boxShadow: `0 0 24px ${color}55`,
        }}
      >
        <motion.div
          animate={controls}
          initial={{ x: 0 }}
          className="flex will-change-transform"
          style={{ gap: GAP }}
        >
          {reel.map((it, i) => (
            <ReelTile key={i} item={it} />
          ))}
        </motion.div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent" />

        <div
          className="pointer-events-none absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2"
          style={{
            background: "#fff",
            boxShadow: `0 0 10px #fff, 0 0 20px ${color}`,
          }}
        />
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderTop: "9px solid #fff",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderBottom: "9px solid #fff",
          }}
        />
      </div>
      <div
        className="mt-3 text-center text-[10px] tracking-[0.3em] animate-pulse"
        style={{ color }}
      >
        ПРОКРУТКА...
      </div>
    </div>
  );
}

export default function LootboxPage() {
  const [state, setState] = useState("loading");
  const [boxes, setBoxes] = useState({ normal: 0, rare: 0, legendary: 0 });
  const [coins, setCoins] = useState(0);
  const [tier, setTier] = useState("normal");
  // idle | shake | burst | spinning | reveal
  const [phase, setPhase] = useState("idle");
  const [result, setResult] = useState(null);
  const [reel, setReel] = useState(null);
  const [err, setErr] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const resultRef = useRef(null);
  const skipRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/lootbox", { cache: "no-store" });
        if (cancelled) return;
        if (res.status === 401) return setState("guest");
        if (!res.ok) return setState("error");
        const data = await res.json();
        const b = data.boxes || {
          normal: data.lootboxes || 0,
          rare: 0,
          legendary: 0,
        };
        setBoxes(b);
        setCoins(data.coins);
        const first = BOX_TIERS.find((t) => (b[t] || 0) > 0);
        if (first) setTier(first);
        setState("ok");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Итог и счётчики показываем только когда лента остановилась
  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    const r = resultRef.current;
    if (r) {
      setBoxes(r.boxes);
      setCoins(r.coins);
      vibrateFor(r.item?.rarity);
    }
    setPhase("reveal");
  };

  const skip = () => {
    if (skipRef.current) skipRef.current();
    else finish();
  };

  const info = BOX_INFO[tier];
  const count = boxes[tier] || 0;

  const open = async (force = false) => {
    if ((!force && phase !== "idle") || count < 1) return;
    setErr("");
    setResult(null);
    setReel(null);
    doneRef.current = false;

    // 1. зарядка (в это время сервер делает розыгрыш)
    setPhase("shake");
    try {
      const [res] = await Promise.all([
        fetch("/api/lootbox", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier }),
        }),
        wait(SHAKE_MS),
      ]);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setErr(String(data?.error || "ОШИБКА СИСТЕМЫ"));
        setPhase("idle");
        return;
      }
      resultRef.current = data;
      setResult(data);

      // 2. взрыв
      setPhase("burst");
      await wait(BURST_MS);

      // 3. прокрутка
      setReel(buildReel(tier, data.item));
      setPhase("spinning");
    } catch {
      setErr("НЕТ СВЯЗИ С СЕРВЕРОМ");
      setPhase("idle");
    }
  };

  const item = result?.item;
  const color = item ? item.color || RARITY_COLOR[item.rarity] : info.color;
  const chances = tierChances(tier);
  const busy = phase === "shake" || phase === "burst" || phase === "spinning";
  const boxVisible = phase === "idle" || phase === "shake" || phase === "burst";

  return (
    <div className="min-h-[100dvh] bg-black text-cyan-400 font-mono p-3 sm:p-6 flex justify-center relative overflow-hidden">
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
            href="/shop"
            className="text-xs text-amber-300 hover:text-white tracking-widest uppercase transition"
          >
            Магазин
          </Link>
        </div>

        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
          <h1 className="text-sm font-black text-white tracking-[0.2em] uppercase">
            ЛУТБОКСЫ СИСТЕМЫ
          </h1>
          <div className="flex items-center gap-1.5 border border-amber-400/60 bg-amber-400/10 text-amber-200 px-2.5 py-1 text-xs font-bold">
            <Coins className="w-3.5 h-3.5" />
            {coins}
          </div>
        </div>

        {state === "loading" && (
          <div className="text-center text-xs tracking-widest animate-pulse py-10">
            ЗАГРУЗКА...
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
            НЕ УДАЛОСЬ ЗАГРУЗИТЬ
          </div>
        )}

        {state === "ok" && (
          <>
            <div className="grid grid-cols-3 gap-2">
              {BOX_TIERS.map((t) => {
                const active = t === tier;
                const c = BOX_INFO[t].color;
                return (
                  <button
                    key={t}
                    onClick={() => {
                      if (busy) return;
                      setTier(t);
                      setPhase("idle");
                      setResult(null);
                      setReel(null);
                      setErr("");
                    }}
                    disabled={busy}
                    className="border px-1.5 py-2 text-center cursor-pointer transition disabled:cursor-not-allowed"
                    style={{
                      borderColor: active ? c : `${c}55`,
                      background: active ? `${c}22` : "transparent",
                      boxShadow: active ? `0 0 10px ${c}66` : "none",
                    }}
                  >
                    <Gift className="w-5 h-5 mx-auto" style={{ color: c }} />
                    <div className="text-[8px] tracking-wider text-white mt-1 leading-tight">
                      {BOX_INFO[t].name}
                    </div>
                    <div
                      className="text-[10px] font-black"
                      style={{ color: c }}
                    >
                      ×{boxes[t] || 0}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="relative min-h-[22rem] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {boxVisible && (
                  <ChargeBox
                    key={`box_${tier}`}
                    phase={phase}
                    info={info}
                    count={count}
                    color={color}
                    chargeMs={SHAKE_MS}
                  />
                )}

                {phase === "spinning" && reel && (
                  <motion.div
                    key="reel"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    className="w-full"
                  >
                    <ReelView
                      reel={reel}
                      color={info.color}
                      onDone={finish}
                      skipRef={skipRef}
                    />
                  </motion.div>
                )}

                {phase === "reveal" && item && (
                  <motion.div
                    key="reveal"
                    className="relative flex flex-col items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <RevealFx rarity={item.rarity} color={color} />
                    <RarityBanner rarity={item.rarity} color={color} />
                    <motion.div
                      initial={{ scale: 0.2, rotate: -20, opacity: 0 }}
                      animate={{
                        scale: 1,
                        rotate: 0,
                        opacity: 1,
                        boxShadow:
                          item.rarity === "legendary" || item.rarity === "epic"
                            ? [
                                `0 0 20px ${color}88`,
                                `0 0 55px ${color}`,
                                `0 0 20px ${color}88`,
                              ]
                            : `0 0 28px ${color}aa`,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 16,
                        boxShadow: {
                          type: "tween",
                          duration: 1.4,
                          repeat: Infinity,
                        },
                      }}
                      className="relative w-44 border-2 p-4 text-center bg-[#020817] overflow-hidden"
                      style={{ borderColor: color }}
                    >
                      <Shine rarity={item.rarity} />
                      <div
                        className="text-[9px] tracking-[0.3em] mb-2"
                        style={{ color }}
                      >
                        {RARITY_LABEL[item.rarity]} ·{" "}
                        {TYPE_LABEL[item.type] || ""}
                      </div>
                      {item.emoji ? (
                        <div
                          className="text-6xl leading-none mb-2"
                          style={{ filter: `drop-shadow(0 0 10px ${color})` }}
                        >
                          {item.emoji}
                        </div>
                      ) : item.type === "bg" ? (
                        <div
                          className="relative isolate h-14 mb-2 border overflow-hidden"
                          style={{ borderColor: color }}
                        >
                          <CardBackground
                            id={item.id}
                            glow="94,203,255"
                            z="z-0"
                          />
                        </div>
                      ) : item.type === "frame" ? (
                        <div
                          className="h-14 mb-2 border-2"
                          style={{
                            borderColor: color,
                            boxShadow: `0 0 12px ${color}`,
                          }}
                        />
                      ) : (
                        <div
                          className="h-14 mb-2 flex items-center justify-center text-xs tracking-[0.15em]"
                          style={{ color }}
                        >
                          « {item.name} »
                        </div>
                      )}
                      <div className="text-sm font-black text-white tracking-wider">
                        {item.name}
                      </div>
                    </motion.div>
                    {result.duplicate ? (
                      <div className="mt-4 text-[11px] tracking-widest text-amber-200 border border-amber-400/50 bg-amber-400/10 px-3 py-1.5">
                        ПОВТОР → +{result.refund} МОНЕТ
                      </div>
                    ) : (
                      <div className="mt-4 text-[11px] tracking-widest text-emerald-300 border border-emerald-400/50 bg-emerald-400/10 px-3 py-1.5">
                        НОВЫЙ ПРЕДМЕТ · НАДЕТЬ МОЖНО В ПРОФИЛЕ
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {err && (
              <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/50 p-2.5 tracking-wider text-center">
                {err}
              </div>
            )}

            <div className="space-y-2 pt-2">
              {phase === "reveal" ? (
                <>
                  {count > 0 && (
                    <button
                      onClick={() => open(true)}
                      className="w-full border bg-white/5 py-2.5 text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/15 transition cursor-pointer"
                      style={{ borderColor: info.color, color: info.color }}
                    >
                      ОТКРЫТЬ ЕЩЁ ({count})
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setPhase("idle");
                      setResult(null);
                      setReel(null);
                    }}
                    className="w-full border border-cyan-500/50 text-cyan-300 py-2.5 text-xs tracking-[0.2em] uppercase hover:bg-cyan-500/10 transition cursor-pointer"
                  >
                    ЗАКРЫТЬ
                  </button>
                  <Link
                    href="/profile"
                    className="block text-center text-[11px] text-[#7fa8d6] underline hover:text-white tracking-wider"
                  >
                    ПЕРЕЙТИ В ПРОФИЛЬ
                  </Link>
                </>
              ) : phase === "spinning" ? (
                <button
                  onClick={skip}
                  className="w-full border border-slate-500/60 text-slate-300 py-2.5 text-xs tracking-[0.2em] uppercase hover:bg-white/10 transition cursor-pointer"
                >
                  ПРОПУСТИТЬ
                </button>
              ) : (
                <>
                  <button
                    onClick={() => open()}
                    disabled={count < 1 || busy}
                    className="w-full border bg-white/5 py-3 text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/15 transition disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                    style={{ borderColor: info.color, color: info.color }}
                  >
                    {busy
                      ? "ОТКРЫВАЕМ..."
                      : count > 0
                        ? "[ ОТКРЫТЬ ]"
                        : "НЕТ КОРОБОК ЭТОГО ВИДА"}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowPreview(true)}
                      disabled={busy}
                      className="flex items-center justify-center gap-1.5 border border-cyan-500/50 text-cyan-300 py-2 text-[11px] tracking-[0.15em] uppercase hover:bg-cyan-500/10 transition cursor-pointer disabled:opacity-40"
                    >
                      <Eye className="w-3.5 h-3.5" /> ПРЕДПРОСМОТР
                    </button>
                    <Link
                      href="/shop"
                      className="flex items-center justify-center gap-1.5 border border-amber-400/50 text-amber-200 py-2 text-[11px] tracking-[0.15em] uppercase hover:bg-amber-400/10 transition"
                    >
                      <Coins className="w-3.5 h-3.5" /> КУПИТЬ
                    </Link>
                  </div>
                </>
              )}
            </div>

            <div className="text-[10px] text-[#7fa8d6] tracking-wider text-center space-y-1 pt-2">
              <div>АНОМАЛИЯ: 60% ШАНС · БОСС НЕДЕЛИ: ГАРАНТИРОВАННО</div>
              <div>
                {info.name}:{" "}
                {RARITIES.filter((r) => chances[r] > 0)
                  .map((r) => `${RARITY_LABEL[r]} ${chances[r]}%`)
                  .join(" · ")}
              </div>
              <div>ПОВТОР ПРЕДМЕТА ПРЕВРАЩАЕТСЯ В МОНЕТЫ</div>
            </div>
          </>
        )}

        {showPreview && (
          <LootboxPreview tier={tier} onClose={() => setShowPreview(false)} />
        )}
      </main>
    </div>
  );
}
