import { NextResponse } from "next/server";
import { getSessionPlayerId } from "@/lib/session";
import { pendingRewards } from "@/lib/social";

export async function GET() {
  const me = await getSessionPlayerId();
  if (!me) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }
  try {
    return NextResponse.json({ rewards: await pendingRewards(me) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ОШИБКА СИСТЕМЫ" }, { status: 500 });
  }
}