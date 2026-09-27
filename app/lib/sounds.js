"use client";

let ctx = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    ctx = new AudioContext();
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

// Один тон: частота, длительность, форма волны, громкость
function tone(
  freq,
  duration,
  { type = "sine", gain = 0.2, delay = 0, sweep = 0 } = {},
) {
  const audio = getCtx();
  if (!audio) return;

  const osc = audio.createOscillator();
  const g = audio.createGain();
  const start = audio.currentTime + delay;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (sweep) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(1, freq + sweep),
      start + duration,
    );
  }

  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(g);
  g.connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

// Лёгкий белый шум — для "щелчков" и помех
function noiseBurst(duration, { gain = 0.08, delay = 0 } = {}) {
  const audio = getCtx();
  if (!audio) return;

  const start = audio.currentTime + delay;
  const bufferSize = Math.floor(audio.sampleRate * duration);
  const buffer = audio.createBuffer(1, bufferSize, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const src = audio.createBufferSource();
  src.buffer = buffer;
  const g = audio.createGain();
  g.gain.setValueAtTime(gain, start);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  src.connect(g);
  g.connect(audio.destination);
  src.start(start);
}

// --- Библиотека звуков в стиле "системного окна" ---

export const sfx = {
  // Открытие окна: короткий двухтонный сигнал вверх
  open() {
    tone(520, 0.09, { type: "sine", gain: 0.16 });
    tone(880, 0.12, { type: "sine", gain: 0.14, delay: 0.06 });
    noiseBurst(0.05, { gain: 0.05 });
  },

  // Закрытие окна: сигнал вниз
  close() {
    tone(700, 0.08, { type: "sine", gain: 0.14 });
    tone(360, 0.1, { type: "sine", gain: 0.12, delay: 0.05 });
  },

  // Новая миссия добавлена: короткий "тик"
  addMission() {
    tone(660, 0.05, { type: "square", gain: 0.08 });
    tone(990, 0.06, { type: "square", gain: 0.07, delay: 0.04 });
  },

  // Задача выполнена: приятный светлый аккорд
  completeTask() {
    tone(523.25, 0.14, { type: "triangle", gain: 0.15 }); // до
    tone(659.25, 0.14, { type: "triangle", gain: 0.13, delay: 0.05 }); // ми
    tone(783.99, 0.22, { type: "triangle", gain: 0.14, delay: 0.1 }); // соль
  },

  // Обычное достижение: восходящий сигнал + перезвон
  achievement() {
    tone(440, 0.1, { type: "sine", gain: 0.15 });
    tone(660, 0.12, { type: "sine", gain: 0.15, delay: 0.08 });
    tone(880, 0.25, { type: "sine", gain: 0.16, delay: 0.16 });
    noiseBurst(0.08, { gain: 0.04, delay: 0.16 });
  },

  // Эпическое/легендарное достижение: мощнее и с "гулом"
  epicAchievement() {
    tone(220, 0.35, { type: "sawtooth", gain: 0.08, sweep: 440 });
    tone(440, 0.14, { type: "sine", gain: 0.16, delay: 0.1 });
    tone(660, 0.14, { type: "sine", gain: 0.16, delay: 0.2 });
    tone(880, 0.16, { type: "sine", gain: 0.17, delay: 0.3 });
    tone(1320, 0.3, { type: "sine", gain: 0.14, delay: 0.42 });
    noiseBurst(0.15, { gain: 0.06, delay: 0.3 });
  },

  // Ошибка / отказ: низкий резкий сигнал
  error() {
    tone(180, 0.18, { type: "square", gain: 0.14 });
    tone(140, 0.22, { type: "square", gain: 0.12, delay: 0.12 });
  },

  // Клик по кнопке/строке: очень короткий тик
  click() {
    tone(880, 0.03, { type: "square", gain: 0.05 });
  },

  // Голографический "щелчок" интерфейса — для наведения/переключения вкладок
  hover() {
    tone(1200, 0.02, { type: "sine", gain: 0.03 });
  },

  // Системная загрузка завершена, экран "включается"
  bootUp() {
    tone(120, 0.5, { type: "sawtooth", gain: 0.1, sweep: 900 });
    tone(1600, 0.12, { type: "sine", gain: 0.1, delay: 0.5 });
    noiseBurst(0.25, { gain: 0.09, delay: 0.5 });
  },
};
