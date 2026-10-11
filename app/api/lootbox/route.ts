import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";
import { ITEM_BY_ID, ownedItemIds, type Rarity } from "@/lib/items";
import { DUPLICATE_REFUND } from "@/lib/economy";
import {
  BOX_FIELD,
  RARITIES,
  isTier,
  poolFor,
  tierWeights,
  type BoxTier,
} from "@/lib/lootboxes";

function rollRarity(tier: BoxTier): Rarity {
  const w = tierWeights(tier);
  const total = RARITIES.reduce((sum, r) => sum + w[r], 0);
  let n = randomInt(Math.max(1, total));
  for (const r of RARITIES) {
    n -= w[r];
    if (n < 0 && w[r] > 0) return r;
  }
  return RARITIES.find((r) => w[r] > 0) ?? "common";
}

function rollItemId(tier: BoxTier): string {
  const rarity = rollRarity(tier);
  const pool = poolFor(tier);
  let list = pool.filter((i) => i.rarity === rarity);
  if (list.length === 0) list = pool;
  return list[randomInt(list.length)].id;
}

function boxesOf(p: {
  lootboxes: number;
  lootboxesRare: number;
  lootboxesLegendary: number;
}) {
  return {
    normal: p.lootboxes,
    rare: p.lootboxesRare,
    legendary: p.lootboxesLegendary,
  };
}

export async function GET() {
  const id = await getSessionPlayerId();
  if (!id) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }
  const p = await prisma.player.findUnique({
    where: { id },
    select: {
      lootboxes: true,
      lootboxesRare: true,
      lootboxesLegendary: true,
      coins: true,
    },
  });
  if (!p) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }
  return NextResponse.json({
    lootboxes: p.lootboxes, // обычные, для совместимости со старым кодом
    boxes: boxesOf(p),
    coins: p.coins,
  });
}

export async function POST(req: Request) {
  const id = await getSessionPlayerId();
  if (!id) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const tier: BoxTier = isTier(body?.tier) ? body.tier : "normal";
  const field = BOX_FIELD[tier];

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Коробка списывается в самой базе: двойной клик не откроет лишнюю
      const dec = await tx.player.updateMany({
        where: { id, [field]: { gte: 1 } } as any,
        data: { [field]: { decrement: 1 } } as any,
      });
      if (dec.count === 0) throw new Error("NO_BOX");

      const p = await tx.player.findUnique({
        where: { id },
        include: { inventory: true },
      });
      if (!p) throw new Error("NO_PLAYER");

      const itemId = rollItemId(tier);
      const item = ITEM_BY_ID[itemId];
      const owned = ownedItemIds(
        p.achievements,
        p.inventory.map((i) => i.itemId),
      );

      let duplicate = false;
      let refund = 0;
      if (owned.has(itemId)) {
        duplicate = true;
        refund = DUPLICATE_REFUND[item.rarity];
        await tx.player.update({
          where: { id },
          data: { coins: { increment: refund } },
        });
      } else {
        await tx.inventoryItem.create({
          data: { playerId: id, itemId, source: "lootbox" },
        });
      }

      const fresh = await tx.player.findUnique({
        where: { id },
        select: {
          coins: true,
          lootboxes: true,
          lootboxesRare: true,
          lootboxesLegendary: true,
        },
      });

      return {
        item: {
          id: item.id,
          name: item.name,
          type: item.type,
          rarity: item.rarity,
          color: item.color ?? null,
          emoji: (item as any).emoji ?? "",
        },
        tier,
        duplicate,
        refund,
        coins: fresh?.coins ?? 0,
        lootboxes: fresh?.lootboxes ?? 0,
        boxes: fresh
          ? boxesOf(fresh)
          : { normal: 0, rare: 0, legendary: 0 },
      };
    });

    return NextResponse.json({ status: "ok", ...result });
  } catch (e: any) {
    if (e?.message === "NO_BOX") {
      return NextResponse.json({ error: "НЕТ ЛУТБОКСОВ" }, { status: 400 });
    }
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "ПОВТОРИТЕ ЕЩЁ РАЗ" }, { status: 409 });
    }
    console.error("lootbox error:", e instanceof Error ? e.message : String(e));
    return NextResponse.json({ error: "ОШИБКА ОТКРЫТИЯ" }, { status: 500 });
  }
}