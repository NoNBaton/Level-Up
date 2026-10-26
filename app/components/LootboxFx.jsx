"use client";

import React, { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Gift } from "lucide-react";

// ---------- Настройки эффектов по редкостям ----------
export const FX = {
  common: {
    parts: 14,
    reach: 70,
    rings: 1,
    rays: 0,
    flash: 0.2,
    shake: 0,
    rain: 0,
    vib: [30],
    banner: null,
  },
  rare: {
    parts: 30,
    reach: 110,
    rings: 2,
    rays: 0.2,
    flash: 0.4,
    shake: 0,
    rain: 0,
    vib: [60],
    banner: "РЕДКАЯ НАХОДКА",
  },
  epic: {
    parts: 55,
    reach: 160,
    rings: 3,
    rays: 0.32,
    flash: 0.6,
    shake: 7,
    rain: 10,
    vib: [80, 40, 120],
    banner: "ЭПИЧЕСКАЯ НАХОДКА",
  },
  legendary: {
    parts: 100,
    reach: 220,
    rings: 4,
    rays: 0.5,
    flash: 0.95,
    shake: 13,
    rain: 28,
    vib: [100, 50, 100, 50, 300],
    banner: "ЛЕГЕНДАРНЫЙ ДРОП",
  },
};

export const vibrateFor = (rarity) => {
  try {
    navigator.vibrate?.((FX[rarity] || FX.common).vib);
  } catch {
    // ignore
  }
};

// Вспышка на весь экран (через портал, чтобы не зависеть от родителей)
function Flash({ color, peak }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <motion.div
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, peak, 0] }}
      transition={{ duration: 0.75, times: [0, 0.12, 1], ease: "easeOut" }}
      className="fixed inset-0 z-[200] pointer-events-none"
      style={{
        background: `radial-gradient(circle at 50% 50%, #fff 0%, ${color} 55%, rgba(0,0,0,0) 100%)`,
      }}
    />,
    document.body,
  );
}

// Ударные волны
function Rings({ color, count, size = 120 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          aria-hidden
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size,
            height: size,
            left: "50%",
            top: "50%",
            marginLeft: -size / 2,
            marginTop: -size / 2,
            border: `${3 - Math.min(i, 2) * 0.7}px solid ${color}`,
            boxShadow: `0 0 24px ${color}, inset 0 0 24px ${color}`,
          }}
          initial={{ scale: 0.2, opacity: 0.95 }}
          animate={{ scale: 3.4 + i * 0.9, opacity: 0 }}
          transition={{
            duration: 1 + i * 0.2,
            delay: i * 0.14,
            ease: "easeOut",
          }}
        />
      ))}
    </>
  );
}

// Искры, разлетающиеся от центра
function Sparks({ color, count, reach }) {
  const list = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = Math.random() * Math.PI * 2;
        const d = reach * 0.4 + Math.random() * reach;
        return {
          id: i,
          x: Math.cos(a) * d,
          y: Math.sin(a) * d - 20,
          s: 2 + Math.random() * 4,
          dl: Math.random() * 0.25,
          du: 0.8 + Math.random() * 0.9,
        };
      }),
    [count, reach],
  );
  return (
    <>
      {list.map((p) => (
        <motion.span
          key={p.id}
          aria-hidden
          className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
          style={{
            width: p.s,
            height: p.s,
            background: "#fff",
            boxShadow: `0 0 8px ${color}, 0 0 16px ${color}`,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.2 }}
          transition={{ duration: p.du, delay: p.dl, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

// ---------- 1. Коробка: покой, зарядка, взрыв ----------
export function ChargeBox({ phase, info, count, color, chargeMs = 1600 }) {
  const shaking = phase === "shake";
  const bursting = phase === "burst";
  const c = bursting ? color : info.color;

  const inflow = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const a = (i / 30) * Math.PI * 2 + Math.random();
        return {
          id: i,
          x: Math.cos(a) * (130 + Math.random() * 40),
          y: Math.sin(a) * (130 + Math.random() * 40),
          dl: Math.random() * 0.8,
          du: 0.45 + Math.random() * 0.4,
          s: 2 + Math.random() * 3,
        };
      }),
    [],
  );

  const debris = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => {
        const a = Math.random() * Math.PI * 2;
        const d = 90 + Math.random() * 190;
        return {
          id: i,
          x: Math.cos(a) * d,
          y: Math.sin(a) * d,
          r: (Math.random() - 0.5) * 540,
          s: 5 + Math.random() * 9,
          dl: Math.random() * 0.15,
        };
      }),
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      className="relative flex items-center justify-center"
      style={{ width: 160, height: 160 }}
    >
      {/* Аура */}
      <motion.div
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 260,
          height: 260,
          background: `radial-gradient(circle, ${c}66, transparent 65%)`,
        }}
        animate={
          shaking
            ? { scale: [1, 1.5], opacity: [0.4, 1] }
            : { scale: [1, 1.12, 1], opacity: [0.5, 0.8, 0.5] }
        }
        transition={
          shaking
            ? { duration: chargeMs / 1000, ease: "easeIn" }
            : { duration: 3, repeat: Infinity }
        }
      />

      {/* Кольца вокруг коробки */}
      {!bursting && (
        <>
          <motion.svg
            viewBox="0 0 100 100"
            className="absolute pointer-events-none"
            style={{ width: 210, height: 210 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: shaking ? 1.4 : 14,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke={c}
              strokeWidth="0.8"
              strokeDasharray="4 6"
              opacity="0.9"
            />
          </motion.svg>
          <motion.svg
            viewBox="0 0 100 100"
            className="absolute pointer-events-none"
            style={{ width: 240, height: 240 }}
            animate={{ rotate: -360 }}
            transition={{
              duration: shaking ? 2 : 22,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke={c}
              strokeWidth="0.6"
              strokeDasharray="14 9"
              opacity="0.5"
            />
          </motion.svg>
        </>
      )}

      {/* Лучи света из щелей коробки при зарядке */}
      {shaking &&
        Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 pointer-events-none"
            style={{
              transform: `rotate(${i * 36}deg)`,
              transformOrigin: "0 0",
            }}
          >
            <motion.div
              style={{
                width: 3,
                height: 190,
                marginLeft: -1.5,
                transformOrigin: "50% 0",
                background: `linear-gradient(to bottom, #fff, ${c}, transparent)`,
              }}
              initial={{ scaleY: 0.1, opacity: 0 }}
              animate={{ scaleY: [0.1, 0.5, 1], opacity: [0, 0.4, 0.95] }}
              transition={{
                duration: chargeMs / 1000,
                delay: i * 0.03,
                ease: "easeIn",
              }}
            />
          </div>
        ))}

      {/* Энергия, втягивающаяся в коробку */}
      {shaking &&
        inflow.map((p) => (
          <motion.span
            key={p.id}
            aria-hidden
            className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
            style={{
              width: p.s,
              height: p.s,
              background: "#fff",
              boxShadow: `0 0 8px ${c}, 0 0 14px ${c}`,
            }}
            initial={{ x: p.x, y: p.y, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: [0, 1, 0] }}
            transition={{
              duration: p.du,
              delay: p.dl,
              repeat: Infinity,
              ease: "easeIn",
            }}
          />
        ))}

      {/* Сама коробка */}
      {!bursting && (
        <motion.div
          className="w-40 h-40 border-2 flex items-center justify-center relative"
          style={{
            borderColor: c,
            background: `radial-gradient(circle at 50% 40%, ${c}55, rgba(2,8,23,0.92) 70%)`,
          }}
          animate={
            shaking
              ? {
                  rotate: [0, -3, 3, -5, 5, -8, 8, -11, 11, -14, 14, 0],
                  x: [0, -2, 2, -4, 4, -6, 6, -8, 8, -10, 10, 0],
                  scale: [1, 1.03, 1.06, 1.09, 1.12, 1.16, 1.2],
                  boxShadow: [
                    `0 0 20px ${c}88`,
                    `0 0 60px ${c}, inset 0 0 50px ${c}88`,
                    `0 0 110px #fff, inset 0 0 80px ${c}`,
                  ],
                }
              : {
                  y: [0, -8, 0],
                  rotate: 0,
                  boxShadow: `0 0 30px ${c}88, inset 0 0 30px ${c}33`,
                }
          }
          transition={
            shaking
              ? { duration: chargeMs / 1000, ease: "easeIn" }
              : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <Gift
            className="w-20 h-20"
            style={{ color: c, filter: `drop-shadow(0 0 10px ${c})` }}
          />
          <div
            className="absolute -bottom-8 text-[10px] tracking-[0.3em] whitespace-nowrap"
            style={{ color: c }}
          >
            {shaking
              ? "ВСКРЫТИЕ..."
              : count > 0
                ? `В НАЛИЧИИ: ${count}`
                : "ПУСТО"}
          </div>
        </motion.div>
      )}

      {/* ВЗРЫВ (цвет = редкость выпавшего) */}
      {bursting && (
        <>
          <Flash color={color} peak={0.65} />
          <motion.div
            aria-hidden
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 120,
              height: 120,
              background: `radial-gradient(circle, #fff, ${color} 50%, transparent 72%)`,
            }}
            initial={{ scale: 0.3, opacity: 1 }}
            animate={{ scale: 7, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <Rings color={color} count={3} size={110} />
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 pointer-events-none"
              style={{
                transform: `rotate(${i * (360 / 14)}deg)`,
                transformOrigin: "0 0",
              }}
            >
              <motion.div
                style={{
                  width: 4,
                  height: 230,
                  marginLeft: -2,
                  transformOrigin: "50% 0",
                  background: `linear-gradient(to bottom, #fff, ${color}, transparent)`,
                }}
                initial={{ scaleY: 0, opacity: 1 }}
                animate={{ scaleY: 1, opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </div>
          ))}
          {debris.map((p) => (
            <motion.div
              key={p.id}
              aria-hidden
              className="absolute left-1/2 top-1/2 pointer-events-none"
              style={{
                width: p.s,
                height: p.s,
                background: Math.random() > 0.4 ? color : "#fff",
                boxShadow: `0 0 8px ${color}`,
              }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
              animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.r, scale: 0.2 }}
              transition={{ duration: 0.8, delay: p.dl, ease: "easeOut" }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}

// ---------- 2. Эффекты за карточкой при показе предмета ----------
export function RevealFx({ rarity, color, top = 135 }) {
  const cfg = FX[rarity] || FX.common;

  // тряска всего экрана
  useEffect(() => {
    if (!cfg.shake) return;
    const el = document.querySelector("main");
    if (!el || !el.animate) return;
    const s = cfg.shake;
    const a = el.animate(
      [
        { transform: "translate(0,0)" },
        { transform: `translate(${-s}px,${s * 0.5}px)` },
        { transform: `translate(${s}px,${-s * 0.5}px)` },
        { transform: `translate(${-s * 0.7}px,${-s * 0.4}px)` },
        { transform: `translate(${s * 0.7}px,${s * 0.4}px)` },
        { transform: `translate(${-s * 0.35}px,0)` },
        { transform: "translate(0,0)" },
      ],
      { duration: rarity === "legendary" ? 700 : 450, easing: "ease-out" },
    );
    return () => a.cancel();
  }, [cfg.shake, rarity]);

  const rain = useMemo(
    () =>
      Array.from({ length: cfg.rain }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        dl: Math.random() * 2.5,
        du: 1.8 + Math.random() * 1.6,
        s: 2 + Math.random() * 3,
      })),
    [cfg.rain],
  );

  return (
    <>
      <Flash color={color} peak={cfg.flash} />

      <div
        aria-hidden
        className="absolute left-1/2 pointer-events-none"
        style={{ top, width: 0, height: 0 }}
      >
        {/* Вращающиеся лучи */}
        {cfg.rays > 0 && (
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 460,
              height: 460,
              marginLeft: -230,
              marginTop: -230,
              opacity: cfg.rays,
              background: `repeating-conic-gradient(from 0deg, ${color} 0deg 5deg, transparent 5deg 30deg)`,
              WebkitMaskImage:
                "radial-gradient(circle, #000 5%, transparent 68%)",
              maskImage: "radial-gradient(circle, #000 5%, transparent 68%)",
            }}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: cfg.rays, rotate: 360 }}
            transition={{
              scale: { duration: 0.6 },
              opacity: { duration: 0.6 },
              rotate: { duration: 24, repeat: Infinity, ease: "linear" },
            }}
          />
        )}

        {/* Мягкое свечение */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 300,
            height: 300,
            marginLeft: -150,
            marginTop: -150,
            background: `radial-gradient(circle, ${color}aa, transparent 68%)`,
          }}
          initial={{ opacity: 0.95, scale: 0.3 }}
          animate={
            rarity === "legendary" || rarity === "epic"
              ? {
                  opacity: [0.95, 0.35, 0.6, 0.35],
                  scale: [0.3, 1.5, 1.2, 1.35],
                }
              : { opacity: [0.9, 0.2], scale: [0.3, 1.6] }
          }
          transition={{
            duration: 1.4,
            ease: "easeOut",
            repeat: rarity === "legendary" || rarity === "epic" ? Infinity : 0,
            repeatType: "reverse",
          }}
        />

        <Rings color={color} count={cfg.rings} size={130} />
        <Sparks color={color} count={cfg.parts} reach={cfg.reach} />

        {/* Дождь искр для эпика и легендарки */}
        {rain.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: (p.left - 50) * 3.2,
              top: -170,
              width: p.s,
              height: p.s,
              background: "#fff",
              boxShadow: `0 0 8px ${color}, 0 0 14px ${color}`,
            }}
            animate={{ y: [0, 340], opacity: [0, 1, 0] }}
            transition={{
              duration: p.du,
              delay: p.dl,
              repeat: Infinity,
              ease: "easeIn",
            }}
          />
        ))}
      </div>
    </>
  );
}

// ---------- 3. Надпись над карточкой ----------
export function RarityBanner({ rarity, color }) {
  const cfg = FX[rarity] || FX.common;
  if (!cfg.banner) return <div className="h-2" />;
  const gold = rarity === "legendary";
  return (
    <motion.div
      className="mb-2 text-[11px] font-black tracking-[0.35em] uppercase text-center"
      initial={{ opacity: 0, scale: 2, letterSpacing: "0.9em" }}
      animate={{ opacity: 1, scale: 1, letterSpacing: "0.35em" }}
      transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
      style={{
        color: gold ? "#ffe9a8" : color,
        textShadow: `0 0 10px ${color}, 0 0 24px ${color}`,
      }}
    >
      {cfg.banner}
    </motion.div>
  );
}

// ---------- 4. Блик на карточке (rare и выше) ----------
export function Shine({ rarity }) {
  if (rarity === "common") return null;
  const speed = rarity === "legendary" ? 1.6 : rarity === "epic" ? 2.2 : 3;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute inset-y-0 w-1/2"
        style={{
          background:
            "linear-gradient(105deg, transparent, rgba(255,255,255,0.45), transparent)",
        }}
        initial={{ x: "-120%" }}
        animate={{ x: "320%" }}
        transition={{
          duration: speed,
          repeat: Infinity,
          repeatDelay: 1.2,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
