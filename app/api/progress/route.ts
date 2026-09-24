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

  const level = clampInt(body.level, 1, 999);
  const xp = clampInt(body.xp, 0, 99);
  const streak = clampInt(body.streak, 0, 100000);

  const achievements: string[] = Array.isArray(body.achievements)
    ? body.achievements
        .filter((a: unknown): a is string => typeof a === "string")
        .slice(0, 50)
        .map((a: string) => a.slice(0, 40))
    : [];

  const progress = body.progress && typeof body.progress === "object" ? body.progress : {};
  if (JSON.stringify(progress).length > 200_000) {
    return NextResponse.json({ error: "СЛИШКОМ МНОГО ДАННЫХ" }, { status: 413 });
  }

  try {
    await prisma.player.update({
      where: { id },
      data: { level, xp, streak, rank: getRank(level), achievements, progress },
    });
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ОШИБКА СОХРАНЕНИЯ" }, { status: 500 });
  }
}