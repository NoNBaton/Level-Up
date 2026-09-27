import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";
import {
  authIdFor,
  privatePlayer,
  isLocked,
  lockedMinutesLeft,
  MAX_LOGIN_ATTEMPTS,
  LOCK_MINUTES,
} from "@/lib/player";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nickname = String(body.nickname ?? "").trim().toUpperCase();
    const password = String(body.password ?? "");

    const player = await prisma.player.findUnique({ where: { nickname } });

    if (player && isLocked(player)) {
      return NextResponse.json(
        {
          error: `СЛИШКОМ МНОГО ПОПЫТОК. ПОВТОРИТЕ ЧЕРЕЗ ${lockedMinutesLeft(player)} МИН.`,
        },
        { status: 429 },
      );
    }

    const valid = player
      ? await bcrypt.compare(password, player.passwordHash)
      : false;

    if (!player || !valid) {
      if (player) {
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
        if (lock) {
          return NextResponse.json(
            {
              error: `СЛИШКОМ МНОГО ПОПЫТОК. ПОВТОРИТЕ ЧЕРЕЗ ${LOCK_MINUTES} МИН.`,
            },
            { status: 429 },
          );
        }
      }
      return NextResponse.json(
        { error: "НЕВЕРНЫЙ ПОЗЫВНОЙ ИЛИ КОД ДОСТУПА" },
        { status: 401 },
      );
    }

    if (player.failedLoginAttempts > 0 || player.lockedUntil) {
      await prisma.player.update({
        where: { id: player.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    await setSession(player.id);

    return NextResponse.json({
      status: "ok",
      account: { name: player.nickname, authId: authIdFor(player.id) },
      player: privatePlayer(player),
    });
  } catch (error) {
return NextResponse.json(
  { error: "ОШИБКА СИСТЕМЫ ВХОДА", debug: String(error) },
  { status: 500 },
);
  }
}