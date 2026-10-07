import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";
import { ITEM_BY_ID, ownedItemIds } from "@/lib/items";

async function loadPlayer(id: string) {
  return prisma.player.findUnique({
    where: { id },
    include: { inventory: true },
  });
}

export async function GET() {
  const id = await getSessionPlayerId();
  if (!id) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }
  const p = await loadPlayer(id);
  if (!p) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }
  const owned = ownedItemIds(
    p.achievements,
    p.inventory.map((i) => i.itemId),
  );
  return NextResponse.json({
    owned: Array.from(owned),
    frame: p.frame,
    title: p.title,
  });
}

export async function POST(req: Request) {
  const id = await getSessionPlayerId();
  if (!id) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const slot = body?.slot;
  const itemId = typeof body?.itemId === "string" ? body.itemId : "";

  if (slot !== "frame" && slot !== "title") {
    return NextResponse.json({ error: "НЕВЕРНЫЙ ЗАПРОС" }, { status: 400 });
  }

  const p = await loadPlayer(id);
  if (!p) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }

  try {
    // Снять титул
    if (slot === "title" && itemId === "") {
      await prisma.player.update({ where: { id }, data: { title: "" } });
      return NextResponse.json({ status: "ok", frame: p.frame, title: "" });
    }

    const item = ITEM_BY_ID[itemId];
    if (!item || item.type !== slot) {
      return NextResponse.json({ error: "НЕТ ТАКОГО ПРЕДМЕТА" }, { status: 400 });
    }

    const owned = ownedItemIds(
      p.achievements,
      p.inventory.map((i) => i.itemId),
    );
    if (!owned.has(itemId)) {
      return NextResponse.json({ error: "ПРЕДМЕТ НЕ ПОЛУЧЕН" }, { status: 403 });
    }

    await prisma.player.update({
      where: { id },
      data: slot === "frame" ? { frame: itemId } : { title: itemId },
    });

    return NextResponse.json({
      status: "ok",
      frame: slot === "frame" ? itemId : p.frame,
      title: slot === "title" ? itemId : p.title,
    });
  } catch (error) {
    console.error(
      "cosmetics error:",
      error instanceof Error ? error.message : String(error),
    );
    return NextResponse.json({ error: "ОШИБКА СОХРАНЕНИЯ" }, { status: 500 });
  }
}   