"use client";

import React, { useState, useEffect } from "react";

export interface Account {
  name: string;
  authId: string;
}

export const STORAGE_ACCOUNTS = "solo_hunter_accounts";
export const STORAGE_CURRENT = "solo_hunter_current_account";

export function readAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function readCurrent(): Account | null {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return p && typeof p.name === "string" && typeof p.authId === "string"
      ? p
      : null;
  } catch {
    return null;
  }
}

export function rememberAccount(acc: Account): Account[] {
  const list = readAccounts().filter((a) => a.authId !== acc.authId);
  list.push(acc);
  localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(list));
  return list;
}

export function setCurrentAccountStorage(acc: Account | null) {
  if (acc) {
    localStorage.setItem(STORAGE_CURRENT, JSON.stringify(acc));
  } else {
    localStorage.removeItem(STORAGE_CURRENT);
  }
  window.dispatchEvent(new CustomEvent("hunter_account_changed", { detail: acc }));
  window.dispatchEvent(new Event("custom_storage_update"));
}

export default function SystemAuth({
  onAccountSwitch,
}: {
  onAccountSwitch?: (account: Account | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [loginInput, setLoginInput] = useState("");
  const [passInput, setPassInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Начальная загрузка
  useEffect(() => {
    setAccounts(readAccounts());
    const curr = readCurrent();
    setCurrentAccount(curr);
    onAccountSwitch?.(curr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Синхронизация, если аккаунт сменили из другого компонента (например, из регистрации)
  useEffect(() => {
    const sync = () => {
      setAccounts(readAccounts());
      setCurrentAccount(readCurrent());
    };
    window.addEventListener("hunter_account_changed", sync);
    return () => window.removeEventListener("hunter_account_changed", sync);
  }, []);

  const applyAccount = (acc: Account | null) => {
    setCurrentAccount(acc);
    onAccountSwitch?.(acc);
    setCurrentAccountStorage(acc);
  };

  const closeModal = () => {
    setIsOpen(false);
    setErrorMsg("");
    setLoginInput("");
    setPassInput("");
    setIsRegisterMode(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const name = loginInput.trim();
    if (name.length < 3) {
      setErrorMsg("НИКНЕЙМ — МИНИМУМ 3 СИМВОЛА");
      return;
    }
    if (passInput.length < 6) {
      setErrorMsg("КОД ДОСТУПА — МИНИМУМ 6 СИМВОЛОВ");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(isRegisterMode ? "/api/register" : "/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: name, password: passInput }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(String(data.error ?? "ОШИБКА СИСТЕМЫ"));
        return;
      }

      const acc: Account = data.account;
      setAccounts(rememberAccount(acc));
      applyAccount(acc);
      closeModal();
    } catch {
      setErrorMsg("НЕТ СВЯЗИ С СЕРВЕРОМ");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = (acc: Account) => {
    applyAccount(acc);
    closeModal();
  };

  const handleLogout = () => {
    applyAccount(null);
    closeModal();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="font-mono text-xs tracking-wider text-[#00f0ff] bg-[#00f0ff]/10 border border-[#00f0ff]/40 px-3 py-1.5 hover:bg-[#00f0ff] hover:text-[#02060f] transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)] flex items-center gap-2 cursor-pointer"
      >
        <span>
          [{" "}
          {currentAccount
            ? `ОХОТНИК: ${currentAccount.name} [${currentAccount.authId}]`
            : "ИДЕНТИФИКАЦИЯ"}{" "}
          ]
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-[#02060f]/85 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="w-[360px] bg-[#060e1c]/95 border border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.3),inset_0_0_15px_rgba(0,240,255,0.1)] p-5 text-[#c0f4ff] font-mono relative">
            <div className="absolute -top-[1px] -left-[1px] w-[6px] h-[6px] border-t-2 border-l-2 border-white" />
            <div className="absolute -bottom-[1px] -right-[1px] w-[6px] h-[6px] border-b-2 border-r-2 border-white" />

            <div className="text-xs tracking-widest text-[#00f0ff] border-b border-[#00f0ff]/30 pb-2 mb-4 uppercase flex justify-between items-center">
              <span>[ СИСТЕМНОЕ СООБЩЕНИЕ ]</span>
              <button
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setErrorMsg("");
                }}
                className="text-[10px] text-cyan-300 underline hover:text-white cursor-pointer"
              >
                {isRegisterMode ? "ВХОД" : "+ РЕГ"}
              </button>
            </div>

            {!currentAccount || isRegisterMode ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="ИМЯ ОХОТНИКА (LOGIN)"
                  value={loginInput}
                  onChange={(e) => {
                    setLoginInput(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  className="w-full bg-[#001428]/60 border border-[#00f0ff]/40 text-white p-2.5 text-xs font-mono outline-none focus:border-[#00f0ff]"
                />
                <input
                  type="password"
                  placeholder="КОД ДОСТУПА (PASSWORD)"
                  value={passInput}
                  onChange={(e) => {
                    setPassInput(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  className="w-full bg-[#001428]/60 border border-[#00f0ff]/40 text-white p-2.5 text-xs font-mono outline-none focus:border-[#00f0ff]"
                />

                {errorMsg && (
                  <div className="text-[11px] text-[#ff3366] border border-[#ff3366]/40 bg-[#ff3366]/10 p-2">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00f0ff]/15 border border-[#00f0ff] text-[#00f0ff] py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#00f0ff] hover:text-[#02060f] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                >
                  [{" "}
                  {loading
                    ? "ОБРАБОТКА..."
                    : isRegisterMode
                    ? "СОЗДАТЬ АККАУНТ"
                    : "ПОДТВЕРДИТЬ ВХОД"}{" "}
                  ]
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="text-xs text-[#a5d8ff] space-y-1">
                  <div>
                    ТЕКУЩИЙ ОХОТНИК:{" "}
                    <span className="text-white font-bold">{currentAccount.name}</span>
                  </div>
                  <div>
                    ID: <span className="text-cyan-400">{currentAccount.authId}</span>
                  </div>
                  <div>
                    СТАТУС: <span className="text-[#00ff66]">СИНХРОНИЗИРОВАНО</span>
                  </div>
                </div>

                {accounts.filter((a) => a.authId !== currentAccount.authId).length > 0 && (
                  <div className="border-t border-[#00f0ff]/20 pt-3">
                    <div className="text-[10px] text-cyan-400 mb-2 uppercase">
                      СМЕНИТЬ ПРОФИЛЬ:
                    </div>
                    <div className="space-y-1.5 max-h-28 overflow-y-auto">
                      {accounts
                        .filter((acc) => acc.authId !== currentAccount.authId)
                        .map((acc) => (
                          <button
                            key={acc.authId}
                            onClick={() => handleSelectAccount(acc)}
                            className="w-full text-left text-[11px] p-1.5 bg-[#001428]/40 border border-cyan-500/30 hover:border-cyan-400 text-cyan-200 flex justify-between cursor-pointer"
                          >
                            <span>{acc.name}</span>
                            <span className="text-[9px] text-cyan-500">{acc.authId}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full bg-[#ff3366]/10 border border-[#ff3366] text-[#ff3366] py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#ff3366] hover:text-white transition-all cursor-pointer"
                >
                  [ РАЗОРВАТЬ СВЯЗЬ (ВЫХОД) ]
                </button>
              </div>
            )}

            <button
              onClick={closeModal}
              className="bg-transparent border-none text-[#5a7a99] text-[11px] w-full mt-4 cursor-pointer hover:text-white"
            >
              [ ЗАКРЫТЬ [X] ]
            </button>
          </div>
        </div>
      )}
    </>
  );
}