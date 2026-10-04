export const AVATARS = ["cyan", "emerald", "amber", "fuchsia", "rose", "blue"] as const;

export const RECOVERY_QUESTIONS = [
  "Кличка вашего первого питомца?",
  "Название улицы, где вы выросли?",
  "Ваше любимое блюдо в детстве?",
  "Имя лучшего друга детства?",
];

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;

export function normalizeAnswer(s: unknown): string {
  return String(s ?? "").trim().toLowerCase();
}

export function isLocked(player: { lockedUntil: Date | null }): boolean {
  return !!(player.lockedUntil && new Date(player.lockedUntil) > new Date());
}

export function lockedMinutesLeft(player: { lockedUntil: Date | null }): number {
  if (!player.lockedUntil) return 0;
  const ms = new Date(player.lockedUntil).getTime() - Date.now();
  return Math.max(1, Math.ceil(ms / 60000));
}

export function getRank(level: number): string {
  if (level >= 25) return "S-РАНГ";
  if (level >= 20) return "A-РАНГ";
  if (level >= 15) return "B-РАНГ";
  if (level >= 10) return "C-РАНГ";
  if (level >= 5) return "D-РАНГ";
  return "E-РАНГ";
}

export function authIdFor(id: string): string {
  return "ID-" + id.slice(0, 8).toUpperCase();
}

function weeklyHistory(progress: unknown) {
  const h = (progress as { history?: unknown } | null)?.history;
  if (!Array.isArray(h)) return [];
  return h.slice(-7).map((d: any) => ({
    date: String(d?.date ?? ""),
    completed: Number(d?.completed ?? 0),
    total: Number(d?.total ?? 0),
  }));
}

type PlayerRow = {
  id: string;
  nickname: string;
  level: number;
  xp: number;
  streak: number;
  longestStreak?: number; 
  rank: string;
  bio: string;
  avatar: string;
  achievements: string[];
  progress: unknown;
  createdAt: Date;
};

export function publicPlayer(p: PlayerRow) {
  const prog = p.progress && typeof p.progress === "object" ? (p.progress as any) : {};
  return {
    nickname: p.nickname,
    authId: authIdFor(p.id),
    level: p.level,
    xp: p.xp,
    streak: p.streak,
    longestStreak: (p as any).longestStreak ?? p.streak,
    completedTotal: Number.isFinite(prog.completedTotal) ? prog.completedTotal : 0,
    rank: p.rank,
    bio: p.bio,
    avatar: p.avatar,
    achievements: p.achievements,
    createdAt: p.createdAt,
    history: weeklyHistory(p.progress),
  };
}

export function privatePlayer(p: PlayerRow) {
  return { ...publicPlayer(p), progress: p.progress };
}