"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SystemWindow, { SysButton, SysSubtitle, SysRow } from "./SystemWindow";
import { sfx } from "../lib/sounds";

/* ───────────────────────── утилиты ───────────────────────── */

const safe = (fn) => {
  try {
    fn?.();
  } catch {
    // ignore
  }
};

const vibrate = (p) => {
  try {
    navigator.vibrate?.(p);
  } catch {
    // ignore
  }
};

/* ───────────────────────── звук (синтез, без файлов) ───────────────────────── */

function createGateAudio() {
  let ctx = null;

  const get = () => {
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
      }
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    } catch {
      return null;
    }
  };

  // низкий гул земли
  const rumble = (dur = 3, vol = 0.4) => {
    try {
      const c = get();
      if (!c) return;
      const len = Math.floor(c.sampleRate * dur);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource();
      src.buffer = buf;
      const lp = c.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 130;
      const g = c.createGain();
      const t = c.currentTime;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(lp);
      lp.connect(g);
      g.connect(c.destination);
      src.start(t);
    } catch {
      // ignore
    }
  };

  // тяжёлый удар
  const boom = (vol = 0.6) => {
    try {
      const c = get();
      if (!c) return;
      const o = c.createOscillator();
      const g = c.createGain();
      const t = c.currentTime;
      o.type = "sine";
      o.frequency.setValueAtTime(75, t);
      o.frequency.exponentialRampToValueAtTime(26, t + 1.3);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      o.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + 1.5);
    } catch {
      // ignore
    }
  };

  // звон загорающейся руны
  const chime = (i = 0) => {
    try {
      const c = get();
      if (!c) return;
      const base = [262, 294, 330, 392, 440];
      const f = base[i % 5] * (1 + Math.floor(i / 5));
      const o = c.createOscillator();
      const g = c.createGain();
      const t = c.currentTime;
      o.type = "triangle";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      o.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + 0.75);
    } catch {
      // ignore
    }
  };

  const close = () => {
    try {
      ctx?.close();
    } catch {
      // ignore
    }
    ctx = null;
  };

  return { rumble, boom, chime, close };
}

function useGateAudio() {
  const ref = useRef(null);
  if (!ref.current) ref.current = createGateAudio();
  return ref.current;
}

/* ───────────────────────── геометрия арки ───────────────────────── */

// квадратичные кривые: [старт, контроль, конец]
const OUTER_L = [
  [0, 280],
  [10, 110],
  [240, 0],
];
const INNER_L = [
  [40, 285],
  [50, 150],
  [240, 62],
];

const q = (p, t) => [
  (1 - t) ** 2 * p[0][0] + 2 * t * (1 - t) * p[1][0] + t * t * p[2][0],
  (1 - t) ** 2 * p[0][1] + 2 * t * (1 - t) * p[1][1] + t * t * p[2][1],
];
const dq = (p, t) => [
  2 * (1 - t) * (p[1][0] - p[0][0]) + 2 * t * (p[2][0] - p[1][0]),
  2 * (1 - t) * (p[1][1] - p[0][1]) + 2 * t * (p[2][1] - p[1][1]),
];

const OUTER_D = "M0 720 V280 Q10 110 240 0 Q470 110 480 280 V720 Z";
const INNER_D = "M40 720 V285 Q50 150 240 62 Q430 150 440 285 V720 Z";
const FRAME_D = `${OUTER_D} ${INNER_D}`;

// коробка дверей: x 40..440, y 62..720 → проценты
const DOOR_CLIP = (() => {
  const pts = [
    [40, 720],
    [40, 285],
  ];
  for (let i = 1; i <= 24; i++) pts.push(q(INNER_L, i / 24));
  for (let i = 23; i >= 0; i--) {
    const [x, y] = q(INNER_L, i / 24);
    pts.push([480 - x, y]);
  }
  pts.push([440, 720]);
  const pct = pts.map(
    ([x, y]) =>
      `${(((x - 40) / 400) * 100).toFixed(2)}% ${(((y - 62) / 658) * 100).toFixed(2)}%`,
  );
  return `polygon(${pct.join(",")})`;
})();

// линии кладки камня
const STONE_LINES = (() => {
  const L = [];
  [0.1, 0.22, 0.34, 0.46, 0.58, 0.7, 0.82, 0.93].forEach((t) => {
    const o = q(OUTER_L, t);
    const n = q(INNER_L, t);
    L.push([o[0], o[1], n[0], n[1]]);
    L.push([480 - o[0], o[1], 480 - n[0], n[1]]);
  });
  [330, 395, 460, 525, 590, 655].forEach((y) => {
    L.push([0, y, 40, y]);
    L.push([440, y, 480, y]);
  });
  return L;
})();

/* ───────────────────────── руны ───────────────────────── */

const GLYPHS = [
  "M0 -7 V7 M0 -2 L5 -6 M0 2 L5 -2",
  "M-4 -7 V7 M-4 -7 L4 -1 L-4 3",
  "M-5 7 L0 -7 L5 7 M-3 2 H3",
  "M-5 -7 L5 7 M5 -7 L-5 7",
  "M0 -7 L5 0 L0 7 L-5 0 Z M0 -3 V3",
  "M-4 -7 V7 M4 -7 V7 M-4 -3 L4 3",
];

// порядок = порядок зажигания (снизу вверх, к замковому камню)
const RUNES = (() => {
  const list = [];
  [650, 560, 470, 380].forEach((y, i) => {
    list.push({ x: 20, y, rot: 0, g: (i * 2) % 6 });
    list.push({ x: 460, y, rot: 0, g: (i * 2 + 1) % 6 });
  });
  [0.2, 0.4, 0.6, 0.8].forEach((t, i) => {
    const o = q(OUTER_L, t);
    const n = q(INNER_L, t);
    const x = (o[0] + n[0]) / 2;
    const y = (o[1] + n[1]) / 2;
    const d1 = dq(OUTER_L, t);
    const d2 = dq(INNER_L, t);
    const rot = (Math.atan2(d1[1] + d2[1], d1[0] + d2[0]) * 180) / Math.PI + 90;
    list.push({ x, y, rot, g: (i + 2) % 6 });
    list.push({ x: 480 - x, y, rot: -rot, g: (i + 4) % 6 });
  });
  list.push({ x: 240, y: 30, rot: 0, g: 4, key: true });
  return list;
})();

/* ───────────────────────── стили и анимации ───────────────────────── */

const CSS = `
@keyframes gShakeS{0%,100%{transform:translate(0,0)}20%{transform:translate(-1px,1px)}40%{transform:translate(1px,-1px)}60%{transform:translate(-1.5px,-1px)}80%{transform:translate(1px,1.5px)}}
@keyframes gShakeL{0%,100%{transform:translate(0,0)}15%{transform:translate(-5px,3px)}30%{transform:translate(4px,-4px)}45%{transform:translate(-4px,-3px)}60%{transform:translate(5px,4px)}75%{transform:translate(-3px,5px)}90%{transform:translate(3px,-3px)}}
.g-shake-s{animation:gShakeS .22s linear infinite}
.g-shake-l{animation:gShakeL .16s linear infinite}
@keyframes gMist{from{transform:translateX(-5%)}to{transform:translateX(5%)}}
.g-mist{position:absolute;left:-20%;right:-20%;bottom:-12%;height:90%;filter:blur(20px);background:radial-gradient(ellipse 38% 45% at 28% 62%,rgba(120,205,235,.30),transparent 70%),radial-gradient(ellipse 34% 42% at 72% 70%,rgba(70,140,200,.24),transparent 70%);animation:gMist 13s ease-in-out infinite alternate}
.g-mist-b{animation-duration:19s;animation-direction:alternate-reverse;opacity:.7;bottom:-18%}
@keyframes gSpin{to{transform:rotate(360deg)}}
.g-spin{animation:gSpin 38s linear infinite}
@keyframes gBreathe{0%,100%{transform:scale(1);opacity:.85}50%{transform:scale(1.07);opacity:1}}
.g-breathe{animation:gBreathe 3.2s ease-in-out infinite}
@keyframes gEmblem{0%,100%{opacity:.55}50%{opacity:1}}
.g-emblem{animation:gEmblem 2.6s ease-in-out infinite}
@keyframes gBlink{0%,100%{opacity:1}50%{opacity:.25}}
.g-blink{animation:gBlink .9s steps(2,end) infinite}
.g-caret{opacity:.8;animation:gBlink .8s steps(2,end) infinite}
@keyframes gGlitch{0%,100%{text-shadow:2px 0 #ff2a55,-2px 0 #3ad7ff;transform:translateX(0)}20%{text-shadow:-3px 0 #ff2a55,3px 0 #3ad7ff;transform:translateX(-3px)}40%{text-shadow:2px 1px #ff2a55,-2px -1px #3ad7ff;transform:translateX(2px)}60%{text-shadow:-2px 0 #ff2a55,2px 0 #3ad7ff;transform:translateX(0)}80%{text-shadow:3px 0 #ff2a55,-3px 0 #3ad7ff;transform:translateX(3px)}}
.g-glitch{animation:gGlitch .35s steps(2,end) infinite}
@keyframes gCrt{0%{transform:scale(1,1);filter:brightness(1)}60%{transform:scale(1,.008);filter:brightness(5)}100%{transform:scale(0,.008);filter:brightness(5);opacity:0}}
.g-crt{animation:gCrt .6s cubic-bezier(.6,0,.4,1) forwards}
@media (prefers-reduced-motion:reduce){.g-shake-s,.g-shake-l,.g-mist,.g-spin,.g-breathe,.g-glitch{animation:none}}
`;

/* ───────────────────────── мелкие компоненты ───────────────────────── */

function TypeLine({ text, delay = 0, speed = 32, className = "", style }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let iv;
    const st = setTimeout(() => {
      iv = setInterval(() => {
        setN((v) => {
          if (v >= text.length) {
            clearInterval(iv);
            return v;
          }
          return v + 1;
        });
      }, speed);
    }, delay);
    return () => {
      clearTimeout(st);
      clearInterval(iv);
    };
  }, [text, delay, speed]);
  return (
    <div className={className} style={style}>
      {text.slice(0, n)}
      {n < text.length && <span className="g-caret">▌</span>}
    </div>
  );
}

// Искры и пыль
function EmberCanvas({ phase }) {
  const ref = useRef(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let acc = 0;
    let last = performance.now();
    const parts = [];

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (burst) => {
      if (burst) {
        parts.push({
          x: w / 2 + (Math.random() - 0.5) * w * 0.3,
          y: h * 0.6 + (Math.random() - 0.5) * h * 0.4,
          vx: (Math.random() - 0.5) * 220,
          vy: -(80 + Math.random() * 320),
          life: 0,
          max: 1 + Math.random() * 1.6,
          size: 1 + Math.random() * 2.8,
          tw: Math.random() * 6.28,
        });
      } else {
        parts.push({
          x: Math.random() * w,
          y: h + 8,
          vx: (Math.random() - 0.5) * 16,
          vy: -(20 + Math.random() * 50),
          life: 0,
          max: 5 + Math.random() * 6,
          size: 0.8 + Math.random() * 2.2,
          tw: Math.random() * 6.28,
        });
      }
    };

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const ph = phaseRef.current;
      const rate =
        ph === "black" || ph === "decline" ? 0 : ph === "opening" ? 150 : 26;

      if (!reduce) {
        acc += rate * dt;
        while (acc >= 1) {
          if (parts.length < 320) spawn(ph === "opening");
          acc -= 1;
        }
      }

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const danger = ph === "decline";
      const col = danger ? "255,90,110" : "130,215,255";

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life += dt;
        if (p.life >= p.max) {
          parts.splice(i, 1);
          continue;
        }
        p.tw += dt * 5;
        p.x += (p.vx + Math.sin(p.tw * 0.6) * 10) * dt;
        p.y += p.vy * dt;
        const k = p.life / p.max;
        const a = Math.sin(Math.PI * k) * (0.55 + 0.45 * Math.sin(p.tw));
        ctx.fillStyle = `rgba(${col},${(a * 0.9).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, 6.2832);
        ctx.fill();
        ctx.fillStyle = `rgba(${col},${(a * 0.18).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, 6.2832);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 pointer-events-none" />;
}

/* ───────────────────────── створки дверей ───────────────────────── */

function HalfArt({ uid, mirror, tint }) {
  const gold = `url(#gold${uid})`;
  const glow = { stroke: tint, transition: "stroke .4s" };
  return (
    <svg
      viewBox="0 0 200 658"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
      style={{ transform: mirror ? "scaleX(-1)" : undefined }}
    >
      <defs>
        <linearGradient id={`dg${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#17504f" />
          <stop offset="0.5" stopColor="#0f3438" />
          <stop offset="1" stopColor="#07181e" />
        </linearGradient>
        <linearGradient id={`gold${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6d98a" />
          <stop offset="0.5" stopColor="#b8893a" />
          <stop offset="1" stopColor="#6d4d1b" />
        </linearGradient>
        <linearGradient id={`sh${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.5" />
          <stop offset="0.35" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.15" />
        </linearGradient>
        <filter id={`eg${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="200" height="658" fill={`url(#dg${uid})`} />

      {/* доски */}
      {[40, 80, 120, 160].map((x) => (
        <line
          key={x}
          x1={x}
          y1="0"
          x2={x}
          y2="658"
          stroke="#000"
          strokeOpacity="0.25"
          strokeWidth="1.2"
        />
      ))}
      {[41, 81, 121, 161].map((x) => (
        <line
          key={x}
          x1={x}
          y1="0"
          x2={x}
          y2="658"
          stroke="#7fd6d0"
          strokeOpacity="0.06"
          strokeWidth="1"
        />
      ))}

      {/* верхняя арочная панель */}
      <path
        d="M26 360 V262 Q26 216 100 192 Q174 216 174 262 V360 Z"
        fill="rgba(3,22,26,.65)"
        stroke={gold}
        strokeWidth="3"
      />
      <path
        d="M36 350 V266 Q36 226 100 205 Q164 226 164 266 V350 Z"
        fill="none"
        stroke="rgba(246,217,138,.45)"
        strokeWidth="1.2"
      />
      {/* лилия над панелью */}
      <path
        d="M100 140 Q112 156 100 176 Q88 156 100 140 Z"
        fill={gold}
        opacity="0.9"
      />
      <path
        d="M100 168 Q82 160 78 174 Q78 184 90 182 M100 168 Q118 160 122 174 Q122 184 110 182"
        fill="none"
        stroke={gold}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* нижняя панель */}
      <path
        d="M36 410 H164 L174 420 V600 L164 610 H36 L26 600 V420 Z"
        fill="rgba(3,22,26,.65)"
        stroke={gold}
        strokeWidth="3"
      />
      <path
        d="M44 424 H156 L162 430 V590 L156 596 H44 L38 590 V430 Z"
        fill="none"
        stroke="rgba(246,217,138,.4)"
        strokeWidth="1.2"
      />

      {/* эмблема-печать */}
      <g className="g-emblem" filter={`url(#eg${uid})`}>
        <path
          d="M100 462 L134 510 L100 558 L66 510 Z"
          fill="none"
          strokeWidth="2.2"
          style={glow}
        />
        <circle
          cx="100"
          cy="510"
          r="11"
          fill="none"
          strokeWidth="1.8"
          style={glow}
        />
        <path
          d="M100 482 V538 M72 510 H128"
          fill="none"
          strokeWidth="1.2"
          opacity="0.7"
          style={glow}
        />
      </g>

      {/* железные полосы */}
      {[378, 626].map((y) => (
        <g key={y}>
          <rect
            x="0"
            y={y}
            width="200"
            height="13"
            fill="#0a1316"
            stroke={gold}
            strokeWidth="1.2"
          />
          {[20, 60, 100, 140].map((x) => (
            <circle key={x} cx={x} cy={y + 6.5} r="3" fill={gold} />
          ))}
        </g>
      ))}

      {/* заклёпки у петель */}
      {[210, 254, 298, 342, 410, 460, 510, 560, 600].map((y) => (
        <circle key={y} cx="11" cy={y} r="2.6" fill={gold} opacity="0.85" />
      ))}

      {/* золотой шов */}
      <rect x="192" y="0" width="8" height="658" fill={gold} />

      {/* ручка-кольцо */}
      <path d="M178 296 l8 10 l-8 10 l-8 -10 Z" fill={gold} />
      <circle
        cx="178"
        cy="330"
        r="11"
        fill="none"
        stroke={gold}
        strokeWidth="3.5"
      />

      <rect width="200" height="658" fill={`url(#sh${uid})`} />
    </svg>
  );
}

function Door({ side, phase, tint }) {
  const left = side === "left";
  const opening = phase === "opening";
  return (
    <motion.div
      className="absolute top-0 bottom-0 w-1/2"
      style={{
        [left ? "left" : "right"]: 0,
        transformOrigin: left ? "0% 50%" : "100% 50%",
        backfaceVisibility: "hidden",
        willChange: "transform",
      }}
      initial={false}
      animate={{
        rotateY: opening ? (left ? [0, -2.5, 104] : [0, 2.5, -104]) : 0,
      }}
      transition={{
        duration: opening ? 2.6 : 0.3,
        delay: opening ? 0.7 : 0,
        times: opening ? [0, 0.1, 1] : undefined,
        ease: "easeInOut",
      }}
    >
      <HalfArt uid={left ? "L" : "R"} mirror={!left} tint={tint} />
      <motion.div
        className="absolute inset-0 bg-black pointer-events-none"
        initial={false}
        animate={{ opacity: opening ? 0.85 : 0 }}
        transition={{ duration: 2.2, delay: opening ? 0.8 : 0 }}
      />
    </motion.div>
  );
}

/* ───────────────────────── каменная арка ───────────────────────── */

function Frame({ phase, lit }) {
  const ratio = lit / RUNES.length;
  const danger = phase === "decline";
  const flash = phase === "opening";
  const runeColor = danger ? "#ff5a73" : flash ? "#ffffff" : "#9fe8ff";

  return (
    <svg
      viewBox="0 0 480 720"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="stoneG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a4560" />
          <stop offset="0.5" stopColor="#242d42" />
          <stop offset="1" stopColor="#121826" />
        </linearGradient>
        <filter id="rGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="spill" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id="stoneNoise" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            seed="4"
            result="t"
          />
          <feColorMatrix
            in="t"
            type="matrix"
            values="0 0 0 0 0.5  0 0 0 0 0.55  0 0 0 0 0.65  0 0 0 0.9 -0.25"
          />
        </filter>
        <clipPath id="frameClip">
          <path d={FRAME_D} clipRule="evenodd" />
        </clipPath>
      </defs>

      <path d={FRAME_D} fillRule="evenodd" fill="url(#stoneG)" />
      <g clipPath="url(#frameClip)">
        <rect
          width="480"
          height="720"
          filter="url(#stoneNoise)"
          opacity="0.4"
          style={{ mixBlendMode: "overlay" }}
        />
        {STONE_LINES.map((l, i) => (
          <line
            key={i}
            x1={l[0]}
            y1={l[1]}
            x2={l[2]}
            y2={l[3]}
            stroke="#0b101b"
            strokeOpacity="0.75"
            strokeWidth="1.4"
          />
        ))}
      </g>
      <path d={OUTER_D} fill="none" stroke="#0a0e16" strokeWidth="3" />
      <path d={INNER_D} fill="none" stroke="#7a6232" strokeWidth="2.5" />

      {/* свет, льющийся из рун на двери */}
      <motion.path
        d={INNER_D}
        fill="none"
        stroke={danger ? "#ff4d6d" : "#8fe0ff"}
        strokeWidth="8"
        filter="url(#spill)"
        initial={false}
        animate={{ opacity: flash ? 0.95 : ratio * 0.55 }}
        transition={{ duration: 0.5 }}
      />

      {/* руны */}
      {RUNES.map((r, i) => {
        const on = i < lit;
        return (
          <g
            key={i}
            transform={`translate(${r.x} ${r.y}) rotate(${r.rot}) scale(${r.key ? 1.7 : 1.35})`}
          >
            <circle
              r="9.5"
              fill="#04121a"
              fillOpacity="0.75"
              stroke="#1a3b4c"
              strokeWidth="0.8"
            />
            <g filter="url(#rGlow)">
              <motion.path
                d={GLYPHS[r.g]}
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{
                  opacity: on ? 1 : 0.18,
                  stroke: on ? runeColor : "#2a5f78",
                }}
                transition={{ duration: 0.35 }}
              />
            </g>
          </g>
        );
      })}
    </svg>
  );
}

/* ───────────────────────── главный компонент ───────────────────────── */

export default function DungeonGate({ onEnter, onDecline }) {
  // black → emerge → ask → opening | decline
  const [phase, setPhase] = useState("black");
  const [lit, setLit] = useState(0);
  const [crt, setCrt] = useState(false);
  const audio = useGateAudio();
  const busy = useRef(false);
  const timers = useRef([]);

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  useEffect(() => {
    later(() => {
      setPhase((p) => (p === "black" ? "emerge" : p));
      audio.rumble(3.8, 0.45);
      vibrate([30, 60, 30]);
    }, 600);

    RUNES.forEach((_, i) => {
      later(
        () => {
          setLit((v) => Math.max(v, i + 1));
          audio.chime(i);
        },
        1300 + i * 150,
      );
    });

    later(() => {
      setPhase((p) => (p === "emerge" ? "ask" : p));
      safe(sfx.open);
    }, 4400);

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      audio.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleYes = () => {
    if (busy.current) return;
    busy.current = true;
    safe(sfx.completeTask);
    audio.boom(0.7);
    audio.rumble(3.2, 0.55);
    vibrate([80, 40, 160]);
    setPhase("opening");
    setLit(RUNES.length);
    later(() => onEnter?.(), 3700);
  };

  const handleNo = () => {
    if (busy.current) return;
    busy.current = true;
    safe(sfx.close);
    audio.boom(0.4);
    vibrate([200]);
    setPhase("decline");
    for (let i = RUNES.length; i >= 0; i--) {
      later(() => setLit(i), (RUNES.length - i) * 90);
    }
    later(() => setCrt(true), 2300);
    later(() => onDecline?.(), 3300);
  };

  const opening = phase === "opening";
  const decline = phase === "decline";
  const ratio = lit / RUNES.length;
  const tint = opening ? "#ffffff" : decline ? "#ff5a73" : "#7fe3ff";

  const gateAnim =
    phase === "black"
      ? { opacity: 0, scale: 0.88 }
      : opening
        ? { opacity: 1, scale: 3.4 }
        : decline
          ? { opacity: 0.35, scale: 0.97 }
          : { opacity: 1, scale: 1 };

  const gateTrans =
    phase === "black"
      ? { duration: 0 }
      : opening
        ? {
            scale: { duration: 3.2, delay: 0.8, ease: [0.55, 0, 0.85, 0.35] },
            opacity: { duration: 0.3 },
          }
        : decline
          ? { duration: 1.6 }
          : { duration: 2.4, ease: "easeOut" };

  const shakeClass =
    phase === "emerge" ? "g-shake-s" : opening ? "g-shake-l" : "";

  const auraBase =
    phase === "black" ? 0 : decline ? 0.25 : opening ? 1 : 0.35 + 0.65 * ratio;

  const fogOpacity = phase === "black" ? 0 : decline ? 0.2 : opening ? 1 : 0.8;

  const crackOpacity = opening || decline ? 0 : ratio * 0.95;

  return (
    <div className="fixed inset-0 z-[150] bg-black overflow-hidden select-none font-mono">
      <style>{CSS}</style>

      <div className={`absolute inset-0 ${crt ? "g-crt" : ""}`}>
        {/* ───── сцена (трясётся) ───── */}
        <div
          className={`absolute inset-0 flex items-center justify-center ${shakeClass}`}
        >
          {/* туман у пола */}
          <div
            className="absolute inset-x-0 bottom-0 h-[48%] pointer-events-none overflow-hidden"
            style={{ opacity: fogOpacity, transition: "opacity 1.5s" }}
          >
            <div className="g-mist" />
            <div className="g-mist g-mist-b" />
          </div>

          <EmberCanvas phase={phase} />

          {/* врата */}
          <motion.div
            className="relative"
            style={{
              width: "min(86vw, calc(min(76dvh, 560px) / 1.5))",
              aspectRatio: "480 / 720",
              transformOrigin: "50% 66%",
            }}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={gateAnim}
            transition={gateTrans}
          >
            {/* аура */}
            <div
              className="absolute pointer-events-none"
              style={{
                inset: "-25%",
                opacity: auraBase,
                transition: "opacity 1s",
              }}
            >
              <div
                className="absolute inset-0 g-breathe"
                style={{
                  background: decline
                    ? "radial-gradient(ellipse at 50% 60%, rgba(255,70,100,.32), rgba(255,70,100,0) 65%)"
                    : "radial-gradient(ellipse at 50% 60%, rgba(94,203,255,.38), rgba(94,203,255,0) 65%)",
                }}
              />
            </div>

            {/* коробка дверей */}
            <div
              className="absolute"
              style={{
                left: "8.3333%",
                top: "8.6111%",
                width: "83.3333%",
                height: "91.3889%",
              }}
            >
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  clipPath: DOOR_CLIP,
                  perspective: 1400,
                  perspectiveOrigin: "50% 55%",
                  background: "linear-gradient(180deg,#02060a 0%,#04101a 100%)",
                }}
              >
                {/* свет за дверями */}
                <motion.div
                  className="absolute inset-0"
                  initial={false}
                  animate={{ opacity: opening ? 1 : 0 }}
                  transition={{ duration: 1.8, delay: 0.9 }}
                  style={{
                    background:
                      "radial-gradient(ellipse 70% 60% at 50% 62%, #ffffff 0%, #cdf3ff 18%, #62c4f0 42%, #0e3a66 78%, #04101e 100%)",
                  }}
                />
                {/* лучи */}
                <motion.div
                  className="absolute pointer-events-none"
                  style={{ inset: "-60%" }}
                  initial={false}
                  animate={{ opacity: opening ? 0.8 : 0 }}
                  transition={{ duration: 1.6, delay: 1.2 }}
                >
                  <div
                    className="absolute inset-0 g-spin"
                    style={{
                      background:
                        "repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,.55) 0deg 2.5deg, transparent 2.5deg 10deg)",
                      WebkitMaskImage:
                        "radial-gradient(circle at 50% 50%, #000 0%, transparent 62%)",
                      maskImage:
                        "radial-gradient(circle at 50% 50%, #000 0%, transparent 62%)",
                    }}
                  />
                </motion.div>

                <Door side="left" phase={phase} tint={tint} />
                <Door side="right" phase={phase} tint={tint} />

                {/* щель света между створками */}
                <motion.div
                  className="absolute pointer-events-none"
                  style={{
                    left: "50%",
                    top: "8%",
                    bottom: 0,
                    width: 3,
                    marginLeft: -1.5,
                    background:
                      "linear-gradient(180deg, transparent, #e8fbff 20%, #8fe0ff 60%, transparent)",
                    filter: "blur(1.5px)",
                    boxShadow: "0 0 14px 4px rgba(120,210,255,.8)",
                  }}
                  initial={false}
                  animate={{ opacity: crackOpacity }}
                  transition={{ duration: 0.4 }}
                />
                {/* свет из-под дверей */}
                <motion.div
                  className="absolute pointer-events-none"
                  style={{
                    left: "10%",
                    right: "10%",
                    bottom: 0,
                    height: "3%",
                    background:
                      "linear-gradient(0deg, rgba(160,230,255,.9), transparent)",
                    filter: "blur(3px)",
                  }}
                  initial={false}
                  animate={{ opacity: crackOpacity }}
                  transition={{ duration: 0.4 }}
                />

                {/* виньетка внутри проёма */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={false}
                  animate={{ opacity: opening ? 0 : 1 }}
                  transition={{ duration: 1.5, delay: opening ? 0.8 : 0 }}
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 55%, transparent 40%, rgba(0,0,0,.55) 100%)",
                  }}
                />
              </div>
            </div>

            {/* каменная арка с рунами */}
            <Frame phase={phase} lit={lit} />
          </motion.div>
        </div>

        {/* виньетка экрана */}
        <div
          className="absolute inset-0 pointer-events-none z-[160]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, transparent 38%, rgba(0,0,0,.78) 100%)",
          }}
        />

        {/* кинематографические полосы */}
        <motion.div
          className="absolute top-0 inset-x-0 bg-black z-[170]"
          initial={{ height: 0 }}
          animate={{ height: phase === "black" ? 0 : "7vh" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <motion.div
          className="absolute bottom-0 inset-x-0 bg-black z-[170]"
          initial={{ height: 0 }}
          animate={{ height: phase === "black" ? 0 : "7vh" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* подпись во время появления врат */}
        <AnimatePresence>
          {phase === "emerge" && (
            <motion.div
              key="cap"
              className="absolute inset-x-0 bottom-[9vh] z-[175] text-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="g-blink text-[11px] tracking-[0.35em] uppercase text-rose-400"
                style={{ textShadow: "0 0 8px rgba(255,77,109,.8)" }}
              >
                ⚠ Аномальный всплеск маны
              </div>
              <TypeLine
                text="[ ОБНАРУЖЕНЫ ВРАТА ПОДЗЕМЕЛЬЯ ]"
                delay={1000}
                speed={38}
                className="mt-2 text-xs tracking-[0.28em] text-[#9fe8ff]"
                style={{ textShadow: "0 0 8px rgba(94,203,255,.8)" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* белая вспышка при входе */}
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-white pointer-events-none z-[250]"
          initial={{ opacity: 0 }}
          animate={{ opacity: opening ? [0, 0, 0.9, 1] : 0 }}
          transition={{
            duration: 3.6,
            times: opening ? [0, 0.55, 0.85, 1] : undefined,
          }}
        />

        {/* вопрос в стиле системного уведомления */}
        <SystemWindow
          open={phase === "ask"}
          tone="blue"
          title="УВЕДОМЛЕНИЕ"
          maxWidth="max-w-sm"
          z="z-[200]"
        >
          <SysSubtitle>ДВОЙНОЕ ПОДЗЕМЕЛЬЕ</SysSubtitle>
          <div className="mt-4 space-y-2 text-center text-[15px] tracking-wide text-[#dbe7f4] min-h-[56px]">
            <TypeLine text="Вы нашли двойное подземелье." delay={350} />
            <TypeLine text="Хотите войти?" delay={1350} />
          </div>
          <div className="mt-3 space-y-1.5">
            <SysRow label="Ранг подземелья" value="???" />
            <SysRow label="Награда" value="НЕИЗВЕСТНО" />
          </div>
          <div className="mt-3 text-center text-xs tracking-wider text-rose-400 animate-pulse">
            При отказе соединение с Системой будет разорвано.
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <SysButton tone="blue" onClick={handleYes}>
              ДА
            </SysButton>
            <SysButton tone="red" onClick={handleNo}>
              НЕТ
            </SysButton>
          </div>
        </SystemWindow>

        {/* отказ: красная вспышка, глитч-текст */}
        {decline && (
          <motion.div
            className="absolute inset-0 z-[300] flex items-center justify-center"
            initial={{ backgroundColor: "rgba(0,0,0,0)" }}
            animate={{ backgroundColor: "rgba(0,0,0,0.88)" }}
            transition={{ duration: 1.2 }}
          >
            <motion.div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{ background: "rgba(255,40,70,1)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0, 0.25, 0] }}
              transition={{ duration: 0.9 }}
            />
            <motion.div
              className="g-glitch relative text-rose-400 text-sm tracking-[0.3em] uppercase text-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              СОЕДИНЕНИЕ РАЗОРВАНО
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
