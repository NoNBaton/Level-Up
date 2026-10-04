import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToPlayer } from "@/lib/push";

function todayStr(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate(),
  ).padStart(2, "0")}`;
}

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "НЕТ ДОСТУПА" }, { status: 401 });
  }

  try {
    const today = todayStr();
    const players = await prisma.player.findMany({
      where: { pushSubscriptions: { some: {} } },
      select: { id: true, nickname: true, progress: true },
    });

    let sent = 0;
    for (const p of players) {
      const prog =
        p.progress && typeof p.progress === "object" ? (p.progress as any) : {};
      const quests = Array.isArray(prog.dailyQuests) ? prog.dailyQuests : [];
      const isToday = prog.dailyQuestsDate === today;
      const allDone =
        isToday && quests.length > 0 && quests.every((q: any) => q?.completed);

      if (isToday && quests.length > 0 && !allDone) {
        await sendPushToPlayer(p.id, {
          title: "LEVEL_UP // OS",
          body: "Квесты дня ещё не закрыты — не теряйте стрик!",
          url: "/",
        });
        sent++;
      }
    }

    return NextResponse.json({ status: "ok", checked: players.length, sent });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ОШИБКА СИСТЕМЫ" }, { status: 500 });
  }
}