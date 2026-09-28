import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";

type Item = {
  id: string;
  nickname: string;
  level: number;
  xp: number;
  rank: string;
  streak: number;
};

const SELECT = {
  nickname: true,
  level: true,
  xp: true,
  rank: true,
  streak: true,
};

export async function GET() {
  const me = await getSessionPlayerId();
  if (!me) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }

  try {
    const rows = await prisma.friendship.findMany({
      where: { OR: [{ requesterId: me }, { addresseeId: me }] },
      include: {
        requester: { select: SELECT },
        addressee: { select: SELECT },
      },
      orderBy: { createdAt: "desc" },
    });

    const friends: Item[] = [];
    const incoming: Item[] = [];
    const outgoing: Item[] = [];

    for (const r of rows) {
      const other = r.requesterId === me ? r.addressee : r.requester;
      const item: Item = { id: r.id, ...other };
      if (r.status === "accepted") friends.push(item);
      else if (r.addresseeId === me) incoming.push(item);
      else outgoing.push(item);
    }

    const meRow = await prisma.player.findUnique({
      where: { id: me },
      select: SELECT,
    });

    return NextResponse.json({ friends, incoming, outgoing, me: meRow });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ОШИБКА СИСТЕМЫ" }, { status: 500 });
  }
}