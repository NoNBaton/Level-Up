import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clearSession, getSessionPlayerId } from "@/lib/session";
import { privatePlayer } from "@/lib/player";

export async function GET() {
  const id = await getSessionPlayerId();
  if (!id) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }

  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) {
    await clearSession();
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }

  return NextResponse.json({ player: privatePlayer(player) });
}