import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";

export async function POST(req: Request) {
  const me = await getSessionPlayerId();
  if (!me) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    const id = String(body?.id ?? "");

    await prisma.friendship.deleteMany({
      where: { id, OR: [{ requesterId: me }, { addresseeId: me }] },
    });
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ОШИБКА СИСТЕМЫ" }, { status: 500 });
  }
}