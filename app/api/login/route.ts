import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";
import { authIdFor, privatePlayer } from "@/lib/player";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nickname = String(body.nickname ?? "").trim().toUpperCase();
    const password = String(body.password ?? "");

    const player = await prisma.player.findUnique({ where: { nickname } });
    const valid = player
      ? await bcrypt.compare(password, player.passwordHash)
      : false;

    if (!player || !valid) {
      return NextResponse.json(
        { error: "НЕВЕРНЫЙ ПОЗЫВНОЙ ИЛИ КОД ДОСТУПА" },
        { status: 401 }
      );
    }

    await setSession(player.id);

    return NextResponse.json({
      status: "ok",
      account: { name: player.nickname, authId: authIdFor(player.id) },
      player: privatePlayer(player),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "ОШИБКА СИСТЕМЫ ВХОДА" },
      { status: 500 }
    );
  }
}