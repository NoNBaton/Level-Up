import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToPlayer } from "@/lib/push";
import { CATEGORY_META } from "@/lib/quests";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "НЕТ ДОСТУПА" }, { status: 401 });
  }

  try {
    const players = await prisma.player.findMany({
      where: { pushSubscriptions: { some: {} } },
      select: { id: true, nickname: true, progress: true, streak: true },
    });

    let sent = 0;
    for (const p of players) {
      const prog =
        p.progress && typeof p.progress === "object" ? (p.progress as any) : {};
      const quests = Array.isArray(prog.dailyQuests) ? prog.dailyQuests : [];

      const count = quests.length;
      const streakPart = p.streak > 0 ? ` Стрик ${p.streak}D на кону.` : "";
      const body =
        count > 0
          ? `Сегодня ${count} квеста ждут выполнения.${streakPart}`
          : `Новый день, новые квесты. Загляните в систему!`;

      await sendPushToPlayer(p.id, {
        title: "LEVEL_UP // OS — Доброе утро, охотник",
        body,
        url: "/",
      });
      sent++;
    }

    return NextResponse.json({ status: "ok", checked: players.length, sent });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ОШИБКА СИСТЕМЫ" }, { status: 500 });
  }
}