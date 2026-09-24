import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicPlayer } from "@/lib/player";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ nickname: string }> }
) {
  const { nickname } = await ctx.params;

  let name = nickname;
  try {
    name = decodeURIComponent(nickname);
  } catch {
    // уже раскодировано
  }
  name = name.trim().toUpperCase();

  const player = await prisma.player.findUnique({ where: { nickname: name } });
  if (!player) {
    return NextResponse.json({ error: "ОХОТНИК НЕ НАЙДЕН" }, { status: 404 });
  }

  return NextResponse.json({ player: publicPlayer(player) });
}