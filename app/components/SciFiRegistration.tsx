"use client";

import React, { useState } from "react";
import { ShieldAlert, UserPlus, Check, X } from "lucide-react";

interface SciFiRegistrationProps {
  onRegisterSuccess?: (account: { username: string; authId: string }) => void;
  onClose?: () => void;
}

export default function SciFiRegistration({
  onRegisterSuccess,
  onClose,
}: SciFiRegistrationProps) {
  const [username, setUsername] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = username.trim();

    if (!trimmedName) {
      setErrorMsg("НИКНЕЙМ НЕ МОЖЕТ БЫТЬ ПУСТЫМ");
      return;
    }

    if (trimmedName.length < 3) {
      setErrorMsg("МИНИМАЛЬНАЯ ДЛИНА НИКА — 3 СИМВОЛА");
      return;
    }

    // Получаем список всех зарегистрированных аккаунтов
    const existingAccountsRaw = localStorage.getItem("solo_hunter_all_accounts");
    let existingAccounts: Array<{ username: string; authId: string }> = [];

    if (existingAccountsRaw) {
      try {
        existingAccounts = JSON.parse(existingAccountsRaw);
      } catch {}
    }

    // Проверяем уникальность (регистронезависимо)
    const isTaken = existingAccounts.some(
      (acc) => acc.username.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isTaken) {
      setErrorMsg("ЭТОТ НИКНЕЙМ УЖЕ ЗАНЯТ ДРУГИМ ОХОТНИКОМ");
      return;
    }

    setErrorMsg("");

    const newAccount = {
      username: trimmedName,
      authId: `hunter_${Date.now()}`,
    };

    existingAccounts.push(newAccount);
    localStorage.setItem(
      "solo_hunter_all_accounts",
      JSON.stringify(existingAccounts)
    );
    localStorage.setItem(
      "solo_hunter_current_account",
      JSON.stringify(newAccount)
    );

    // Уведомляем систему
    window.dispatchEvent(new Event("hunter_account_changed"));
    window.dispatchEvent(new Event("custom_storage_update"));

    if (onRegisterSuccess) {
      onRegisterSuccess(newAccount);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
      <div className="w-full max-w-md bg-slate-950 border border-cyan-500/50 rounded-2xl p-6 relative shadow-[0_0_50px_rgba(6,182,212,0.25)] font-mono text-cyan-400">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold tracking-widest uppercase text-white">
              РЕГИСТРАЦИЯ ОХОТНИКА
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-cyan-400 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[10px] tracking-widest text-cyan-500 mb-1.5 uppercase">
              ПОЗЫВНОЙ (НИКНЕЙМ)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="Введите никнейм..."
              className="w-full bg-slate-900/80 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-xs text-cyan-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          {/* Пример исправления ошибки TS2304 с 'none' через условный рендеринг */}
          {errorMsg ? (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 border border-red-500/40 p-2.5 rounded-xl">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          <div
            className="text-[10px] text-slate-500 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800"
            style={{ display: "none" }}
          >
            Скрытый блок конфигурации
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/60 text-cyan-200 font-bold py-3 rounded-xl text-xs tracking-wider uppercase transition shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            ИНИЦИАЛИЗИРОВАТЬ ПРОФИЛЬ
          </button>
        </form>
      </div>
    </div>
  );
}