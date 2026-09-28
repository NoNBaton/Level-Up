import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";
import { pendingRewards } from "@/lib/social";

function hasCode(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === code
  );
}

export async function POST(req: Request) {
  const me = await getSessionPlayerId();
  if (!me) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }
  try {
    const body = await req.json().catch(() => null);
    const key = String(body?.key ?? "");

    const reward = (await pendingRewards(me)).find((r) => r.key === key);
    if (!reward) {
      return NextResponse.json({ error: "НАГРАДА НЕДОСТУПНА" }, { status: 404 });
    }

    try {
      await prisma.rewardClaim.create({ data: { playerId: me, key } });
    } catch (error) {
      if (hasCode(error, "P2002")) {
        return NextResponse.json({ error: "УЖЕ ПОЛУЧЕНО" }, { status: 409 });
      }
      throw error;
    }
    return NextResponse.json({ xp: reward.xp, achievement: reward.achievement });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ОШИБКА СИСТЕМЫ" }, { status: 500 });
  }
}