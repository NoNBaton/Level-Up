import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";
import { ITEM_BY_ID, ownedItemIds } from "@/lib/items";

async function snapshot(id: string) {
  const p = await prisma.player.findUnique({
    where: { id },
    include: { inventory: true },
  });
  if (!p) return null;
  const owned = Array.from(
    ownedItemIds(
      p.achievements,
      p.inventory.map((i) => i.itemId),
    ),
  );
  return { coins: p.coins, owned };
}

export async function GET() {
  const id = await getSessionPlayerId();
  if (!id) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }
  const snap = await snapshot(id);
  if (!snap) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }
  return NextResponse.json(snap);
}

export async function POST(req: Request) {
  const id = await getSessionPlayerId();
  if (!id) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const itemId = typeof body?.itemId === "string" ? body.itemId : "";
  const item = ITEM_BY_ID[itemId];
  if (!item || item.source !== "shop" || !item.price) {
    return NextResponse.json({ error: "ПРЕДМЕТ НЕ ПРОДАЁТСЯ" }, { status: 400 });
  }
  const price = item.price;

  const before = await snapshot(id);
  if (!before) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }
  if (before.owned.includes(itemId)) {
    return NextResponse.json({ error: "УЖЕ КУПЛЕНО" }, { status: 409 });
  }
  if (before.coins < price) {
    return NextResponse.json({ error: "НЕ ХВАТАЕТ МОНЕТ" }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Условие coins >= price проверяется в самой базе: двойной клик не пройдёт
      const r = await tx.player.updateMany({
        where: { id, coins: { gte: price } },
        data: { coins: { decrement: price } },
      });
      if (r.count === 0) throw new Error("NO_COINS");
      await tx.inventoryItem.create({
        data: { playerId: id, itemId, source: "shop" },
      });
    });
  } catch (e: any) {
    if (e?.message === "NO_COINS") {
      return NextResponse.json({ error: "НЕ ХВАТАЕТ МОНЕТ" }, { status: 400 });
    }
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "УЖЕ КУПЛЕНО" }, { status: 409 });
    }
    console.error(
      "shop error:",
      e instanceof Error ? e.message : String(e),
    );
    return NextResponse.json({ error: "ОШИБКА ПОКУПКИ" }, { status: 500 });
  }

  const after = await snapshot(id);
  return NextResponse.json({ status: "ok", ...after });
}