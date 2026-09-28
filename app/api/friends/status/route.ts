import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const me = await getSessionPlayerId();
    if (!me) return NextResponse.json({ relation: "guest" });

    const nickname = (new URL(req.url).searchParams.get("nickname") ?? "")
      .trim()
      .toUpperCase();
    const target = await prisma.player.findUnique({ where: { nickname } });
    if (!target) {
      return NextResponse.json({ error: "ОХОТНИК НЕ НАЙДЕН" }, { status: 404 });
    }
    if (target.id === me) return NextResponse.json({ relation: "self" });

    const row = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: me, addresseeId: target.id },
          { requesterId: target.id, addresseeId: me },
        ],
      },
    });
    if (!row) return NextResponse.json({ relation: "none" });
    if (row.status === "accepted") {
      return NextResponse.json({ relation: "friends", id: row.id });
    }
    return NextResponse.json({
      relation: row.requesterId === me ? "outgoing" : "incoming",
      id: row.id,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ОШИБКА СИСТЕМЫ" }, { status: 500 });
  }
}