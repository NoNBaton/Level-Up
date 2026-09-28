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
    const accept = body?.accept === true;

    if (!id) {
      return NextResponse.json({ error: "НЕВЕРНЫЙ ЗАПРОС" }, { status: 400 });
    }

    // Принять или отклонить может только тот, кому отправили заявку
    const request = await prisma.friendship.findFirst({
      where: { id, addresseeId: me, status: "pending" },
    });
    if (!request) {
      return NextResponse.json({ error: "ЗАЯВКА НЕ НАЙДЕНА" }, { status: 404 });
    }

    if (accept) {
      await prisma.friendship.update({
        where: { id: request.id },
        data: { status: "accepted" },
      });
      return NextResponse.json({ status: "accepted" });
    }

    await prisma.friendship.delete({ where: { id: request.id } });
    return NextResponse.json({ status: "declined" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ОШИБКА СИСТЕМЫ" }, { status: 500 });
  }
}