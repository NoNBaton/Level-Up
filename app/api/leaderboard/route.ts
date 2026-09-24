import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const players = await prisma.player.findMany({
    orderBy: [
      { level: "desc" },
      { xp: "desc" },
      { streak: "desc" },
      { createdAt: "asc" },
    ],
    take: 50,
    select: {
      nickname: true,
      level: true,
      xp: true,
      streak: true,
      rank: true,
      avatar: true,
    },
  });

  return NextResponse.json({ players });
}