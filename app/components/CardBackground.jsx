"use client";

import React from "react";

const KEYFRAMES = `
@keyframes cbGrid { from { background-position: 0 0, 0 0; } to { background-position: 0 28px, 28px 0; } }
@keyframes cbBar { from { transform: translateY(-40px); } to { transform: translateY(380px); } }
@keyframes cbTwinkle { 0%,100% { opacity: .25; } 50% { opacity: 1; } }
@keyframes cbRain { from { background-position: 0 0; } to { background-position: -24px 60px; } }
@keyframes cbFlash { 0%,90%,100% { opacity: 0; } 91% { opacity: .55; } 92% { opacity: 0; } 94% { opacity: .35; } 96% { opacity: 0; } }
@keyframes cbFall { from { transform: translateY(-90px); opacity: 0; } 15% { opacity: 1; } to { transform: translateY(380px); opacity: 0; } }
@keyframes cbRise { from { transform: translateY(0) scale(1); opacity: 0; } 20% { opacity: .9; } to { transform: translateY(-300px) scale(.3); opacity: 0; } }
@keyframes cbDrift { 0%,100% { transform: translate(-10%, 0) scale(1); } 50% { transform: translate(12%, -8%) scale(1.25); } }
@keyframes cbSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes cbSweep { from { transform: translateX(-120%); } to { transform: translateX(220%); } }
@keyframes cbPulse { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
`;

const fill = { position: "absolute", inset: 0 };

function Streaks({ color, count = 14, kind = "fall" }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const left = ((i * 37 + 11) % 97) + 1;
        const dur = 2.4 + ((i * 13) % 17) / 5;
        const delay = -((i * 7) % 11) / 2;
        const rise = kind === "rise";
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: rise ? "100%" : 0,
              width: rise ? 5 : 2,
              height: rise ? 5 : 70,
              borderRadius: rise ? 9999 : 0,
              background: rise
                ? color
                : `linear-gradient(180deg, transparent, ${color})`,
              boxShadow: rise ? `0 0 8px ${color}` : "none",
              animation: `${rise ? "cbRise" : "cbFall"} ${dur}s linear ${delay}s infinite`,
            }}
          />
        );
      })}
    </>
  );
}

export default function CardBackground({
  id,
  glow = "94,203,255",
  z = "-z-10",
}) {
  if (!id) return null;
  let layers = null;

  if (id === "bg_grid") {
    layers = (
      <div
        style={{
          ...fill,
          backgroundImage: `linear-gradient(rgba(${glow},0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(${glow},0.2) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          animation: "cbGrid 3s linear infinite",
        }}
      />
    );
  } else if (id === "bg_scan") {
    layers = (
      <>
        <div
          style={{
            ...fill,
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 4px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 40,
            background: `linear-gradient(180deg, transparent, rgba(${glow},0.35), transparent)`,
            animation: "cbBar 3.2s linear infinite",
          }}
        />
      </>
    );
  } else if (id === "bg_stars") {
    const dots = [
      "radial-gradient(1.5px 1.5px at 20px 30px, #fff, transparent)",
      "radial-gradient(1px 1px at 70px 80px, #cfe6ff, transparent)",
      "radial-gradient(1.5px 1.5px at 110px 20px, #fff, transparent)",
      "radial-gradient(1px 1px at 40px 110px, #a5b4fc, transparent)",
    ];
    layers = (
      <>
        <div
          style={{
            ...fill,
            background:
              "radial-gradient(circle at 50% 120%, rgba(99,102,241,0.35), transparent 60%)",
          }}
        />
        <div
          style={{
            ...fill,
            backgroundImage: dots.join(","),
            backgroundSize: "130px 130px",
            animation: "cbTwinkle 3s ease-in-out infinite",
          }}
        />
        <div
          style={{
            ...fill,
            backgroundImage: dots.join(","),
            backgroundSize: "170px 170px",
            backgroundPosition: "40px 60px",
            animation: "cbTwinkle 4.3s ease-in-out -1.5s infinite",
          }}
        />
      </>
    );
  } else if (id === "bg_storm") {
    layers = (
      <>
        <div
          style={{
            ...fill,
            background:
              "linear-gradient(180deg, rgba(30,41,90,0.7), rgba(2,8,23,0.2))",
          }}
        />
        <div
          style={{
            ...fill,
            backgroundImage:
              "repeating-linear-gradient(105deg, rgba(180,200,255,0.28) 0 1px, transparent 1px 9px)",
            animation: "cbRain 0.7s linear infinite",
          }}
        />
        <div
          style={{
            ...fill,
            background: "rgba(220,230,255,0.9)",
            animation: "cbFlash 6s linear infinite",
          }}
        />
      </>
    );
  } else if (id === "bg_matrix") {
    layers = (
      <>
        <div style={{ ...fill, background: "rgba(0,20,10,0.55)" }} />
        <Streaks color="#34d399" count={16} kind="fall" />
      </>
    );
  } else if (id === "bg_aurora") {
    const blob = (color, left, top, dur, delay) => (
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: "70%",
          height: "70%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}, transparent 65%)`,
          filter: "blur(18px)",
          animation: `cbDrift ${dur}s ease-in-out ${delay}s infinite`,
        }}
      />
    );
    layers = (
      <>
        {blob("rgba(45,212,191,0.55)", "-10%", "-10%", 7, 0)}
        {blob("rgba(168,85,247,0.5)", "40%", "10%", 9, -3)}
        {blob("rgba(52,211,153,0.45)", "10%", "45%", 11, -6)}
      </>
    );
  } else if (id === "bg_void") {
    layers = (
      <>
        <div
          style={{
            ...fill,
            background:
              "radial-gradient(circle at 50% 50%, rgba(2,0,12,0.9), rgba(30,10,70,0.6))",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "-50%",
            top: "-50%",
            width: "200%",
            height: "200%",
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(99,102,241,0.35) 60deg, transparent 130deg, rgba(168,85,247,0.3) 220deg, transparent 300deg)",
            animation: "cbSpin 14s linear infinite",
          }}
        />
      </>
    );
  } else if (id === "bg_gold") {
    layers = (
      <>
        <div
          style={{
            ...fill,
            background:
              "linear-gradient(135deg, rgba(120,80,10,0.55), rgba(20,12,2,0.3))",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: "45%",
            background:
              "linear-gradient(105deg, transparent 20%, rgba(255,225,120,0.45) 50%, transparent 80%)",
            animation: "cbSweep 3.8s ease-in-out infinite",
          }}
        />
        <div
          style={{
            ...fill,
            backgroundImage:
              "radial-gradient(1.5px 1.5px at 30px 40px, #ffe28a, transparent), radial-gradient(1px 1px at 90px 90px, #fff3c4, transparent)",
            backgroundSize: "110px 110px",
            animation: "cbTwinkle 2.4s ease-in-out infinite",
          }}
        />
      </>
    );
  } else if (id === "bg_shadow") {
    layers = (
      <>
        <div
          style={{
            ...fill,
            background:
              "radial-gradient(circle at 50% 100%, rgba(76,29,149,0.75), rgba(5,2,15,0.85) 70%)",
            animation: "cbPulse 3.5s ease-in-out infinite",
          }}
        />
        <Streaks color="#a78bfa" count={14} kind="rise" />
      </>
    );
  }

  if (!layers) return null;
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${z}`}
    >
      <style>{KEYFRAMES}</style>
      {layers}
    </div>
  );
}
