"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal, Shield, Mail, Lock } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Имитация / Подключение запроса к вашему Auth бэкенду (Supabase / NextAuth)
      // Пример с Supabase клиентским вызовом:
      // const { data, error } = isLogin 
      //   ? await supabase.auth.signInWithPassword({ email, password })
      //   : await supabase.auth.signUp({ email, password });
      
      await new Promise((r) => setTimeout(r, 1000)); // заглушка сети

      if (email.includes("err")) throw new Error("ОШИБКА АВТОРИЗАЦИИ: ДОСТУП ЗАПРЕЩЕН");

      onSuccess({ email, id: "agent-" + Date.now() });
      onClose();
    } catch (err: any) {
      setError(err.message || "СБОЙ СЕТЕВОГО ПРОТОКОЛА");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-md bg-slate-950 border-2 border-cyan-400 rounded-2xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.4)] relative z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-cyan-400/60 hover:text-cyan-300 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-black tracking-widest text-white uppercase">
                {isLogin ? "[ АУТЕНТИФИКАЦИЯ АГЕНТА ]" : "[ РЕГИСТРАЦИЯ В СИСТЕМЕ ]"}
              </h2>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-950/50 border border-red-500/50 rounded-xl text-xs text-red-300 font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] text-cyan-400/80 tracking-widest uppercase block mb-1">
                  EMAIL / ID СЕТИ
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-cyan-500/60 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@levelup.os"
                    className="w-full bg-slate-900 border border-cyan-500/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-cyan-400/80 tracking-widest uppercase block mb-1">
                  ПАССКОД / КЛЮЧ
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-cyan-500/60 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-900 border border-cyan-500/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black py-3 rounded-xl tracking-[0.2em] uppercase text-xs transition shadow-[0_0_20px_rgba(6,182,212,0.6)] disabled:opacity-50"
              >
                {loading ? "ПОДКЛЮЧЕНИЕ..." : isIdentifiedOrLogin(isLogin)}
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[10px] text-cyan-500 hover:text-cyan-300 font-mono tracking-widest uppercase transition"
              >
                {isLogin
                  ? "// НЕТ АККАУНТА? ИНИЦИАЛИЗИРОВАТЬ ПРОФИЛЬ"
                  : "// УЖЕ В СИСТЕМЕ? ВОЙТИ"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function isIdentifiedOrLogin(isLogin: boolean) {
  return isLogin ? "[ ПОДТВЕРДИТЬ ДОСТУП ]" : "[ СОЗДАТЬ УЧЕТНУЮ ЗАПИСЬ ]";
}