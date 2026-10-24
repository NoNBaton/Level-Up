import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";

export async function POST() {
  const id = await getSessionPlayerId();
  if (!id) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }

  await prisma.player.update({
    where: { id },
    data: { gateSeen: true },
  });

  return NextResponse.json({ status: "ok" });
}