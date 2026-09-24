import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";
import { AVATARS } from "@/lib/player";

export async function PATCH(req: Request) {
  const id = await getSessionPlayerId();
  if (!id) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const bio =
    typeof body.bio === "string" ? body.bio.trim().slice(0, 140) : undefined;
  const avatar =
    typeof body.avatar === "string" &&
    (AVATARS as readonly string[]).includes(body.avatar)
      ? body.avatar
      : undefined;

  const player = await prisma.player.update({
    where: { id },
    data: { bio, avatar },
    select: { bio: true, avatar: true },
  });

  return NextResponse.json({ status: "ok", ...player });
}