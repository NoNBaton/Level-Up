// Прибавка за одно очко и потолок множителя
export const STAT_EFFECTS = {
  str: { perPoint: 0.02, cap: 1.0 }, // урон по боссу
  agi: { perPoint: 0.01, cap: 0.5 }, // монеты
  vit: { perPoint: 0.03, cap: 0.6 }, // снижение штрафа
  int: { perPoint: 0.015, cap: 0.75 }, // XP за учёбу
} as const;

type StatKey = keyof typeof STAT_EFFECTS;

// Поля из базы (строка Player)
type StatCols = {
  statStr?: number;
  statAgi?: number;
  statVit?: number;
  statInt?: number;
};

// Объект статов, как его отдаёт /api/me
type StatMap = { str?: number; agi?: number; vit?: number; int?: number };

function bonus(points: unknown, key: StatKey): number {
  const n = Number(points);
  if (!Number.isFinite(n) || n <= 0) return 0;
  const { perPoint, cap } = STAT_EFFECTS[key];
  return Math.min(cap, n * perPoint);
}

// Множители. Применять к базовому значению: Math.round(base * mult)
export function multipliersFromStats(s?: StatMap | null) {
  return {
    boss: 1 + bonus(s?.str, "str"), // урон по боссу
    coins: 1 + bonus(s?.agi, "agi"), // награда монетами
    penalty: 1 - bonus(s?.vit, "vit"), // штраф (меньше = лучше)
    xp: 1 + bonus(s?.int, "int"), // XP за учёбу
  };
}

export function statMultipliers(p: StatCols) {
  return multipliersFromStats({
    str: p.statStr,
    agi: p.statAgi,
    vit: p.statVit,
    int: p.statInt,
  });
}

export const applyBoss = (base: number, p: StatCols) =>
  Math.round(base * statMultipliers(p).boss);
export const applyCoins = (base: number, p: StatCols) =>
  Math.round(base * statMultipliers(p).coins);
export const applyPenalty = (base: number, p: StatCols) =>
  Math.round(base * statMultipliers(p).penalty);
export const applyXp = (base: number, p: StatCols) =>
  Math.round(base * statMultipliers(p).xp);