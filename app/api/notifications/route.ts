import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";

export async function GET() {
  const me = await getSessionPlayerId();
  if (!me) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }
  try {
    const [requests, duelInvites, nudges] = await Promise.all([
      prisma.friendship.count({ where: { addresseeId: me, status: "pending" } }),
      prisma.duel.count({ where: { opponentId: me, status: "pending" } }),
      prisma.activity.findMany({
        where: { toId: me, type: "nudge", seenAt: null },
        include: { player: { select: { nickname: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);
    return NextResponse.json({
      requests,
      duelInvites,
      nudges: nudges.map((n) => ({ id: n.id, from: n.player.nickname })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ОШИБКА СИСТЕМЫ" }, { status: 500 });
  }
}

export async function POST() {
  const me = await getSessionPlayerId();
  if (!me) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }
  try {
    await prisma.activity.updateMany({
      where: { toId: me, type: "nudge", seenAt: null },
      data: { seenAt: new Date() },
    });
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ОШИБКА СИСТЕМЫ" }, { status: 500 });
  }
}