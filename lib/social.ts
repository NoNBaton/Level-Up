import { prisma } from "@/lib/prisma";

export const TEAM_BOSS_HP_PER_MEMBER = 400;
export const TEAM_BOSS_DAMAGE = 35;
export const TEAM_BOSS_REWARD_XP = 50;
export const DUEL_WIN_XP = 50;
export const DUEL_TIE_XP = 20;
export const DUEL_DAYS = 7;

export const ACH_TITLES: Record<string, string> = {
  first_task: "ПЕРВЫЙ ШАГ",
  streak_3: "НАБИРАЯ ХОД",
  streak_7: "КИБЕР-ВОИН",
  streak_30: "ЛЕГЕНДА СИСТЕМЫ",
  level_5: "ВЕТЕРАН КОДА",
  level_25: "ПОВЕЛИТЕЛЬ СИСТЕМЫ",
  day_complete: "ДЕНЬ ЗАКРЫТ",
  boss_defeated: "ОХОТНИК НА БОССОВ",
  team_boss: "КОМАНДА ОХОТНИКОВ",
  duel_win: "ДУЭЛЯНТ",
};

export function weekStartUTC(d: Date = new Date()): string {
  const date = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const day = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() + (day === 0 ? -6 : 1) - day);
  return date.toISOString().slice(0, 10);
}

export function autoTotalOf(progress: unknown): number {
  const v = (progress as { autoTotal?: unknown } | null)?.autoTotal;
  return typeof v === "number" && Number.isFinite(v)
    ? Math.max(0, Math.floor(v))
    : 0;
}

export function weeklyAutoOf(
  progress: unknown,
  week: string = weekStartUTC(),
): number {
  const p = progress as {
    weekBase?: { weekStart?: string; base?: number };
  } | null;
  const wb = p?.weekBase;
  if (!wb || wb.weekStart !== week) return 0;
  return Math.max(0, autoTotalOf(progress) - (Number(wb.base) || 0));
}

export async function areFriends(a: string, b: string): Promise<boolean> {
  const row = await prisma.friendship.findFirst({
    where: {
      status: "accepted",
      OR: [
        { requesterId: a, addresseeId: b },
        { requesterId: b, addresseeId: a },
      ],
    },
  });
  return !!row;
}

export async function friendIdsOf(me: string): Promise<string[]> {
  const rows = await prisma.friendship.findMany({
    where: {
      status: "accepted",
      OR: [{ requesterId: me }, { addresseeId: me }],
    },
    select: { requesterId: true, addresseeId: true },
  });
  return rows.map((r) => (r.requesterId === me ? r.addresseeId : r.requesterId));
}

export async function teamBossFor(me: string) {
  const week = weekStartUTC();
  const ids = [me, ...(await friendIdsOf(me))];
  const players = await prisma.player.findMany({
    where: { id: { in: ids } },
    select: { id: true, nickname: true, progress: true },
  });

  const members = players
    .map((p) => {
      const quests = weeklyAutoOf(p.progress, week);
      return {
        nickname: p.nickname,
        quests,
        damage: quests * TEAM_BOSS_DAMAGE,
        isMe: p.id === me,
      };
    })
    .sort((a, b) => b.damage - a.damage);

  const maxHp = members.length * TEAM_BOSS_HP_PER_MEMBER;
  const dealt = members.reduce((s, m) => s + m.damage, 0);
  const hp = Math.max(0, maxHp - dealt);
  return { week, maxHp, hp, defeated: members.length >= 2 && hp === 0, members };
}

// Закрывает дуэли, у которых истёк срок
export async function finalizeExpiredDuels(me: string) {
  const due = await prisma.duel.findMany({
    where: {
      status: "active",
      endsAt: { lt: new Date() },
      OR: [{ challengerId: me }, { opponentId: me }],
    },
    include: {
      challenger: { select: { progress: true } },
      opponent: { select: { progress: true } },
    },
  });

  for (const d of due) {
    const cs = Math.max(0, autoTotalOf(d.challenger.progress) - d.challengerBase);
    const os = Math.max(0, autoTotalOf(d.opponent.progress) - d.opponentBase);
    await prisma.duel.update({
      where: { id: d.id },
      data: {
        status: "finished",
        challengerScore: cs,
        opponentScore: os,
        winnerId: cs === os ? null : cs > os ? d.challengerId : d.opponentId,
      },
    });
  }
}

export type Reward = {
  key: string;
  xp: number;
  achievement: string | null;
  label: string;
};

export async function pendingRewards(me: string): Promise<Reward[]> {
  await finalizeExpiredDuels(me);

  const claimedRows = await prisma.rewardClaim.findMany({
    where: { playerId: me },
    select: { key: true },
  });
  const claimed = new Set(claimedRows.map((c) => c.key));
  const out: Reward[] = [];

  const tb = await teamBossFor(me);
  const mine = tb.members.find((m) => m.isMe);
  const tbKey = `team:${tb.week}`;
  if (tb.defeated && mine && mine.quests > 0 && !claimed.has(tbKey)) {
    out.push({
      key: tbKey,
      xp: TEAM_BOSS_REWARD_XP,
      achievement: "TEAM_BOSS",
      label: "БОСС ДРУЗЕЙ ПОВЕРЖЕН",
    });
  }

  const finished = await prisma.duel.findMany({
    where: {
      status: "finished",
      OR: [{ challengerId: me }, { opponentId: me }],
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  for (const d of finished) {
    const key = `duel:${d.id}`;
    if (claimed.has(key)) continue;
    const myScore = d.challengerId === me ? d.challengerScore : d.opponentScore;
    if (d.winnerId === me) {
      out.push({ key, xp: DUEL_WIN_XP, achievement: "DUEL_WIN", label: "ПОБЕДА В ДУЭЛИ" });
    } else if (d.winnerId === null && myScore > 0) {
      out.push({ key, xp: DUEL_TIE_XP, achievement: null, label: "НИЧЬЯ В ДУЭЛИ" });
    }
  }
  return out;
}