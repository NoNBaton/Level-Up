"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  Check,
  X,
  Trash2,
  Swords,
  BellRing,
  Skull,
} from "lucide-react";
import {
  SystemFrame,
  SysSubtitle,
  SysInput,
  SysButton,
} from "../components/SystemWindow";

const iconBtn =
  "p-1.5 border transition cursor-pointer disabled:opacity-50 disabled:cursor-wait";

const fmt = (d) =>
  new Date(d).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

function PlayerRow({ p, children }) {
  return (
    <div className="flex items-center justify-between gap-2 border border-[#5ecbff]/25 bg-[#5ecbff]/[0.04] px-2.5 py-2">
      <Link
        href={`/u/${encodeURIComponent(p.nickname)}`}
        className="min-w-0 flex-1 hover:text-white"
      >
        <div className="text-sm text-[#e6f1ff] truncate uppercase">
          {p.nickname}
        </div>
        <div className="text-[10px] text-[#7fa8d6] tracking-widest">
          LVL {p.level} · {p.rank} · {p.streak}D
        </div>
      </Link>
      <div className="flex items-center gap-1.5 shrink-0">{children}</div>
    </div>
  );
}

export default function FriendsPage() {
  const [data, setData] = useState({
    friends: [],
    incoming: [],
    outgoing: [],
    me: null,
  });
  const [boss, setBoss] = useState(null);
  const [duels, setDuels] = useState([]);
  const [feed, setFeed] = useState([]);
  const [state, setState] = useState("loading"); // loading | ok | guest | error
  const [nick, setNick] = useState("");
  const [msg, setMsg] = useState({ text: "", ok: false });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [f, b, d, fd] = await Promise.all([
        fetch("/api/friends", { cache: "no-store" }),
        fetch("/api/friends/boss", { cache: "no-store" }),
        fetch("/api/duels", { cache: "no-store" }),
        fetch("/api/feed", { cache: "no-store" }),
      ]);
      if (f.status === 401) {
        setState("guest");
        return;
      }
      if (!f.ok) {
        setState("error");
        return;
      }
      setData(await f.json());
      if (b.ok) setBoss(await b.json());
      if (d.ok) setDuels((await d.json()).duels || []);
      if (fd.ok) setFeed((await fd.json()).items || []);
      setState("ok");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const call = async (url, body, okText = "ГОТОВО") => {
    setBusy(true);
    setMsg({ text: "", ok: false });
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ text: String(j.error || "ОШИБКА СИСТЕМЫ"), ok: false });
        return false;
      }
      setMsg({
        text: j.status === "accepted" ? "ТЕПЕРЬ ВЫ ДРУЗЬЯ" : okText,
        ok: true,
      });
      await load();
      return true;
    } catch {
      setMsg({ text: "НЕТ СВЯЗИ С СЕРВЕРОМ", ok: false });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const sendRequest = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (nick.trim().length < 3) {
      setMsg({ text: "ВВЕДИТЕ ПОЗЫВНОЙ", ok: false });
      return;
    }
    if (await call("/api/friends/request", { nickname: nick.trim() })) {
      setNick("");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black text-cyan-400 font-mono p-3 sm:p-6 flex justify-center relative">
      <div className="absolute inset-0 bg-[radial-gradient(#5ecbff_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>

      <main className="w-full max-w-md relative z-10 space-y-4 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-white tracking-widest uppercase transition"
        >
          <ArrowLeft className="w-4 h-4" />
          На главную
        </Link>

        {state === "loading" && (
          <div className="text-center text-xs tracking-widest animate-pulse py-10">
            ЗАГРУЗКА...
          </div>
        )}

        {state === "guest" && (
          <div className="text-center border border-dashed border-cyan-500/30 p-6 text-xs tracking-widest">
            ВЫ НЕ АВТОРИЗОВАНЫ.
            <br />
            <Link href="/" className="underline text-cyan-300 hover:text-white">
              ВОЙТИ В СИСТЕМУ
            </Link>
          </div>
        )}

        {state === "error" && (
          <div className="text-center text-xs text-red-400 border border-red-500/40 p-4">
            НЕ УДАЛОСЬ ЗАГРУЗИТЬ ДРУЗЕЙ
          </div>
        )}

        {state === "ok" && (
          <SystemFrame tone="blue" glass outer className="p-4 sm:p-6 space-y-5">
            {msg.text && (
              <div
                className={`text-xs p-2.5 tracking-wider border ${
                  msg.ok
                    ? "text-emerald-300 bg-emerald-950/40 border-emerald-500/50"
                    : "text-rose-300 bg-rose-950/40 border-rose-500/50"
                }`}
              >
                {msg.text}
              </div>
            )}

            <form onSubmit={sendRequest} className="space-y-2">
              <SysSubtitle>ДОБАВИТЬ В ДРУЗЬЯ</SysSubtitle>
              <SysInput
                type="text"
                value={nick}
                onChange={(e) => {
                  setNick(e.target.value);
                  if (msg.text) setMsg({ text: "", ok: false });
                }}
                placeholder="Позывной охотника..."
              />
              <SysButton
                type="submit"
                disabled={busy}
                className="w-full flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />[ ОТПРАВИТЬ ЗАЯВКУ ]
              </SysButton>
            </form>

            {data.incoming.length > 0 && (
              <section className="space-y-2">
                <SysSubtitle tone="amber">
                  ВХОДЯЩИЕ ЗАЯВКИ ({data.incoming.length})
                </SysSubtitle>
                {data.incoming.map((p) => (
                  <PlayerRow key={p.id} p={p}>
                    <button
                      disabled={busy}
                      onClick={() =>
                        call("/api/friends/respond", { id: p.id, accept: true })
                      }
                      aria-label="Принять"
                      className={`${iconBtn} border-emerald-400/50 text-emerald-300 hover:bg-emerald-400 hover:text-slate-950`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      disabled={busy}
                      onClick={() =>
                        call("/api/friends/respond", {
                          id: p.id,
                          accept: false,
                        })
                      }
                      aria-label="Отклонить"
                      className={`${iconBtn} border-rose-400/50 text-rose-300 hover:bg-rose-400 hover:text-slate-950`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </PlayerRow>
                ))}
              </section>
            )}

            {boss && boss.members.length >= 2 && (
              <section className="space-y-2">
                <SysSubtitle tone={boss.defeated ? "green" : "red"}>
                  БОСС ДРУЗЕЙ
                </SysSubtitle>
                <div className="flex items-center gap-3">
                  <Skull
                    className={`w-8 h-8 shrink-0 ${boss.defeated ? "text-emerald-300" : "text-rose-300"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] tracking-[0.15em] text-[#e6f1ff] uppercase">
                      {boss.defeated
                        ? "ПОВЕРЖЕН — НАГРАДА ЖДЁТ НА ГЛАВНОЙ"
                        : "ОБЩИЙ БОСС НЕДЕЛИ"}
                    </div>
                    <div className="mt-1.5 h-2.5 border border-rose-400/40 bg-[#020817]/60 p-0.5">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${(boss.hp / boss.maxHp) * 100}%`,
                          background: boss.defeated
                            ? "linear-gradient(90deg, #34d399, #d1fae5)"
                            : "linear-gradient(90deg, #ff4d6d, #ffb4c2)",
                        }}
                      />
                    </div>
                    <div className="mt-1 text-[9px] text-[#8fb6e6] text-right">
                      {boss.hp}/{boss.maxHp} HP
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  {boss.members.map((m) => (
                    <div
                      key={m.nickname}
                      className="flex justify-between text-[11px] text-[#cfe6ff]"
                    >
                      <span className="uppercase truncate">
                        {m.nickname}
                        {m.isMe ? " (ВЫ)" : ""}
                      </span>
                      <span className="text-[#7fa8d6] shrink-0">
                        {m.quests} кв. · {m.damage} урона
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.friends.length > 0 && data.me && (
              <section className="space-y-2">
                <SysSubtitle tone="amber">РЕЙТИНГ ДРУЗЕЙ</SysSubtitle>
                {[{ ...data.me, isMe: true }, ...data.friends]
                  .sort((a, b) => b.level - a.level || b.xp - a.xp)
                  .map((p, i) => (
                    <div
                      key={p.isMe ? "me" : p.id}
                      className={`flex items-center gap-3 border px-2.5 py-2 text-sm ${
                        p.isMe
                          ? "border-amber-400/60 bg-amber-400/10"
                          : "border-[#5ecbff]/25 bg-[#5ecbff]/[0.04]"
                      }`}
                    >
                      <span className="w-5 text-center text-[#9fd0ff]">
                        {i + 1}
                      </span>
                      <span className="flex-1 min-w-0 truncate uppercase text-[#e6f1ff]">
                        {p.nickname}
                        {p.isMe ? " (ВЫ)" : ""}
                      </span>
                      <span className="text-[11px] text-[#7fa8d6] tracking-widest">
                        LVL {p.level} · {p.xp} XP
                      </span>
                    </div>
                  ))}
              </section>
            )}

            <section className="space-y-2">
              <SysSubtitle>ДРУЗЬЯ ({data.friends.length})</SysSubtitle>
              {data.friends.length === 0 ? (
                <div className="text-center py-4 border border-dashed border-[#5ecbff]/30 text-[#5f86b3] text-xs tracking-widest uppercase">
                  // ПОКА НИКОГО
                </div>
              ) : (
                data.friends.map((p) => (
                  <PlayerRow key={p.id} p={p}>
                    <button
                      disabled={busy}
                      onClick={() =>
                        call(
                          "/api/friends/nudge",
                          { nickname: p.nickname },
                          "ПОДТАЛКИВАНИЕ ОТПРАВЛЕНО",
                        )
                      }
                      aria-label="Подтолкнуть"
                      title="Подтолкнуть"
                      className={`${iconBtn} border-amber-400/50 text-amber-300 hover:bg-amber-400 hover:text-slate-950`}
                    >
                      <BellRing className="w-4 h-4" />
                    </button>
                    <button
                      disabled={busy}
                      onClick={() =>
                        call(
                          "/api/duels",
                          { nickname: p.nickname },
                          "ВЫЗОВ ОТПРАВЛЕН",
                        )
                      }
                      aria-label="Вызвать на дуэль"
                      title="Вызвать на дуэль"
                      className={`${iconBtn} border-rose-400/50 text-rose-300 hover:bg-rose-400 hover:text-slate-950`}
                    >
                      <Swords className="w-4 h-4" />
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => {
                        if (confirm(`Удалить ${p.nickname} из друзей?`)) {
                          call("/api/friends/remove", { id: p.id });
                        }
                      }}
                      aria-label="Удалить из друзей"
                      className={`${iconBtn} border-[#5ecbff]/30 text-[#5f86b3] hover:text-rose-400 hover:border-rose-400/60`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </PlayerRow>
                ))
              )}
            </section>

            {duels.length > 0 && (
              <section className="space-y-2">
                <SysSubtitle tone="red">ДУЭЛИ НЕДЕЛИ</SysSubtitle>
                {duels.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between gap-2 border border-[#5ecbff]/25 bg-[#5ecbff]/[0.04] px-2.5 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-[#e6f1ff] truncate uppercase">
                        ВЫ vs {d.other}
                      </div>
                      <div className="text-[10px] text-[#7fa8d6] tracking-widest">
                        {d.status === "pending" &&
                          (d.iAmChallenger
                            ? "ЖДЁМ ОТВЕТА"
                            : "ВЫЗЫВАЕТ ВАС НА ДУЭЛЬ")}
                        {d.status === "active" &&
                          `${d.myScore} : ${d.theirScore} · ДО ${fmt(d.endsAt)}`}
                        {d.status === "finished" &&
                          `${d.myScore} : ${d.theirScore} · ${
                            d.result === "win"
                              ? "ПОБЕДА"
                              : d.result === "lose"
                                ? "ПОРАЖЕНИЕ"
                                : "НИЧЬЯ"
                          }`}
                      </div>
                    </div>
                    {d.status === "pending" && !d.iAmChallenger && (
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          disabled={busy}
                          onClick={() =>
                            call(
                              "/api/duels/respond",
                              { id: d.id, accept: true },
                              "ДУЭЛЬ НАЧАЛАСЬ",
                            )
                          }
                          aria-label="Принять вызов"
                          className={`${iconBtn} border-emerald-400/50 text-emerald-300 hover:bg-emerald-400 hover:text-slate-950`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          disabled={busy}
                          onClick={() =>
                            call("/api/duels/respond", {
                              id: d.id,
                              accept: false,
                            })
                          }
                          aria-label="Отклонить вызов"
                          className={`${iconBtn} border-rose-400/50 text-rose-300 hover:bg-rose-400 hover:text-slate-950`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {d.status === "pending" && d.iAmChallenger && (
                      <button
                        disabled={busy}
                        onClick={() =>
                          call("/api/duels/respond", {
                            id: d.id,
                            accept: false,
                          })
                        }
                        aria-label="Отменить вызов"
                        className={`${iconBtn} border-[#5ecbff]/30 text-[#5f86b3] hover:text-rose-400 hover:border-rose-400/60 shrink-0`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </section>
            )}

            <section className="space-y-2">
              <SysSubtitle>ЛЕНТА АКТИВНОСТИ</SysSubtitle>
              {feed.length === 0 ? (
                <div className="text-center py-4 border border-dashed border-[#5ecbff]/30 text-[#5f86b3] text-xs tracking-widest uppercase">
                  // ПОКА ТИХО
                </div>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {feed.map((i) => (
                    <div
                      key={i.id}
                      className="text-[11px] text-[#cfe6ff] border-l-2 border-[#5ecbff]/40 pl-2"
                    >
                      <span className="uppercase text-white">
                        {i.nickname}
                        {i.isMe ? " (ВЫ)" : ""}
                      </span>{" "}
                      {i.text}{" "}
                      <span className="text-[#5f86b3]">· {fmt(i.at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {data.outgoing.length > 0 && (
              <section className="space-y-2">
                <SysSubtitle>ОТПРАВЛЕННЫЕ ЗАЯВКИ</SysSubtitle>
                {data.outgoing.map((p) => (
                  <PlayerRow key={p.id} p={p}>
                    <button
                      disabled={busy}
                      onClick={() => call("/api/friends/remove", { id: p.id })}
                      aria-label="Отменить заявку"
                      className={`${iconBtn} border-[#5ecbff]/30 text-[#5f86b3] hover:text-rose-400 hover:border-rose-400/60`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </PlayerRow>
                ))}
              </section>
            )}
          </SystemFrame>
        )}
      </main>
    </div>
  );
}
