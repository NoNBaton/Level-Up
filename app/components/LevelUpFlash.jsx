"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Embers({ count = 20 }) {
  const embers = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 0.9 + Math.random() * 0.7,
        size: 3 + Math.random() * 6,
        drift: (Math.random() - 0.5) * 60,
      })),
    [count],
  );

  return (
    <>
      {embers.map((e) => (
        <motion.div
          key={e.id}
          initial={{ y: "100vh", x: 0, opacity: 0 }}
          animate={{
            y: "-10vh",
            x: e.drift,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: e.duration,
            delay: e.delay,
            ease: "easeOut",
          }}
          className="fixed bottom-0 rounded-full pointer-events-none z-[152]"
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            background:
              "radial-gradient(circle, #eafcff 0%, #5ecbff 45%, #1a6fd1 100%)",
            boxShadow: "0 0 10px #5ecbff, 0 0 20px #1a6fd1",
          }}
        />
      ))}
    </>
  );
}

export default function LevelUpFlash({ active, level }) {
  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Пламя снизу вверх */}
          <motion.div
            key="fire"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, times: [0, 0.2, 1] }}
            className="fixed inset-0 z-[150] pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 120%, rgba(94,203,255,0.95) 0%, rgba(59,157,255,0.55) 30%, rgba(10,30,80,0.25) 55%, transparent 75%)",
            }}
          />
          {/* Яркая вспышка в момент удара */}
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.75, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, times: [0, 0.25, 1] }}
            className="fixed inset-0 z-[150] pointer-events-none"
            style={{ background: "#9fe3ff" }}
          />

          <Embers />

          <motion.div
            key="label"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.6, 1.1, 1, 1],
              x: [0, -8, 8, -5, 5, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, times: [0, 0.2, 0.8, 1] }}
            className="fixed inset-0 z-[151] flex items-center justify-center pointer-events-none"
          >
            <div
              className="text-5xl sm:text-6xl font-black tracking-[0.15em] text-white"
              style={{
                textShadow:
                  "0 0 20px #5ecbff, 0 0 50px #1a6fd1, 0 0 90px #1a6fd1",
              }}
            >
              LVL {level}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
