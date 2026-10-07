export const PENALTY_XP = 15;
export const BOSS_MAX_HP = 700;
export const BOSS_DAMAGE_PER_QUEST = 35;

// Аномалия: особый квест с повышенной наградой
export const ANOMALY_XP = 150;
export const ANOMALY_BOSS_DAMAGE = BOSS_DAMAGE_PER_QUEST * 3;

export const CATEGORY_META = {
  sport: { label: "СПОРТ", icon: "Dumbbell" },
  study: { label: "УЧЁБА", icon: "BookOpen" },
  anomaly: { label: "АНОМАЛИЯ", icon: "Zap" },
};

type QuestDef = {
  id: string;
  category: string;
  base: number;
  step: number;
  cap: number;
  isFloat?: boolean;
  text: (n: number) => string;
};

export const QUEST_DEFS: QuestDef[] = [
  {
    id: "sport_pushups",
    category: "sport",
    base: 10,
    step: 10,
    cap: 500,
    text: (n: number) => `Сделай ${n} отжиманий`,
  },
  {
    id: "sport_squats",
    category: "sport",
    base: 10,
    step: 10,
    cap: 500,
    text: (n: number) => `Сделай ${n} приседаний`,
  },
  {
    id: "sport_run",
    category: "sport",
    base: 1,
    step: 0.2,
    cap: 20,
    isFloat: true,
    text: (n: number) => `Пробеги ${n} км`,
  },
  {
    id: "study_read",
    category: "study",
    base: 5,
    step: 1,
    cap: 40,
    text: (n: number) => `Прочитай ${n} страниц`,
  },
];

export function questAmount(def: QuestDef, streak: number) {
  const raw = def.base + def.step * Math.max(0, streak);
  const capped = Math.min(def.cap, raw);
  return def.isFloat ? Math.round(capped * 10) / 10 : Math.round(capped);
}

export function localDateStr(d: Date = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Простой хэш строки: одна и та же дата всегда даёт одно и то же число
function mix(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  return h >>> 0;
}

function rawAnomaly(dateStr: string) {
  return mix("anomaly:" + dateStr) % 4 === 0;
}

// Аномалия примерно раз в 5 дней, но никогда два дня подряд
export function isAnomalyDay (dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const prev = localDateStr(new Date(y, m - 1, d - 1));
  return rawAnomaly(dateStr) && !rawAnomaly(prev);
}

function amt(id: string, streak: number, mult: number) {
  const def = QUEST_DEFS.find((q) => q.id === id)!;
  const v = questAmount(def, streak) * mult;
  return def.isFloat ? Math.round(v * 10) / 10 : Math.round(v);
}

const ANOMALY_TASKS: ((s: number) => string)[] = [
  (s) =>
    `Сделай ${amt("sport_pushups", s, 2)} отжиманий и ${amt("sport_squats", s, 2)} приседаний`,
  (s) => `Пробеги ${amt("sport_run", s, 2)} км`,
  (s) =>
    `Прочитай ${amt("study_read", s, 3)} страниц и сделай ${amt("sport_pushups", s, 1)} отжиманий`,
];

export function generateDailyQuests(
  streak: number,
  dateStr: string = localDateStr(),
) {
  if (isAnomalyDay(dateStr)) {
    const pick = mix("task:" + dateStr) % ANOMALY_TASKS.length;
    return [
      {
        id: "anomaly",
        category: "anomaly",
        text: ANOMALY_TASKS[pick](streak),
        completed: false,
      },
    ];
  }
  return QUEST_DEFS.map((def) => ({
    id: def.id,
    category: def.category,
    text: def.text(questAmount(def, streak)),
    completed: false,
  }));
}

export function getWeekMonday(d: Date = new Date()) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export const BOSS_THEMES = [
  "СТРАЖ ВРАТ",
  "ХРАНИТЕЛЬ БЕЗДНЫ",
  "ПОВЕЛИТЕЛЬ ТЕНЕЙ",
  "КОШМАР СИСТЕМЫ",
];

export function bossThemeForWeek(weekStart: string) {
  let hash = 0;
  for (let i = 0; i < weekStart.length; i++) {
    hash = (hash * 31 + weekStart.charCodeAt(i)) >>> 0;
  }
  return BOSS_THEMES[hash % BOSS_THEMES.length];
}

export function freshBoss(weekStart: string) {
  return {
    weekStart,
    hp: BOSS_MAX_HP,
    maxHp: BOSS_MAX_HP,
    defeated: false,
    theme: bossThemeForWeek(weekStart),
  };
}