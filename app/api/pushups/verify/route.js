import crypto from "crypto";
import { NextResponse } from "next/server";

const SECRET = process.env.PUSHUP_SECRET || "dev-secret-change-me";
const MIN_REP_MS = 700;
const MAX_SESSION_MS = 15 * 60 * 1000;
const sign = (p) => crypto.createHmac("sha256", SECRET).update(p).digest("hex");

// На Vercel память между запросами не гарантирована.
// Для настоящей защиты храни использованные токены в БД (prisma).
const used = new Set();

export async function POST(req) {
  try {
    const body = await req.json();

    if (body.action === "start") {
      const payload = Buffer.from(
        JSON.stringify({
          t: Date.now(),
          n: crypto.randomUUID(),
          target: Number(body.target) || 0,
          taskId: body.taskId ?? null,
        }),
      ).toString("base64url");
      return NextResponse.json({ token: `${payload}.${sign(payload)}` });
    }

    if (body.action === "finish") {
      const [b64, sig] = String(body.token || "").split(".");
      const good =
        b64 &&
        sig &&
        sig.length === 64 &&
        crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(sign(b64)));
      if (!good)
        return NextResponse.json(
          { ok: false, error: "Неверный токен" },
          { status: 400 },
        );

      const p = JSON.parse(Buffer.from(b64, "base64url").toString());
      if (used.has(p.n))
        return NextResponse.json(
          { ok: false, error: "Токен уже использован" },
          { status: 400 },
        );

      const elapsed = Date.now() - p.t;
      const times = Array.isArray(body.repTimes)
        ? body.repTimes.map(Number)
        : [];
      const reps = Number(body.reps);

      const gapsOk = times.every(
        (t, i) => i === 0 || t - times[i - 1] >= MIN_REP_MS,
      );
      const okAll =
        reps >= p.target &&
        times.length === reps &&
        gapsOk &&
        times.every(Number.isFinite) &&
        times[reps - 1] <= elapsed + 2000 &&
        elapsed <= MAX_SESSION_MS;
      if (!okAll)
        return NextResponse.json(
          { ok: false, error: "Проверка не пройдена" },
          { status: 400 },
        );

      used.add(p.n);

      // TODO: здесь засчитай задание и начисли награду, например:
      // await prisma.player.update({ where: { id: userId }, data: { coins: { increment: 50 } } });

      return NextResponse.json({ ok: true, reps, taskId: p.taskId });
    }

    return NextResponse.json(
      { ok: false, error: "Неизвестное действие" },
      { status: 400 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Ошибка сервера" },
      { status: 500 },
    );
  }
}
