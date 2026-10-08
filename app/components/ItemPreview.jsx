"use client";

import React from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { RARITY_COLOR, SOURCE_HINT } from "@/lib/items";

const PetViewer = dynamic(() => import("./PetViewer"), { ssr: false });

const RARITY_LABEL = {
  common: "ОБЫЧНЫЙ",
  rare: "РЕДКИЙ",
  epic: "ЭПИЧЕСКИЙ",
  legendary: "ЛЕГЕНДАРНЫЙ",
};

export default function ItemPreview({
  item,
  nickname = "ОХОТНИК",
  onClose,
  children,
}) {
  if (!item) return null;
  const color = item.color || RARITY_COLOR[item.rarity];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xs bg-[#020817] border p-4 space-y-3"
        style={{ borderColor: color, boxShadow: `0 0 24px ${color}66` }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-[9px] tracking-[0.25em] text-[#7fa8d6]">
          ПРЕДПРОСМОТР
        </div>

        <div className="h-56 flex items-center justify-center relative">
          {item.type === "pet" && (
            <>
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: `radial-gradient(circle at 50% 60%, ${color}, transparent 65%)`,
                }}
              />
              <PetViewer petId={item.id} interactive />
            </>
          )}

          {item.type === "frame" && (
            <div
              className="w-40 h-48 border-2 flex flex-col items-center justify-center gap-2 bg-slate-900/60"
              style={{
                borderColor: color,
                boxShadow: `0 0 22px ${color}, inset 0 0 14px ${color}44`,
              }}
            >
              <div
                className="w-16 h-16 rounded-full border-2"
                style={{ borderColor: color }}
              />
              <div className="text-xs font-bold text-white tracking-wider">
                {nickname}
              </div>
              <div className="text-[9px] tracking-widest" style={{ color }}>
                ID: 000000
              </div>
            </div>
          )}

          {item.type === "title" && (
            <div className="w-full border border-cyan-500/30 bg-slate-900/60 p-4 text-center space-y-1">
              <div className="text-sm font-bold text-white tracking-wider">
                {nickname}
              </div>
              <div
                className="text-[11px] tracking-[0.2em] uppercase"
                style={{ color }}
              >
                « {item.name} »
              </div>
            </div>
          )}
        </div>

        {item.type === "pet" && (
          <div className="text-[8px] tracking-widest text-center text-slate-500">
            ТЯНИТЕ, ЧТОБЫ ВРАЩАТЬ
          </div>
        )}

        <div>
          <div className="text-sm font-black text-white tracking-wider">
            {item.name}
          </div>
          <div className="text-[9px] tracking-widest" style={{ color }}>
            {RARITY_LABEL[item.rarity]}
            {SOURCE_HINT[item.source] ? ` · ${SOURCE_HINT[item.source]}` : ""}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
