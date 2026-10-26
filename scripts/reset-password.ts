import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const [nick, newPass] = process.argv.slice(2);
  if (!nick || !newPass) {
    console.log("Использование: npx tsx scripts/reset-password.ts НИКНЕЙМ НОВЫЙ_ПАРОЛЬ");
    process.exit(1);
  }
  if (newPass.length < 6) {
    console.log("Пароль должен быть минимум 6 символов");
    process.exit(1);
  }

  const nickname = nick.trim().toUpperCase();
  const player = await prisma.player.findUnique({ where: { nickname } });
  if (!player) {
    console.log(`Игрок ${nickname} не найден`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(newPass, 10);
  await prisma.player.update({
    where: { id: player.id },
    data: { passwordHash, lockedUntil: null },
  });
  console.log(`Готово: пароль игрока ${nickname} изменён`);
}

main().finally(() => process.exit(0));