import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";
import { areFriends, autoTotalOf, finalizeExpiredDuels } from "@/lib/social";

export async function GET() {
  const me = await getSessionPlayerId();
  if (!me) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }
  try {
    await finalizeExpiredDuels(me);
    const rows = await prisma.duel.findMany({
      where: { OR: [{ challengerId: me }, { opponentId: me }] },
      include: {
        challenger: { select: { nickname: true, progress: true } },
        opponent: { select: { nickname: true, progress: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    const duels = rows.map((d) => {
      const iAmChallenger = d.challengerId === me;
      const mine = iAmChallenger ? d.challenger : d.opponent;
      const other = iAmChallenger ? d.opponent : d.challenger;
      const myBase = iAmChallenger ? d.challengerBase : d.opponentBase;
      const theirBase = iAmChallenger ? d.opponentBase : d.challengerBase;

      let myScore = 0;
      let theirScore = 0;
      if (d.status === "active") {
        myScore = Math.max(0, autoTotalOf(mine.progress) - myBase);
        theirScore = Math.max(0, autoTotalOf(other.progress) - theirBase);
      } else if (d.status === "finished") {
        myScore = iAmChallenger ? d.challengerScore : d.opponentScore;
        theirScore = iAmChallenger ? d.opponentScore : d.challengerScore;
      }
      const result =
        d.status === "finished"
          ? d.winnerId === null
            ? "tie"
            : d.winnerId === me
              ? "win"
              : "lose"
          : null;

      return {
        id: d.id,
        status: d.status,
        iAmChallenger,
        other: other.nickname,
        myScore,
        theirScore,
        endsAt: d.endsAt,
        result,
      };
    });

    return NextResponse.json({ duels });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ОШИБКА СИСТЕМЫ" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const me = await getSessionPlayerId();
  if (!me) {
    return NextResponse.json({ error: "НЕ АВТОРИЗОВАН" }, { status: 401 });
  }
  try {
    const body = await req.json().catch(() => null);
    const nickname = String(body?.nickname ?? "").trim().toUpperCase();
    const target = await prisma.player.findUnique({ where: { nickname } });
    if (!target) {
      return NextResponse.json({ error: "ОХОТНИК НЕ НАЙДЕН" }, { status: 404 });
    }
    if (target.id === me) {
      return NextResponse.json({ error: "НЕЛЬЗЯ ВЫЗВАТЬ САМОГО СЕБЯ" }, { status: 400 });
    }
    if (!(await areFriends(me, target.id))) {
      return NextResponse.json({ error: "ДУЭЛЬ ТОЛЬКО С ДРУЗЬЯМИ" }, { status: 403 });
    }

    await finalizeExpiredDuels(me);

    const pair = await prisma.duel.findFirst({
      where: {
        status: { in: ["pending", "active"] },
        OR: [
          { challengerId: me, opponentId: target.id },
          { challengerId: target.id, opponentId: me },
        ],
      },
    });
    if (pair) {
      return NextResponse.json(
        { error: "ДУЭЛЬ С ЭТИМ ИГРОКОМ УЖЕ ИДЁТ ИЛИ ЖДЁТ ОТВЕТА" },
        { status: 409 },
      );
    }
    const mineActive = await prisma.duel.count({
      where: {
        status: "active",
        OR: [{ challengerId: me }, { opponentId: me }],
      },
    });
    if (mineActive > 0) {
      return NextResponse.json(
        { error: "У ВАС УЖЕ ЕСТЬ АКТИВНАЯ ДУЭЛЬ" },
        { status: 409 },
      );
    }

    await prisma.duel.create({
      data: { challengerId: me, opponentId: target.id },
    });
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ОШИБКА СИСТЕМЫ" }, { status: 500 });
  }
}