"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skull, Swords, Flame } from "lucide-react";
const SEGMENTS = 20;

const pad = (n) => String(n).padStart(2, "0");

// До понедельника 00:00 (смена босса)
const msToNextWeek = () => {
  const now = new Date();
  const d = new Date(now);
  const day = d.getDay();
  const add = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + add);
  d.setHours(0, 0, 0, 0);
  return d - now;
};

function Embers({ color }) {
  const embers = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: 4 + ((i * 37) % 92),
        delay: (i * 0.37) % 3,
        dur: 2.4 + ((i * 13) % 20) / 10,
        size: 2 + (i % 3),
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {embers.map((e) => (
        <motion.span
          key={e.id}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            background: color,
            boxShadow: `0 0 8px ${color}`,
          }}
          animate={{ y: [0, -140], opacity: [0, 0.9, 0] }}
          transition={{
            duration: e.dur,
            delay: e.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
function BossEmblem({ theme, main, glow, rage, defeated }) {
  const pulse = {
    animate: defeated ? { opacity: 0.2 } : { opacity: [0.6, 1, 0.6] },
    transition: { duration: rage ? 0.6 : 2, repeat: Infinity },
  };
  const spin = (d, rev) => ({
    animate: { rotate: defeated ? 0 : rev ? -360 : 360 },
    transition: { duration: d, repeat: Infinity, ease: "linear" },
    style: { transformOrigin: "50px 50px" },
  });
  const body = {
    fill: "#12040a",
    stroke: main,
    strokeWidth: 2.2,
    strokeLinejoin: "round",
  };

  let art;

  if (theme === "СТРАЖ ВРАТ") {
    art = (
      <>
        <path d="M32 28 L14 6 L38 20 Z" {...body} />
        <path d="M68 28 L86 6 L62 20 Z" {...body} />
        <path
          d="M28 80 L28 40 Q28 12 50 10 Q72 12 72 40 L72 80 L62 72 L50 86 L38 72 Z"
          {...body}
        />
        <path d="M50 10 L50 34" stroke={main} strokeWidth="1.5" opacity="0.7" />
        <rect
          x="33"
          y="42"
          width="34"
          height="8"
          fill="#000"
          stroke={main}
          strokeWidth="1"
        />
        <motion.g {...pulse}>
          <path d="M36 44 L47 46 L36 48 Z" fill={main} />
          <path d="M64 44 L53 46 L64 48 Z" fill={main} />
        </motion.g>
        <path
          d="M38 60 L62 60 M40 66 L60 66"
          stroke={main}
          strokeWidth="1.2"
          opacity="0.6"
        />
      </>
    );
  } else if (theme === "ХРАНИТЕЛЬ БЕЗДНЫ") {
    art = (
      <>
        <path
          d="M18 92 L18 42 Q18 8 50 8 Q82 8 82 42 L82 92"
          {...body}
          fill="none"
        />
        <path
          d="M28 92 L28 44 Q28 18 50 18 Q72 18 72 44 L72 92 Z"
          fill="#05010a"
          stroke={main}
          strokeWidth="1"
          opacity="0.9"
        />
        <motion.g {...spin(8)}>
          <ellipse
            cx="50"
            cy="56"
            rx="20"
            ry="30"
            fill="none"
            stroke={main}
            strokeWidth="1.4"
            strokeDasharray="4 5"
          />
        </motion.g>
        <motion.g {...spin(5, true)}>
          <ellipse
            cx="50"
            cy="56"
            rx="12"
            ry="20"
            fill="none"
            stroke={main}
            strokeWidth="1.6"
            strokeDasharray="2 4"
          />
        </motion.g>
        <motion.ellipse cx="50" cy="56" rx="6" ry="10" fill={main} {...pulse} />
        <path d="M14 92 L86 92" stroke={main} strokeWidth="2.5" />
      </>
    );
  } else if (theme === "ПОВЕЛИТЕЛЬ ТЕНЕЙ") {
    art = (
      <>
        <path d="M34 32 Q12 30 10 4 Q30 12 42 26 Z" {...body} />
        <path d="M66 32 Q88 30 90 4 Q70 12 58 26 Z" {...body} />
        <path d="M32 30 Q50 20 68 30 L66 58 Q50 84 34 58 Z" {...body} />
        <path
          d="M38 24 L42 8 L50 20 L58 8 L62 24"
          {...body}
          fill={main}
          fillOpacity="0.25"
        />
        <motion.g {...pulse}>
          <path d="M37 44 L48 47 L38 51 Z" fill={main} />
          <path d="M63 44 L52 47 L62 51 Z" fill={main} />
        </motion.g>
        <path
          d="M42 64 L46 70 L50 64 L54 70 L58 64"
          fill="none"
          stroke={main}
          strokeWidth="1.3"
        />
        <path
          d="M30 80 Q50 100 70 80"
          fill="none"
          stroke={main}
          strokeWidth="1.2"
          opacity="0.5"
        />
      </>
    );
  } else {
    // КОШМАР СИСТЕМЫ
    art = (
      <>
        <motion.g {...spin(16)}>
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={main}
            strokeWidth="1.2"
            strokeDasharray="2 5"
          />
          <path
            d="M50 8 L88 74 L12 74 Z"
            fill="none"
            stroke={main}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </motion.g>
        <motion.g {...spin(16, true)}>
          <path
            d="M50 92 L12 26 L88 26 Z"
            fill="none"
            stroke={main}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </motion.g>
        <circle
          cx="50"
          cy="50"
          r="17"
          fill="#12040a"
          stroke={main}
          strokeWidth="2"
        />
        <motion.text
          x="50"
          y="60"
          textAnchor="middle"
          fontSize="28"
          fontWeight="900"
          fill={main}
          {...pulse}
        >
          !
        </motion.text>
      </>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className="relative w-20 h-20"
      style={{
        filter: `drop-shadow(0 0 8px rgba(${glow},1)) drop-shadow(0 0 20px rgba(${glow},0.55))`,
        opacity: defeated ? 0.55 : 1,
      }}
    >
      {art}
    </svg>
  );
}
export default function BossCard({ boss }) {
  const { hp, maxHp, defeated, theme } = boss;
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const rage = !defeated && pct <= 33;
  const phase = pct > 66 ? 1 : pct > 33 ? 2 : 3;

  const main = defeated ? "#34d399" : rage ? "#ff2d55" : "#ff4d6d";
  const glow = defeated ? "52,211,153" : "255,77,109";

  // Вылетающий урон и удар
  const prevHp = useRef(hp);
  const [hits, setHits] = useState([]);
  const [shake, setShake] = useState(0);
  const [lag, setLag] = useState(pct);

  useEffect(() => {
    const diff = prevHp.current - hp;
    if (diff > 0) {
      const id = Date.now() + Math.random();
      setHits((h) => [...h, { id, dmg: diff }]);
      setShake((s) => s + 1);
      setTimeout(() => setHits((h) => h.filter((x) => x.id !== id)), 1200);
    }
    prevHp.current = hp;
    // «отстающая» полоска догоняет через паузу
    const t = setTimeout(() => setLag(pct), 450);
    return () => clearTimeout(t);
  }, [hp, pct]);

  // Таймер до смены босса
  const [left, setLeft] = useState(null);
  useEffect(() => {
    setLeft(msToNextWeek());
    const t = setInterval(() => setLeft(msToNextWeek()), 1000);
    return () => clearInterval(t);
  }, []);
  const days = left !== null ? Math.floor(left / 86400000) : 0;
  const hh = left !== null ? Math.floor((left % 86400000) / 3600000) : 0;
  const mm = left !== null ? Math.floor((left % 3600000) / 60000) : 0;

  const filled = Math.ceil((pct / 100) * SEGMENTS);

  return (
    <section className="mb-5">
      <motion.div
        key={shake}
        animate={shake ? { x: [0, -7, 7, -5, 5, -2, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden border"
        style={{
          borderColor: `rgba(${glow},0.7)`,
          background: `radial-gradient(ellipse at 50% 0%, rgba(${glow},0.22), rgba(2,8,23,0.9) 70%)`,
          boxShadow: `0 0 22px rgba(${glow},0.35), inset 0 0 30px rgba(${glow},0.12)`,
        }}
      >
        {/* Уголки */}
        {[
          "top-0 left-0 border-t-2 border-l-2",
          "top-0 right-0 border-t-2 border-r-2",
          "bottom-0 left-0 border-b-2 border-l-2",
          "bottom-0 right-0 border-b-2 border-r-2",
        ].map((c) => (
          <span
            key={c}
            className={`absolute w-3 h-3 ${c}`}
            style={{ borderColor: main }}
          />
        ))}

        {!defeated && <Embers color={main} />}

        {/* Шапка */}
        <div className="relative flex items-center justify-between px-3 pt-2.5">
          <div
            className="flex items-center gap-1.5 text-[9px] font-black tracking-[0.3em] uppercase"
            style={{ color: main, textShadow: `0 0 8px rgba(${glow},0.9)` }}
          >
            <Swords className="w-3 h-3" />
            {defeated ? "БОСС НЕДЕЛИ // ЗАЧИЩЕН" : "БОСС НЕДЕЛИ // ТРЕВОГА"}
          </div>
          <div className="text-[9px] tracking-widest text-[#8fb6e6] tabular-nums">
            {left === null
              ? ""
              : `СМЕНА ЧЕРЕЗ ${days}д ${pad(hh)}ч ${pad(mm)}м`}
          </div>
        </div>

        {/* Череп */}
        <div className="relative flex flex-col items-center py-3">
          <motion.div
            className="relative flex items-center justify-center w-24 h-24"
            animate={
              defeated ? {} : { scale: rage ? [1, 1.12, 1] : [1, 1.06, 1] }
            }
            transition={{
              duration: rage ? 0.7 : 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Вращающееся кольцо */}
            <motion.svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full"
              animate={{ rotate: defeated ? 0 : 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke={main}
                strokeWidth="1.2"
                strokeDasharray="3 6"
                opacity="0.8"
              />
            </motion.svg>
            <motion.svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full"
              animate={{ rotate: defeated ? 0 : -360 }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            >
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke={main}
                strokeWidth="0.8"
                strokeDasharray="14 10"
                opacity="0.5"
              />
            </motion.svg>
            <BossEmblem
              theme={theme}
              main={main}
              glow={glow}
              rage={rage}
              defeated={defeated}
            />
          </motion.div>

          <div
            className="mt-1 text-sm font-black tracking-[0.2em] uppercase text-white text-center px-2"
            style={{
              textShadow: `0 0 8px ${main}, 0 0 20px rgba(${glow},0.6)`,
            }}
          >
            {theme}
          </div>

          {/* Бейджи фазы */}
          <div className="mt-1.5 flex items-center gap-2 text-[9px] tracking-[0.2em] uppercase">
            {defeated ? (
              <span className="text-emerald-300">ПОБЕДА</span>
            ) : rage ? (
              <span
                className="flex items-center gap-1 font-black animate-pulse"
                style={{ color: main }}
              >
                <Flame className="w-3 h-3" /> ЯРОСТЬ · ФАЗА 3
              </span>
            ) : (
              <span className="text-[#9fd0ff]">ФАЗА {phase} / 3</span>
            )}
          </div>

          {/* Печать «ПОВЕРЖЕН» */}
          <AnimatePresence>
            {defeated && (
              <motion.div
                initial={{ scale: 2.4, opacity: 0, rotate: -18 }}
                animate={{ scale: 1, opacity: 1, rotate: -12 }}
                transition={{ type: "spring", stiffness: 260, damping: 14 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 px-3 py-1 text-xl font-black tracking-[0.25em] text-emerald-300 bg-black/50 pointer-events-none"
                style={{
                  borderColor: "#34d399",
                  textShadow: "0 0 12px #34d399",
                  boxShadow: "0 0 20px rgba(52,211,153,0.6)",
                }}
              >
                ПОВЕРЖЕН
              </motion.div>
            )}
          </AnimatePresence>

          {/* Вылетающий урон */}
          <div className="pointer-events-none absolute top-6 left-1/2 -translate-x-1/2">
            <AnimatePresence>
              {hits.map((h) => (
                <motion.div
                  key={h.id}
                  initial={{ y: 0, opacity: 0, scale: 0.6 }}
                  animate={{
                    y: -48,
                    opacity: [0, 1, 1, 0],
                    scale: [0.6, 1.4, 1.1, 1],
                  }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                  className="absolute -translate-x-1/2 text-2xl font-black text-white tabular-nums"
                  style={{ textShadow: "0 0 10px #ff4d6d, 0 0 22px #ff4d6d" }}
                >
                  -{h.dmg}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Полоска HP */}
        <div className="relative px-3 pb-3">
          <div className="flex justify-between text-[10px] tracking-widest mb-1">
            <span style={{ color: main }}>HP</span>
            <span className="text-white tabular-nums">
              {hp} / {maxHp}{" "}
              <span className="text-[#8fb6e6]">({Math.round(pct)}%)</span>
            </span>
          </div>

          <div
            className="relative h-4 border bg-[#020817]/80 p-[2px]"
            style={{ borderColor: `rgba(${glow},0.6)` }}
          >
            {/* Отстающий след */}
            <motion.div
              className="absolute top-[2px] bottom-[2px] left-[2px]"
              style={{ background: "rgba(255,255,255,0.55)" }}
              animate={{ width: `calc(${lag}% - 4px)` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
            {/* Основная */}
            <motion.div
              className="relative h-full"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              style={{
                background: defeated
                  ? "linear-gradient(90deg,#34d399,#d1fae5)"
                  : `linear-gradient(90deg, #7f1030, ${main}, #ffb4c2)`,
                boxShadow: `0 0 12px ${main}`,
              }}
            />
            {/* Сегменты */}
            <div className="absolute inset-[2px] flex pointer-events-none">
              {Array.from({ length: SEGMENTS }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 border-r border-black/70 last:border-r-0"
                />
              ))}
            </div>
            {/* Отметки фаз */}
            {[33, 66].map((p) => (
              <span
                key={p}
                className="absolute top-[-3px] bottom-[-3px] w-px bg-white/70"
                style={{ left: `${p}%` }}
              />
            ))}
          </div>

          <div className="mt-1.5 text-center text-[9px] tracking-[0.2em] uppercase text-[#8fb6e6]">
            {defeated
              ? "НОВЫЙ БОСС ПОЯВИТСЯ В ПОНЕДЕЛЬНИК"
              : `ОСТАЛОСЬ ${SEGMENTS - filled + 0 === SEGMENTS ? SEGMENTS : filled} ИЗ ${SEGMENTS} ПОЛОС · КАЖДЫЙ КВЕСТ БЬЁТ ПО БОССУ`}
          </div>
        </div>

        {/* Красная виньетка в ярости */}
        {rage && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            animate={{ opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ boxShadow: "inset 0 0 40px rgba(255,45,85,0.8)" }}
          />
        )}
      </motion.div>
    </section>
  );
}
