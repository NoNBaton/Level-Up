"use client";

import React, { useState } from "react";
import { Download } from "lucide-react";
import { SysButton } from "./SystemWindow";
import { safeJson } from "@/lib/safeFetch";

// Берём только безопасные поля. Хэши паролей и ответов сюда не попадут,
// даже если сервер когда-нибудь начнёт их отдавать.
const EXPORT_FIELDS = [
  "nickname",
  "authId",
  "level",
  "xp",
  "streak",
  "longestStreak",
  "achievements",
  "progress",
];

export default function ExportButton() {
  const [state, setState] = useState("idle"); // idle | busy | error

  const handleExport = async () => {
    if (state === "busy") return;
    setState("busy");
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (!res.ok) throw new Error("bad status");
      const data = await safeJson(res);
      if (!data?.player) throw new Error("no player");

      const player = {};
      for (const key of EXPORT_FIELDS) {
        if (key in data.player) player[key] = data.player[key];
      }

      const out = {
        app: "LEVEL_UP",
        version: 1,
        exportedAt: new Date().toISOString(),
        player,
      };

      const blob = new Blob([JSON.stringify(out, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const day = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `levelup_${player.authId || "backup"}_${day}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setState("idle");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="space-y-2">
      <SysButton
        onClick={handleExport}
        disabled={state === "busy"}
        className="w-full flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" />
        {state === "busy" ? "ЭКСПОРТ..." : "[ СКАЧАТЬ ДАННЫЕ JSON ]"}
      </SysButton>
      {state === "error" && (
        <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/50 p-2.5 tracking-wider">
          НЕ УДАЛОСЬ ПОЛУЧИТЬ ДАННЫЕ. ПОПРОБУЙТЕ ЕЩЁ РАЗ
        </div>
      )}
    </div>
  );
}
