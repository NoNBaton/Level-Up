import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";
import { getRank } from "@/lib/player";
import { ACH_TITLES, autoTotalOf, weekStartUTC } from "@/lib/social";
import { QUEST_DEFS, isAnomalyDay, getWeekMonday } from "@/lib/quests";
import {
  QUEST_COINS,
  ANOMALY_COINS,
  BOSS_COINS,
  ANOMALY_BOX_CHANCE,
} from "@/lib/economy";
import { applyCoins } from "@/lib/statEffects"; // ХАРАКТЕРИСТИКИ

function clampInt(v: unknown, min: number, max: number): number {
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

// Выполненный аномальный квест засчитывается как 4 обычных (целый день)
function doneCount(list: unknown): number {
  if (!Array.isArray(list)) return 0;
  return list.reduce(
    (sum: number, q: any) =>
      q && q.completed === true ? sum + (q.id === "anomaly" ? 4 : 1) : sum,
    0,
  );
}

function utcDay(offset: number): string {
  const d = new Date(Date.now() + offset * 86400000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function daysAround(n: number): string[] {
  const out: string[] = [];
  for (let o = -n; o <= n; o++) out.push(utcDay(o));
  return out;
}

function candidateWeeks(): string[] {
  const set = new Set<string>();
  for (const o of [-1, 0, 1]) {
    set.add(getWeekMonday(new Date(Date.now() + o * 86400000)));
  }
  return Array.from(set);
}

export async function PUT(req: Request) {
  const id = await getSessionPlayerId();
  if (!id) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "НЕВЕРНЫЙ ЗАПРОС" }, { status: 400 });
  }

  const current = await prisma.player.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }

  const prevProgress =
    current.progress && typeof current.progress === "object"
      ? (current.progress as any)
      : {};
  const prevPoints = current.level * 100 + current.xp;

  let level = clampInt(body.level, 1, 999);
  let xp = clampInt(body.xp, 0, 99);
  let streak = clampInt(body.streak, 0, 100000);

  const incomingProgress =
    body.progress && typeof body.progress === "object" ? body.progress : {};
  const tasks = Array.isArray(incomingProgress.tasks)
    ? incomingProgress.tasks
    : [];
  const maxTasksBasis = Math.max(20, tasks.length + 5);
  const maxGain = maxTasksBasis * 25 + 200; // +200: запас на награды дуэлей и босса

  const newPoints = level * 100 + xp;
  if (newPoints - prevPoints > maxGain) {
    const capped = prevPoints + maxGain;
    level = Math.max(1, Math.floor(capped / 100) || 1);
    xp = capped % 100;
  }

  if (streak > current.streak + 1) {
    streak = current.streak + 1;
  }

  const achievements: string[] = Array.isArray(body.achievements)
    ? body.achievements
        .filter((a: unknown): a is string => typeof a === "string")
        .slice(0, 50)
        .map((a: string) => a.slice(0, 40))
    : [];

  const progress = { ...incomingProgress };

  // ---------- Квесты-упражнения засчитываются только после проверки ----------
  // (отжимания и приседания: камера, пробежка: GPS). Подтверждение пишет
  // /api/exercise/verify в таблицу RewardClaim с ключом verified:ДАТА:ID_КВЕСТА
  const EXERCISE_RE = /отжим|присед|пробе|push|squat|\brun/i;
  const exerciseIds = new Set(
    QUEST_DEFS.filter((d: any) => EXERCISE_RE.test(JSON.stringify(d))).map(
      (d: any) => d.id,
    ),
  );
  const qDate =
    typeof progress.dailyQuestsDate === "string" ? progress.dailyQuestsDate : "";
  const verifiedRows = qDate
    ? await prisma.rewardClaim.findMany({
        where: { playerId: id, key: { startsWith: `verified:${qDate}:` } },
        select: { key: true },
      })
    : [];
  const verifiedIds = new Set(verifiedRows.map((r) => r.key.split(":")[2]));
  if (Array.isArray(progress.dailyQuests)) {
    progress.dailyQuests = progress.dailyQuests.map((q: any) =>
      q &&
      q.completed === true &&
      exerciseIds.has(q.id) &&
      !verifiedIds.has(q.id)
        ? { ...q, completed: false }
        : q,
    );
  }
  // ---------- конец блока ----------

  const prevTotal = Number.isFinite(prevProgress.completedTotal)
    ? prevProgress.completedTotal
    : 0;
  let completedTotal = Number.isFinite(progress.completedTotal)
    ? Math.max(0, Math.floor(progress.completedTotal))
    : prevTotal;
  if (completedTotal > prevTotal + maxTasksBasis) {
    completedTotal = prevTotal + maxTasksBasis;
  }
  progress.completedTotal = completedTotal;

  // Серверный счётчик авто-квестов (для дуэлей и общего босса).
  const doneNow = doneCount(progress.dailyQuests);
  const donePrev = doneCount(prevProgress.dailyQuests);
  const sameDay =
    !!progress.dailyQuestsDate &&
    progress.dailyQuestsDate === prevProgress.dailyQuestsDate;
  const delta = Math.max(
    -4,
    Math.min(4, sameDay ? doneNow - donePrev : doneNow),
  );
  const prevAuto = autoTotalOf(prevProgress);
  const week = weekStartUTC();
  const prevBase = prevProgress.weekBase;
  progress.autoTotal = Math.max(0, prevAuto + delta);
  progress.weekBase =
    prevBase && prevBase.weekStart === week
      ? prevBase
      : { weekStart: week, base: prevAuto };

  // ---------- Монеты и лутбоксы: начисляет только сервер, один раз за квест ----------
  const prevClaims =
    prevProgress.coinClaims && typeof prevProgress.coinClaims === "object"
      ? prevProgress.coinClaims
      : {};
  const keepDays = new Set(daysAround(2));
  const claimsDaily: Record<string, string[]> = {};
  for (const [d, ids] of Object.entries(prevClaims.daily ?? {})) {
    if (keepDays.has(d) && Array.isArray(ids)) {
      claimsDaily[d] = (ids as unknown[])
        .filter((x): x is string => typeof x === "string")
        .slice(0, 10);
    }
  }
  const claimsBoss: string[] = Array.isArray(prevClaims.boss)
    ? prevClaims.boss
        .filter((x: unknown): x is string => typeof x === "string")
        .slice(-6)
    : [];

  let coinGain = 0;
  let boxGain = 0;
  const claimDate =
    typeof progress.dailyQuestsDate === "string"
      ? progress.dailyQuestsDate
      : "";
  if (
    daysAround(1).includes(claimDate) &&
    Array.isArray(progress.dailyQuests)
  ) {
    const got = claimsDaily[claimDate] ?? [];
    for (const q of progress.dailyQuests) {
      if (!q || q.completed !== true || typeof q.id !== "string") continue;
      if (got.includes(q.id)) continue;
      if (q.id === "anomaly") {
        if (!isAnomalyDay(claimDate)) continue;
        coinGain += ANOMALY_COINS;
        if (randomInt(100) < ANOMALY_BOX_CHANCE) boxGain += 1;
      } else if (QUEST_DEFS.some((d) => d.id === q.id)) {
        coinGain += QUEST_COINS;
      } else {
        continue;
      }
      got.push(q.id);
    }
    claimsDaily[claimDate] = got;
  }

  const bossIn = progress.boss;
  if (
    bossIn &&
    typeof bossIn === "object" &&
    bossIn.defeated === true &&
    typeof bossIn.weekStart === "string" &&
    candidateWeeks().includes(bossIn.weekStart) &&
    !claimsBoss.includes(bossIn.weekStart)
  ) {
    coinGain += BOSS_COINS;
    boxGain += 1;
    claimsBoss.push(bossIn.weekStart);
  }

  // ХАРАКТЕРИСТИКИ: бонус AGI к монетам (по статам, сохранённым в базе)
  if (coinGain > 0) coinGain = applyCoins(coinGain, current);

  // Клиентские значения coinClaims игнорируем, пишем только серверные
  progress.coinClaims = { daily: claimsDaily, boss: claimsBoss.slice(-6) };

  if (JSON.stringify(progress).length > 200_000) {
    return NextResponse.json({ error: "СЛИШКОМ МНОГО ДАННЫХ" }, { status: 413 });
  }

  try {
    const longestStreak = Math.max(current.longestStreak, streak);
    const updated = await prisma.player.update({
      where: { id },
      data: {
        level,
        xp,
        streak,
        longestStreak,
        rank: getRank(level),
        achievements,
        progress,
        lastProgressAt: new Date(),
        ...(coinGain > 0 ? { coins: { increment: coinGain } } : {}),
        ...(boxGain > 0 ? { lootboxes: { increment: boxGain } } : {}),
      },
    });

    // События для ленты (ошибка здесь не должна ломать сохранение)
    try {
      const events: { playerId: string; type: string; text: string }[] = [];
      if (level > current.level) {
        const text = `достиг ${level} уровня`;
        const dup = await prisma.activity.findFirst({
          where: {
            playerId: id,
            type: "level",
            text,
            createdAt: { gt: new Date(Date.now() - 24 * 3600 * 1000) },
          },
        });
        if (!dup) events.push({ playerId: id, type: "level", text });
      }
      const had = new Set(current.achievements);
      for (const a of achievements) {
        if (!had.has(a) && ACH_TITLES[a]) {
          events.push({
            playerId: id,
            type: "achievement",
            text: `получил достижение «${ACH_TITLES[a]}»`,
          });
        }
      }
      if (events.length) {
        await prisma.activity.createMany({ data: events.slice(0, 5) });
      }
    } catch (e) {
      console.error(e instanceof Error ? e.message : String(e));
    }

    return NextResponse.json({
      status: "ok",
      coins: updated.coins,
      coinGain,
      lootboxes: updated.lootboxes,
      boxGain,
    });
  } catch (error) {
    console.error(
      "progress error:",
      error instanceof Error ? error.message : String(error),
    );
    return NextResponse.json({ error: "ОШИБКА СОХРАНЕНИЯ" }, { status: 500 });
  }
}