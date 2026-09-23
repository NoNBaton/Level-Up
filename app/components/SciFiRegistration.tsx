"use client";

import React, { useState } from "react";
import { ShieldAlert, UserPlus, Check, X } from "lucide-react";
import {
  rememberAccount,
  setCurrentAccountStorage,
  type Account,
} from "./SystemAuth";

interface SciFiRegistrationProps {
  onRegisterSuccess?: (account: { username: string; authId: string }) => void;
  onClose?: () => void;
}

export default function SciFiRegistration({
  onRegisterSuccess,
  onClose,
}: SciFiRegistrationProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const clearError = () => {
    if (errorMsg) setErrorMsg("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const trimmedName = username.trim();

    if (!trimmedName) {
      setErrorMsg("НИКНЕЙМ НЕ МОЖЕТ БЫТЬ ПУСТЫМ");
      return;
    }
    if (trimmedName.length < 3) {
      setErrorMsg("МИНИМАЛЬНАЯ ДЛИНА НИКА — 3 СИМВОЛА");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("КОД ДОСТУПА — МИНИМУМ 6 СИМВОЛОВ");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("КОДЫ ДОСТУПА НЕ СОВПАДАЮТ");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: trimmedName, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(String(data.error ?? "ОШИБКА СИСТЕМЫ"));
        return;
      }

      const account: Account = data.account;
      rememberAccount(account);
      setCurrentAccountStorage(account);

      onRegisterSuccess?.({ username: account.name, authId: account.authId });
    } catch {
      setErrorMsg("НЕТ СВЯЗИ С СЕРВЕРОМ");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-slate-900/80 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-xs text-cyan-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition";
  const labelClass =
    "block text-[10px] tracking-widest text-cyan-500 mb-1.5 uppercase";

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
            <label className={labelClass}>ПОЗЫВНОЙ (НИКНЕЙМ)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                clearError();
              }}
              placeholder="Введите никнейм..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>КОД ДОСТУПА (ПАРОЛЬ)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              placeholder="Минимум 6 символов..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>ПОВТОРИТЕ КОД ДОСТУПА</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                clearError();
              }}
              placeholder="Повторите пароль..."
              className={inputClass}
            />
          </div>

          {errorMsg ? (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 border border-red-500/40 p-2.5 rounded-xl">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/60 text-cyan-200 font-bold py-3 rounded-xl text-xs tracking-wider uppercase transition shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
          >
            <Check className="w-4 h-4" />
            {loading ? "ИНИЦИАЛИЗАЦИЯ..." : "ИНИЦИАЛИЗИРОВАТЬ ПРОФИЛЬ"}
          </button>
        </form>
      </div>
    </div>
  );
}