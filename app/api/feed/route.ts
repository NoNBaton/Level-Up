import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";
import { friendIdsOf } from "@/lib/social";

export async function GET() {
  const me = await getSessionPlayerId();
  if (!me) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }
  try {
    const ids = [me, ...(await friendIdsOf(me))];
    const rows = await prisma.activity.findMany({
      where: { playerId: { in: ids }, type: { not: "nudge" } },
      include: { player: { select: { nickname: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    return NextResponse.json({
      items: rows.map((r) => ({
        id: r.id,
        nickname: r.player.nickname,
        text: r.text,
        type: r.type,
        at: r.createdAt,
        isMe: r.playerId === me,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ОШИБКА СИСТЕМЫ" }, { status: 500 });
  }
}