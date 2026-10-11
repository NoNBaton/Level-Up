import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";
import { BOX_FIELD, BOX_INFO, isTier } from "@/lib/lootboxes";

export async function POST(req: Request) {
  const id = await getSessionPlayerId();
  if (!id) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!isTier(body?.tier)) {
    return NextResponse.json({ error: "НЕВЕРНЫЙ ЗАПРОС" }, { status: 400 });
  }
  const tier = body.tier;
  const price = BOX_INFO[tier].price;
  const field = BOX_FIELD[tier];

  try {
    // Одна атомарная операция: монеты списываются и коробка добавляется
    // только если монет хватает. Двойной клик не пройдёт.
    const r = await prisma.player.updateMany({
      where: { id, coins: { gte: price } },
      data: {
        coins: { decrement: price },
        [field]: { increment: 1 },
      } as any,
    });
    if (r.count === 0) {
      return NextResponse.json({ error: "НЕ ХВАТАЕТ МОНЕТ" }, { status: 400 });
    }

    const p = await prisma.player.findUnique({
      where: { id },
      select: {
        coins: true,
        lootboxes: true,
        lootboxesRare: true,
        lootboxesLegendary: true,
      },
    });
    return NextResponse.json({
      status: "ok",
      coins: p?.coins ?? 0,
      boxes: {
        normal: p?.lootboxes ?? 0,
        rare: p?.lootboxesRare ?? 0,
        legendary: p?.lootboxesLegendary ?? 0,
      },
    });
  } catch (e) {
    console.error(
      "lootbox buy error:",
      e instanceof Error ? e.message : String(e),
    );
    return NextResponse.json({ error: "ОШИБКА ПОКУПКИ" }, { status: 500 });
  }
}