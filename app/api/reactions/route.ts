import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";

const ALLOWED = ["🔥", "💪", "👏", "⚡"];

async function areFriends(a: string, b: string) {
  const row = await prisma.friendship.findFirst({
    where: {
      status: "accepted",
      OR: [
        { requesterId: a, addresseeId: b },
        { requesterId: b, addresseeId: a },
      ],
    },
  });
  return !!row;
}

export async function GET(req: Request) {
  try {
    const nickname = (new URL(req.url).searchParams.get("nickname") ?? "")
      .trim()
      .toUpperCase();
    const target = await prisma.player.findUnique({ where: { nickname } });
    if (!target) {
      return NextResponse.json({ error: "ОХОТНИК НЕ НАЙДЕН" }, { status: 404 });
    }

    const rows = await prisma.reaction.findMany({
      where: { toId: target.id },
      select: { emoji: true },
    });
    const counts: Record<string, number> = {};
    for (const r of rows) counts[r.emoji] = (counts[r.emoji] ?? 0) + 1;

    let mine: string | null = null;
    let canReact = false;
    const me = await getSessionPlayerId();
    if (me && me !== target.id) {
      const own = await prisma.reaction.findUnique({
        where: { fromId_toId: { fromId: me, toId: target.id } },
      });
      mine = own?.emoji ?? null;
      canReact = await areFriends(me, target.id);
    }

    return NextResponse.json({ counts, mine, canReact });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ОШИБКА СИСТЕМЫ" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const me = await getSessionPlayerId();
  if (!me) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    const nickname = String(body?.nickname ?? "").trim().toUpperCase();
    const emoji = String(body?.emoji ?? "");

    if (!ALLOWED.includes(emoji)) {
      return NextResponse.json({ error: "НЕВЕРНАЯ РЕАКЦИЯ" }, { status: 400 });
    }

    const target = await prisma.player.findUnique({ where: { nickname } });
    if (!target) {
      return NextResponse.json({ error: "ОХОТНИК НЕ НАЙДЕН" }, { status: 404 });
    }
    if (target.id === me) {
      return NextResponse.json(
        { error: "НЕЛЬЗЯ РЕАГИРОВАТЬ НА СВОЙ ПРОФИЛЬ" },
        { status: 400 },
      );
    }
    if (!(await areFriends(me, target.id))) {
      return NextResponse.json(
        { error: "РЕАГИРОВАТЬ МОГУТ ТОЛЬКО ДРУЗЬЯ" },
        { status: 403 },
      );
    }

    const key = { fromId: me, toId: target.id };
    const existing = await prisma.reaction.findUnique({
      where: { fromId_toId: key },
    });

    if (existing && existing.emoji === emoji) {
      // повторное нажатие снимает реакцию
      await prisma.reaction.delete({ where: { fromId_toId: key } });
    } else {
      await prisma.reaction.upsert({
        where: { fromId_toId: key },
        create: { ...key, emoji },
        update: { emoji },
      });
    }
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ОШИБКА СИСТЕМЫ" }, { status: 500 });
  }
}