import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isLocked, lockedMinutesLeft } from "@/lib/player";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nickname = String(body.nickname ?? "").trim().toUpperCase();

    const player = await prisma.player.findUnique({ where: { nickname } });
    if (!player) {
      return NextResponse.json({ error: "ОХОТНИК НЕ НАЙДЕН" }, { status: 404 });
    }
    if (isLocked(player)) {
      return NextResponse.json(
        {
          error: `СЛИШКОМ МНОГО ПОПЫТОК. ПОВТОРИТЕ ЧЕРЕЗ ${lockedMinutesLeft(player)} МИН.`,
        },
        { status: 429 },
      );
    }
    if (!player.recoveryQuestion) {
      return NextResponse.json(
        { error: "ДЛЯ ЭТОГО АККАУНТА НЕ ЗАДАН СЕКРЕТНЫЙ ВОПРОС" },
        { status: 400 },
      );
    }

    return NextResponse.json({ question: player.recoveryQuestion });
  } catch (error) {
    console.error(error);
        return NextResponse.json({ error: "ОШИБКА СИСТЕМЫ", debug: String(error) }, { status: 500 });
  }
}