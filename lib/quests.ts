export const PENALTY_XP = 15;
export const BOSS_MAX_HP = 700;
export const BOSS_DAMAGE_PER_QUEST = 35;

export const CATEGORY_META = {
  sport: { label: "СПОРТ", icon: "Dumbbell" },
  study: { label: "УЧЁБА", icon: "BookOpen" },
};

export const QUEST_DEFS = [
  {
    id: "sport_pushups",
    category: "sport",
    base: 10,
    step: 10,
    cap: 500,
    text: (n) => `Сделай ${n} отжиманий`,
  },
  {
    id: "sport_squats",
    category: "sport",
    base: 10,
    step: 10,
    cap: 500,
    text: (n) => `Сделай ${n} приседаний`,
  },
  {
    id: "sport_run",
    category: "sport",
    base: 1,
    step: 0.2,
    cap: 20,
    isFloat: true,
    text: (n) => `Пробеги ${n} км`,
  },
  {
    id: "study_read",
    category: "study",
    base: 5,
    step: 1,
    cap: 40,
    text: (n) => `Прочитай ${n} страниц`,
  },
];

export function questAmount(def, streak) {
  const raw = def.base + def.step * Math.max(0, streak);
  const capped = Math.min(def.cap, raw);
  return def.isFloat ? Math.round(capped * 10) / 10 : Math.round(capped);
}

export function generateDailyQuests(streak) {
  return QUEST_DEFS.map((def) => ({
    id: def.id,
    category: def.category,
    text: def.text(questAmount(def, streak)),
    completed: false,
  }));
}

export function getWeekMonday(d = new Date()) {
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

export function bossThemeForWeek(weekStart) {
  let hash = 0;
  for (let i = 0; i < weekStart.length; i++) {
    hash = (hash * 31 + weekStart.charCodeAt(i)) >>> 0;
  }
  return BOSS_THEMES[hash % BOSS_THEMES.length];
}

export function freshBoss(weekStart) {
  return {
    weekStart,
    hp: BOSS_MAX_HP,
    maxHp: BOSS_MAX_HP,
    defeated: false,
    theme: bossThemeForWeek(weekStart),
  };
}