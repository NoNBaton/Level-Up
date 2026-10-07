"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert } from "lucide-react";

function Sparks({ count = 26 }) {
  const sparks = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const dist = 160 + Math.random() * 180;
        return {
          id: i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          delay: Math.random() * 0.15,
          size: 2 + Math.random() * 4,
        };
      }),
    [count],
  );

  return (
    <>
      {sparks.map((s) => (
        <motion.div
          key={s.id}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
          animate={{
            x: s.x,
            y: s.y,
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.3],
          }}
          transition={{ duration: 1.1, delay: s.delay, ease: "easeOut" }}
          className="fixed top-1/2 left-1/2 rounded-full pointer-events-none z-[162]"
          style={{
            width: s.size,
            height: s.size,
            background: "#eafcff",
            boxShadow: "0 0 10px #5ecbff, 0 0 18px #5ecbff",
          }}
        />
      ))}
    </>
  );
}

export default function RankUpFlash({ active, rank }) {
  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Затемнение фона для акцента */}
          <motion.div
            key="dim"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.75, 0.75, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.4, times: [0, 0.12, 0.85, 1] }}
            className="fixed inset-0 z-[160] bg-black pointer-events-none"
          />

          {/* Вспышка в момент удара */}
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, times: [0, 0.3, 1] }}
            className="fixed inset-0 z-[161] pointer-events-none"
            style={{ background: "#dff0ff" }}
          />

          {/* Расходящееся кольцо энергии */}
          <motion.div
            key="ring"
            initial={{ scale: 0.1, opacity: 0.9 }}
            animate={{ scale: 6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.3, ease: "easeOut" }}
            className="fixed top-1/2 left-1/2 w-24 h-24 -ml-12 -mt-12 rounded-full pointer-events-none z-[161]"
            style={{
              border: "2px solid #5ecbff",
              boxShadow: "0 0 30px #5ecbff",
            }}
          />

          <Sparks />

          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.7, 1.05, 1, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.4, times: [0, 0.2, 0.85, 1] }}
            className="fixed inset-0 z-[163] flex flex-col items-center justify-center gap-3 pointer-events-none px-6"
          >
            <ShieldAlert
              className="w-12 h-12 text-white"
              style={{ filter: "drop-shadow(0 0 14px #5ecbff)" }}
            />
            <div
              className="text-xs sm:text-sm font-black tracking-[0.3em] uppercase text-[#9fd0ff]"
              style={{ textShadow: "0 0 10px #5ecbff" }}
            >
              РАНГ ПОВЫШЕН
            </div>
            <div
              className="text-5xl sm:text-6xl font-black tracking-[0.1em] text-white"
              style={{
                textShadow:
                  "0 0 20px #5ecbff, 0 0 50px #5ecbff, 0 0 100px #5ecbff",
              }}
            >
              {rank}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
