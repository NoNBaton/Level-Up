import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";
import { sendPushToPlayer } from "@/lib/push";

export async function POST(req: Request) {
  const me = await getSessionPlayerId();
  if (!me) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    const nickname = String(body?.nickname ?? "").trim().toUpperCase();
    if (nickname.length < 3) {
      return NextResponse.json({ error: "ВВЕДИТЕ ПОЗЫВНОЙ" }, { status: 400 });
    }

    const target = await prisma.player.findUnique({ where: { nickname } });
    if (!target) {
      return NextResponse.json({ error: "ОХОТНИК НЕ НАЙДЕН" }, { status: 404 });
    }
    if (target.id === me) {
      return NextResponse.json(
        { error: "НЕЛЬЗЯ ДОБАВИТЬ САМОГО СЕБЯ" },
        { status: 400 },
      );
    }

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: me, addresseeId: target.id },
          { requesterId: target.id, addresseeId: me },
        ],
      },
    });

    if (existing) {
      if (existing.status === "accepted") {
        return NextResponse.json({ error: "УЖЕ В ДРУЗЬЯХ" }, { status: 409 });
      }
      if (existing.requesterId === me) {
        return NextResponse.json(
          { error: "ЗАЯВКА УЖЕ ОТПРАВЛЕНА" },
          { status: 409 },
        );
      }
      // Встречная заявка: этот игрок уже звал нас, принимаем сразу
      await prisma.friendship.update({
        where: { id: existing.id },
        data: { status: "accepted" },
      });
      return NextResponse.json({ status: "accepted" });
    }

    await prisma.friendship.create({
      data: { requesterId: me, addresseeId: target.id },
    });

    const me_ = await prisma.player.findUnique({
      where: { id: me },
      select: { nickname: true },
    });
    sendPushToPlayer(target.id, {
      title: "LEVEL_UP // OS",
      body: `${me_?.nickname ?? "Кто-то"} хочет добавить вас в друзья`,
      url: "/friends",
    }).catch(() => {});

    return NextResponse.json({ status: "pending" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ОШИБКА СИСТЕМЫ" }, { status: 500 });
  }
}