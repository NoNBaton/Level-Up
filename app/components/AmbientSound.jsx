"use client";

import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Waves } from "lucide-react";

const PRESETS = [
  { id: "off", label: "ТИШИНА" },
  { id: "ambient", label: "ЭМБИЕНТ" },
  { id: "pulse", label: "ПУЛЬС" },
];

export default function AmbientSound() {
  const [preset, setPreset] = useState("off");
  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const nodesRef = useRef([]);
  const timerRef = useRef(null);

  const cleanup = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    nodesRef.current.forEach((n) => {
      try {
        n.stop?.();
        n.disconnect?.();
      } catch {
        // ignore
      }
    });
    nodesRef.current = [];
  };

  const ensureCtx = () => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      const master = ctx.createGain();
      master.gain.value = 0.08;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }
    return ctxRef.current;
  };

  // ЭМБИЕНТ: тёмный минорный пэд с глубоким суб-басом —
  // атмосфера "пробуждения системы", как перед открытием подземелья
  const startAmbient = () => {
    const ctx = ensureCtx();
    cleanup();
    const master = masterRef.current;

    // A minor, низко и мрачно: A1-C2-E2
    const chord = [55.0, 65.41, 82.41];

    chord.forEach((freq, i) => {
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (panner) panner.pan.value = i === 0 ? -0.25 : i === 1 ? 0.25 : 0;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 280;
      filter.Q.value = 0.8;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.035 + i * 0.01;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 120;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const osc1 = ctx.createOscillator();
      osc1.type = "sawtooth";
      osc1.frequency.value = freq;
      osc1.detune.value = -5;

      const osc2 = ctx.createOscillator();
      osc2.type = "sawtooth";
      osc2.frequency.value = freq;
      osc2.detune.value = 5;

      const voiceGain = ctx.createGain();
      voiceGain.gain.value = 0.22 - i * 0.03;

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(voiceGain);
      if (panner) {
        voiceGain.connect(panner);
        panner.connect(master);
      } else {
        voiceGain.connect(master);
      }

      osc1.start();
      osc2.start();
      lfo.start();
      nodesRef.current.push(osc1, osc2, lfo);
    });

    // Редкие высокие "системные" стеклянные отголоски — как уведомления System
    const bellNotes = [880, 1046.5, 1318.5];
    const scheduleBell = () => {
      const freq = bellNotes[Math.floor(Math.random() * bellNotes.length)];
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);

      osc.connect(g);
      g.connect(master);
      osc.start();
      osc.stop(ctx.currentTime + 2.6);

      timerRef.current = setTimeout(scheduleBell, 6000 + Math.random() * 8000);
    };
    timerRef.current = setTimeout(scheduleBell, 3000);
  };

  // ПУЛЬС: глубокий бас-пульс как сердцебиение + редкие стеклянные акценты —
  // ощущение надвигающейся опасности / отсчёта системы
  const startPulse = () => {
    const ctx = ensureCtx();
    cleanup();
    const master = masterRef.current;

    const delay = ctx.createDelay();
    delay.delayTime.value = 0.3;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.25;
    const delayWet = ctx.createGain();
    delayWet.gain.value = 0.3;
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(delayWet);
    delayWet.connect(master);
    nodesRef.current.push(delay, feedback, delayWet);

    const kick = () => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(90, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.25);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.35, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

      osc.connect(g);
      g.connect(master);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    };

    const accent = [659.25, 587.33, 523.25, 587.33]; // E-D-C-D, тревожно-минорно
    let step = 0;
    const pluck = () => {
      const freq = accent[step % accent.length];
      step++;
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

      osc.connect(g);
      g.connect(master);
      g.connect(delay);
      osc.start();
      osc.stop(ctx.currentTime + 0.55);
    };

    let beat = 0;
    kick();
    timerRef.current = setInterval(() => {
      beat++;
      kick();
      if (beat % 2 === 0) pluck();
    }, 850);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("levelup_ambient");
      if (saved) setPreset(saved);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("levelup_ambient", preset);
    } catch {
      // ignore
    }
    if (preset === "off") cleanup();
    else if (preset === "ambient") startAmbient();
    else if (preset === "pulse") startPulse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset]);

  useEffect(() => {
    return () => {
      cleanup();
      ctxRef.current?.close?.();
    };
  }, []);

  const Icon =
    preset === "off" ? VolumeX : preset === "pulse" ? Waves : Volume2;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-[#7fa8d6]">
        <Icon className="w-3 h-3" />
        ФОНОВАЯ АТМОСФЕРА
      </div>
      <div className="flex gap-2 flex-wrap">
        {PRESETS.map((p) => {
          const active = preset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPreset(p.id)}
              className={`px-2.5 py-1.5 border text-[9px] font-bold tracking-wider uppercase transition cursor-pointer ${
                active
                  ? "border-[#5ecbff] bg-[#5ecbff]/15 text-[#cfe6ff] shadow-[0_0_10px_rgba(94,203,255,0.4)]"
                  : "border-[#5ecbff]/30 text-[#7fa8d6] opacity-60 hover:opacity-100"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
