import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";
import { getRank } from "@/lib/player";

function clampInt(v: unknown, min: number, max: number): number {
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
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
  // Сколько "очков опыта" разумно получить за один запрос сохранения
  const maxTasksBasis = Math.max(20, tasks.length + 5);
  const maxGain = maxTasksBasis * 25;

  const newPoints = level * 100 + xp;
  if (newPoints - prevPoints > maxGain) {
    const capped = prevPoints + maxGain;
    level = Math.max(1, Math.floor(capped / 100) || 1);
    xp = capped % 100;
  }

  // Стрик растёт максимум на 1 за раз, либо может обнулиться до 0
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

  if (JSON.stringify(progress).length > 200_000) {
    return NextResponse.json({ error: "СЛИШКОМ МНОГО ДАННЫХ" }, { status: 413 });
  }

  try {
    await prisma.player.update({
      where: { id },
      data: {
        level,
        xp,
        streak,
        rank: getRank(level),
        achievements,
        progress,
        lastProgressAt: new Date(),
      },
    });
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ОШИБКА СОХРАНЕНИЯ" }, { status: 500 });
  }
}