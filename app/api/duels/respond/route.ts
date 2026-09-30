import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";
import { autoTotalOf, finalizeExpiredDuels, DUEL_DAYS } from "@/lib/social";
import { sendPushToPlayer } from "@/lib/push";
export async function POST(req: Request) {
  const me = await getSessionPlayerId();
  if (!me) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }
  try {
    const body = await req.json().catch(() => null);
    const id = String(body?.id ?? "");
    const accept = body?.accept === true;

    await finalizeExpiredDuels(me);

    const duel = await prisma.duel.findFirst({
      where: {
        id,
        status: "pending",
        OR: [{ challengerId: me }, { opponentId: me }],
      },
      include: {
        challenger: { select: { progress: true } },
        opponent: { select: { progress: true } },
      },
    });
    if (!duel) {
      return NextResponse.json({ error: "ВЫЗОВ НЕ НАЙДЕН" }, { status: 404 });
    }

    if (!accept) {
      await prisma.duel.delete({ where: { id } });
      return NextResponse.json({ status: "ok" });
    }
    if (duel.opponentId !== me) {
      return NextResponse.json(
        { error: "ПРИНЯТЬ МОЖЕТ ТОЛЬКО ПРИГЛАШЁННЫЙ" },
        { status: 403 },
      );
    }

    const pair = [duel.challengerId, duel.opponentId];
    const busy = await prisma.duel.count({
      where: {
        status: "active",
        id: { not: duel.id },
        OR: [{ challengerId: { in: pair } }, { opponentId: { in: pair } }],
      },
    });
    if (busy > 0) {
      return NextResponse.json(
        { error: "У ОДНОГО ИЗ ИГРОКОВ УЖЕ ЕСТЬ АКТИВНАЯ ДУЭЛЬ" },
        { status: 409 },
      );
    }

    const now = new Date();
    await prisma.duel.update({
      where: { id },
      data: {
        status: "active",
        challengerBase: autoTotalOf(duel.challenger.progress),
        opponentBase: autoTotalOf(duel.opponent.progress),
        startedAt: now,
        endsAt: new Date(now.getTime() + DUEL_DAYS * 24 * 3600 * 1000),
      },
    });
    sendPushToPlayer(duel.challengerId, {
      title: "LEVEL_UP // OS",
      body: `Дуэль началась! Соперник принял вызов`,
      url: "/friends",
    }).catch(() => {});
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ОШИБКА СИСТЕМЫ" }, { status: 500 });
  }
}