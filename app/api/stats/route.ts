import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";
import {
  STAT_FIELDS,
  availableStatPoints,
  statsOf,
  type StatKey,
} from "@/lib/player";

export async function POST(req: Request) {
  const id = await getSessionPlayerId();
  if (!id) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const stat = body?.stat as string;
  if (typeof stat !== "string" || !(stat in STAT_FIELDS)) {
    return NextResponse.json({ error: "НЕВЕРНАЯ ХАРАКТЕРИСТИКА" }, { status: 400 });
  }

  const raw = Math.floor(Number(body?.amount ?? 1));
  const amount = Number.isFinite(raw) ? Math.min(10, Math.max(1, raw)) : 1;

  const p = await prisma.player.findUnique({ where: { id } });
  if (!p) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }

  if (amount > availableStatPoints(p)) {
    return NextResponse.json({ error: "НЕТ СВОБОДНЫХ ОЧКОВ" }, { status: 400 });
  }

  const field = STAT_FIELDS[stat as StatKey];

  try {
    // Условие по всем четырём статам: если параллельный запрос уже что-то
    // изменил, обновление не сработает (count = 0), и лишних очков не будет.
    const res = await prisma.player.updateMany({
      where: {
        id,
        statStr: p.statStr,
        statAgi: p.statAgi,
        statVit: p.statVit,
        statInt: p.statInt,
      },
      data: { [field]: { increment: amount } } as any,
    });

    if (res.count === 0) {
      return NextResponse.json({ error: "ПОВТОРИТЕ ЕЩЁ РАЗ" }, { status: 409 });
    }

    const fresh = await prisma.player.findUnique({ where: { id } });
    if (!fresh) {
      return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
    }

    return NextResponse.json({
      status: "ok",
      stats: statsOf(fresh),
      statPoints: availableStatPoints(fresh),
    });
  } catch (error) {
    console.error("stats error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "ОШИБКА СОХРАНЕНИЯ" }, { status: 500 });
  }
}