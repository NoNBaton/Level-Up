export const PENALTY_XP = 15;
export const BOSS_MAX_HP = 700;
export const BOSS_DAMAGE_PER_QUEST = 35;

// Версия набора ежедневных квестов. При смене старые квесты пересоздаются.
export const QUESTS_VERSION = 2;

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
  unit?: string;
  text: (n: number) => string;
};

// Ежедневная тренировка как в Solo Leveling: цели всегда одинаковые
export const QUEST_DEFS: QuestDef[] = [
  {
    id: "d-pushups",
    category: "sport",
    base: 100,
    step: 0,
    cap: 100,
    text: () => "Отжимания",
  },
  {
    id: "d-situps",
    category: "sport",
    base: 100,
    step: 0,
    cap: 100,
    text: () => "Пресс",
  },
  {
    id: "d-squats",
    category: "sport",
    base: 100,
    step: 0,
    cap: 100,
    text: () => "Приседания",
  },
  {
    id: "d-run",
    category: "sport",
    base: 10,
    step: 0,
    cap: 10,
    isFloat: true,
    unit: "км",
    text: () => "Бег",
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
export function isAnomalyDay(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const prev = localDateStr(new Date(y, m - 1, d - 1));
  return rawAnomaly(dateStr) && !rawAnomaly(prev);
}

// Аномальные задания: одно большое испытание вместо обычных квестов.
// В тексте только одно число, чтобы проверка брала правильную цель.
const ANOMALY_TASKS: string[] = [
  "Сделай 200 приседаний",
  "Пробеги 15 км",
  "Сделай 200 отжиманий",
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
        text: ANOMALY_TASKS[pick],
        completed: false,
      },
    ];
  }
  return QUEST_DEFS.map((def) => {
    const target = questAmount(def, streak);
    return {
      id: def.id,
      category: def.category,
      text: def.text(target),
      target,
      unit: def.unit ?? "",
      completed: false,
    };
  });
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