import { prisma } from "../lib/prisma";

async function main() {
  const players = await prisma.player.findMany({
    orderBy: { level: "desc" },
  });

  console.table(
    players.map((p: any) => ({
      ник: p.nickname,
      lvl: p.level,
      xp: p.xp,
      стрик: p.streak,
      монеты: p.coins,
      боксы: p.lootboxes,
      ранг: p.rank,
      создан: p.createdAt.toISOString().slice(0, 10),
    })),
  );
  console.log(`Всего игроков: ${players.length}`);
}

main()
  .catch((e) => {
    console.error("ОШИБКА:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });