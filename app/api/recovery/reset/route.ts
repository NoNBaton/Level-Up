import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  normalizeAnswer,
  isLocked,
  lockedMinutesLeft,
  MAX_LOGIN_ATTEMPTS,
  LOCK_MINUTES,
} from "@/lib/player";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nickname = String(body.nickname ?? "").trim().toUpperCase();
    const answer = normalizeAnswer(body.answer);
    const newPassword = String(body.newPassword ?? "");

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
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "НОВЫЙ КОД ДОСТУПА — МИНИМУМ 6 СИМВОЛОВ" },
        { status: 400 },
      );
    }

    const valid = player.recoveryAnswerHash
      ? await bcrypt.compare(answer, player.recoveryAnswerHash)
      : false;

    if (!valid) {
      const attempts = player.failedLoginAttempts + 1;
      const lock = attempts >= MAX_LOGIN_ATTEMPTS;
      await prisma.player.update({
        where: { id: player.id },
        data: {
          failedLoginAttempts: lock ? 0 : attempts,
          lockedUntil: lock
            ? new Date(Date.now() + LOCK_MINUTES * 60000)
            : null,
        },
      });
      return NextResponse.json({ error: "НЕВЕРНЫЙ ОТВЕТ" }, { status: 401 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.player.update({
      where: { id: player.id },
      data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ОШИБКА СИСТЕМЫ" }, { status: 500 });
  }
}