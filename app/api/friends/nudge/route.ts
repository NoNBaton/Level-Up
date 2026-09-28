import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";
import { areFriends } from "@/lib/social";

export async function POST(req: Request) {
  const me = await getSessionPlayerId();
  if (!me) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }
  try {
    const body = await req.json().catch(() => null);
    const nickname = String(body?.nickname ?? "").trim().toUpperCase();
    const target = await prisma.player.findUnique({ where: { nickname } });
    if (!target) {
      return NextResponse.json({ error: "ОХОТНИК НЕ НАЙДЕН" }, { status: 404 });
    }
    if (target.id === me) {
      return NextResponse.json({ error: "НЕЛЬЗЯ ПОДТОЛКНУТЬ СЕБЯ" }, { status: 400 });
    }
    if (!(await areFriends(me, target.id))) {
      return NextResponse.json({ error: "ТОЛЬКО ДЛЯ ДРУЗЕЙ" }, { status: 403 });
    }

    const recent = await prisma.activity.findFirst({
      where: {
        type: "nudge",
        playerId: me,
        toId: target.id,
        createdAt: { gt: new Date(Date.now() - 24 * 3600 * 1000) },
      },
    });
    if (recent) {
      return NextResponse.json(
        { error: "ВЫ УЖЕ ПОДТАЛКИВАЛИ ЭТОГО ДРУГА СЕГОДНЯ" },
        { status: 429 },
      );
    }

    await prisma.activity.create({
      data: {
        playerId: me,
        type: "nudge",
        text: "ждёт, что вы выполните квесты",
        toId: target.id,
      },
    });
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ОШИБКА СИСТЕМЫ" }, { status: 500 });
  }
}