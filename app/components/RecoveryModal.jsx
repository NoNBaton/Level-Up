"use client";

import React, { useState } from "react";
import SystemWindow, { SysSubtitle, SysInput, SysButton } from "./SystemWindow";

export default function RecoveryModal({ open, onClose, z = "z-[110]" }) {
  const [step, setStep] = useState("nickname"); // nickname | answer | done
  const [nickname, setNickname] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setStep("nickname");
    setNickname("");
    setQuestion("");
    setAnswer("");
    setNewPassword("");
    setConfirm("");
    setError("");
  };

  const close = () => {
    reset();
    onClose?.();
  };

  const lookupQuestion = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (nickname.trim().length < 3) {
      setError("ВВЕДИТЕ ПОЗЫВНОЙ");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/recovery/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(String(data.error || "ОШИБКА СИСТЕМЫ"));
        return;
      }
      setQuestion(data.question);
      setStep("answer");
    } catch {
      setError("НЕТ СВЯЗИ С СЕРВЕРОМ");
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (newPassword.length < 6) {
      setError("НОВЫЙ КОД ДОСТУПА — МИНИМУМ 6 СИМВОЛОВ");
      return;
    }
    if (newPassword !== confirm) {
      setError("КОДЫ ДОСТУПА НЕ СОВПАДАЮТ");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/recovery/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim(),
          answer,
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(String(data.error || "ОШИБКА СИСТЕМЫ"));
        return;
      }
      setStep("done");
    } catch {
      setError("НЕТ СВЯЗИ С СЕРВЕРОМ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SystemWindow
      open={open}
      tone="amber"
      title="ВОССТАНОВЛЕНИЕ ДОСТУПА"
      onClose={close}
      maxWidth="max-w-md"
      z={z}
    >
      {step === "nickname" && (
        <form onSubmit={lookupQuestion} className="space-y-3">
          <SysSubtitle tone="amber">ВВЕДИТЕ ПОЗЫВНОЙ</SysSubtitle>
          <SysInput
            type="text"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              if (error) setError("");
            }}
            placeholder="Ваш никнейм..."
            autoFocus
          />
          {error && (
            <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/50 p-2.5 tracking-wider">
              {error}
            </div>
          )}
          <SysButton
            tone="amber"
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "ПОИСК..." : "[ ДАЛЕЕ ]"}
          </SysButton>
        </form>
      )}

      {step === "answer" && (
        <form onSubmit={submitReset} className="space-y-3">
          <SysSubtitle tone="amber">{question}</SysSubtitle>
          <SysInput
            type="text"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              if (error) setError("");
            }}
            placeholder="Ваш ответ..."
            autoFocus
          />
          <SysInput
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (error) setError("");
            }}
            placeholder="Новый код доступа..."
          />
          <SysInput
            type="password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              if (error) setError("");
            }}
            placeholder="Повторите новый код доступа..."
          />
          {error && (
            <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/50 p-2.5 tracking-wider">
              {error}
            </div>
          )}
          <SysButton
            tone="amber"
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "ОБРАБОТКА..." : "[ СБРОСИТЬ КОД ДОСТУПА ]"}
          </SysButton>
        </form>
      )}

      {step === "done" && (
        <div className="space-y-4 text-center">
          <SysSubtitle tone="green">ДОСТУП ВОССТАНОВЛЕН</SysSubtitle>
          <p className="text-xs text-[#cfe6ff] tracking-wider">
            Теперь вы можете войти с новым кодом доступа.
          </p>
          <SysButton tone="green" onClick={close} className="w-full">
            ЗАКРЫТЬ
          </SysButton>
        </div>
      )}
    </SystemWindow>
  );
}
