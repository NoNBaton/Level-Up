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
  const timersRef = useRef([]);

  const cleanup = () => {
    timersRef.current.forEach((t) => clearTimeout(t) || clearInterval(t));
    timersRef.current = [];
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

  const pluck = (ctx, dest, freq, gainPeak, len, type = "triangle") => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(gainPeak, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + len);
    osc.connect(g);
    g.connect(dest);
    osc.start();
    osc.stop(ctx.currentTime + len + 0.05);
  };

  // ЭМБИЕНТ: минорный пэд с заметным свипом фильтра, пульсирующим суб-басом
  // (медленное "сердцебиение системы") и ползущим арпеджио сверху
  const startAmbient = () => {
    const ctx = ensureCtx();
    cleanup();
    const master = masterRef.current;

    const chord = [55.0, 65.41, 82.41]; // A1-C2-E2, минор

    chord.forEach((freq, i) => {
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (panner) panner.pan.value = i === 0 ? -0.3 : i === 1 ? 0.3 : 0;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 300;
      filter.Q.value = 1.4;

      // Заметный, более быстрый свип фильтра — ощущение движения
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.09 + i * 0.02;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 260;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const osc1 = ctx.createOscillator();
      osc1.type = "sawtooth";
      osc1.frequency.value = freq;
      osc1.detune.value = -6;
      const osc2 = ctx.createOscillator();
      osc2.type = "sawtooth";
      osc2.frequency.value = freq;
      osc2.detune.value = 6;

      const voiceGain = ctx.createGain();
      voiceGain.gain.value = 0.2 - i * 0.03;

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

    // Пульсирующий суб-бас — медленное "сердцебиение" под пэдом
    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.value = 55;
    const subGain = ctx.createGain();
    subGain.gain.value = 0;
    sub.connect(subGain);
    subGain.connect(master);
    sub.start();
    nodesRef.current.push(sub);

    let subBeat = 0;
    const subPulse = () => {
      subBeat++;
      subGain.gain.cancelScheduledValues(ctx.currentTime);
      subGain.gain.setValueAtTime(subGain.gain.value, ctx.currentTime);
      subGain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.08);
      subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6);
    };
    subPulse();
    timersRef.current.push(setInterval(subPulse, 2200));

    // Ползущее арпеджио, меняющее рисунок каждые несколько проходов
    const scalePool = [220, 261.63, 293.66, 329.63, 392.0, 440.0];
    let idx = 0;
    const walk = () => {
      const freq = scalePool[idx % scalePool.length];
      idx += Math.random() > 0.5 ? 1 : 2;
      pluck(ctx, master, freq, 0.035, 1.4, "sine");
      timersRef.current.push(setTimeout(walk, 900 + Math.random() * 1400));
    };
    timersRef.current.push(setTimeout(walk, 1500));

    // Редкие высокие стеклянные "системные" отголоски
    const bellNotes = [880, 1046.5, 1318.5];
    const bell = () => {
      const freq = bellNotes[Math.floor(Math.random() * bellNotes.length)];
      pluck(ctx, master, freq, 0.04, 2.5, "sine");
      timersRef.current.push(setTimeout(bell, 6000 + Math.random() * 7000));
    };
    timersRef.current.push(setTimeout(bell, 3000));
  };

  // ПУЛЬС: более плотный бит — бас-удар + хай-хэт-подобный тик + минорный аккомпанемент,
  // темп слегка ускоряется каждые ~16 тактов, затем сбрасывается — ощущение нарастающего напряжения
  const startPulse = () => {
    const ctx = ensureCtx();
    cleanup();
    const master = masterRef.current;

    const delay = ctx.createDelay();
    delay.delayTime.value = 0.28;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.3;
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
      osc.frequency.setValueAtTime(95, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + 0.22);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.38, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      osc.connect(g);
      g.connect(master);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    };

    const hat = () => {
      const bufferSize = ctx.sampleRate * 0.03;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 6000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.05, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
      noise.connect(hp);
      hp.connect(g);
      g.connect(master);
      noise.start();
    };

    const accent = [659.25, 587.33, 523.25, 587.33, 493.88, 523.25];
    let step = 0;
    const pluckNote = () => {
      const freq = accent[step % accent.length];
      step++;
      pluck(ctx, delay, freq, 0.1, 0.5, "triangle");
    };

    let beat = 0;
    let tempo = 820;
    const loop = () => {
      beat++;
      kick();
      if (beat % 2 === 1) hat();
      if (beat % 2 === 0) pluckNote();
      if (beat % 4 === 3) hat();

      // лёгкое ускорение каждые 16 тактов, затем сброс — создаёт напряжение волнами
      if (beat % 16 === 0) {
        tempo = Math.max(600, tempo - 40);
      }
      if (beat % 32 === 0) {
        tempo = 820;
      }

      timersRef.current.push(setTimeout(loop, tempo));
    };
    timersRef.current.push(setTimeout(loop, tempo));
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
