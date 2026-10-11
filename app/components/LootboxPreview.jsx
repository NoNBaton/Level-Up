"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, Gift } from "lucide-react";
import { RARITY_COLOR } from "@/lib/items";
import { BOX_INFO, RARITIES, poolFor, tierChances } from "@/lib/lootboxes";
import CardBackground from "./CardBackground";

const RARITY_LABEL = {
  common: "ОБЫЧНЫЙ",
  rare: "РЕДКИЙ",
  epic: "ЭПИЧЕСКИЙ",
  legendary: "ЛЕГЕНДАРНЫЙ",
};

function MiniItem({ item, isNew }) {
  const color = item.color || RARITY_COLOR[item.rarity];
  return (
    <div
      className="relative border p-1.5 flex flex-col items-center justify-center gap-1 h-16 text-center overflow-hidden"
      style={{ borderColor: `${color}88` }}
    >
      {isNew && (
        <span className="absolute top-0 right-0 z-10 text-[7px] font-bold bg-emerald-400 text-black px-1">
          НОВОЕ
        </span>
      )}
      {item.emoji ? (
        <span
          className="text-2xl leading-none"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        >
          {item.emoji}
        </span>
      ) : item.type === "bg" ? (
        <div
          className="relative isolate w-full h-7 border overflow-hidden"
          style={{ borderColor: `${color}88` }}
        >
          <CardBackground id={item.id} glow="94,203,255" z="z-0" />
        </div>
      ) : item.type === "frame" ? (
        <div
          className="w-full h-7 border-2"
          style={{ borderColor: color, boxShadow: `0 0 8px ${color}` }}
        />
      ) : (
        <div className="text-[7px] tracking-widest" style={{ color }}>
          ТИТУЛ
        </div>
      )}
      <div className="text-[7px] leading-tight text-white w-full truncate">
        {item.name}
      </div>
    </div>
  );
}

export default function LootboxPreview({ tier, owned, onClose, children }) {
  if (!tier) return null;
  const info = BOX_INFO[tier];
  const chances = tierChances(tier);
  const pool = poolFor(tier);
  const shown = RARITIES.filter((r) => chances[r] > 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm max-h-[92dvh] overflow-y-auto bg-[#020817] border p-4 space-y-3"
        style={{
          borderColor: info.color,
          boxShadow: `0 0 24px ${info.color}66`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-slate-400 hover:text-white cursor-pointer"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-[9px] tracking-[0.25em] text-[#7fa8d6]">
          ПРЕДПРОСМОТР
        </div>

        <div className="h-32 flex items-center justify-center">
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, -3, 3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 border-2 flex items-center justify-center"
            style={{
              borderColor: info.color,
              background: `radial-gradient(circle at 50% 40%, ${info.color}44, rgba(2,8,23,0.9) 70%)`,
              boxShadow: `0 0 26px ${info.color}99, inset 0 0 22px ${info.color}33`,
            }}
          >
            <Gift className="w-12 h-12" style={{ color: info.color }} />
          </motion.div>
        </div>

        <div>
          <div className="text-sm font-black text-white tracking-wider">
            {info.name}
          </div>
          <div
            className="text-[9px] tracking-widest"
            style={{ color: info.color }}
          >
            {info.hint}
          </div>
        </div>

        <div>
          <div className="text-[9px] tracking-[0.2em] text-[#5f86b3] mb-1.5">
            ШАНСЫ
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {shown.map((r) => (
              <div
                key={r}
                className="border px-2 py-1 flex items-center justify-between text-[10px] tracking-wider"
                style={{ borderColor: `${RARITY_COLOR[r]}66` }}
              >
                <span style={{ color: RARITY_COLOR[r] }}>
                  {RARITY_LABEL[r]}
                </span>
                <span className="font-bold text-white">{chances[r]}%</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[9px] tracking-[0.2em] text-[#5f86b3] mb-1.5">
            ЧТО МОЖЕТ ВЫПАСТЬ · {pool.length}
          </div>
          <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
            {shown.map((r) => {
              const list = pool.filter((i) => i.rarity === r);
              if (!list.length) return null;
              return (
                <div key={r}>
                  <div
                    className="text-[9px] tracking-widest mb-1"
                    style={{ color: RARITY_COLOR[r] }}
                  >
                    {RARITY_LABEL[r]} · {list.length}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {list.map((it) => (
                      <MiniItem
                        key={it.id}
                        item={it}
                        isNew={owned ? !owned.has(it.id) : false}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-[9px] tracking-wider text-slate-500 text-center">
          ПОВТОР ПРЕДМЕТА ПРЕВРАЩАЕТСЯ В МОНЕТЫ
        </div>

        {children}
      </div>
    </div>
  );
}
