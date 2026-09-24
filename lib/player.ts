export const AVATARS = ["cyan", "emerald", "amber", "fuchsia", "rose", "blue"] as const;

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

type PlayerRow = {
  id: string;
  nickname: string;
  level: number;
  xp: number;
  streak: number;
  rank: string;
  bio: string;
  avatar: string;
  achievements: string[];
  progress: unknown;
  createdAt: Date;
};

// В публичный профиль идут только числа, без текста задач
function weeklyHistory(progress: unknown) {
  const h = (progress as { history?: unknown } | null)?.history;
  if (!Array.isArray(h)) return [];
  return h.slice(-7).map((d) => ({
    date: String(d?.date ?? ""),
    completed: Number(d?.completed ?? 0),
    total: Number(d?.total ?? 0),
  }));
}

export function publicPlayer(p: PlayerRow) {
  return {
    nickname: p.nickname,
    authId: authIdFor(p.id),
    level: p.level,
    xp: p.xp,
    streak: p.streak,
    rank: p.rank,
    bio: p.bio,
    avatar: p.avatar,
    achievements: p.achievements,
    createdAt: p.createdAt,
    history: weeklyHistory(p.progress),
  };
}

// Для самого игрока: то же самое плюс полный прогресс (задачи, история)
export function privatePlayer(p: PlayerRow) {
  return { ...publicPlayer(p), progress: p.progress };
}