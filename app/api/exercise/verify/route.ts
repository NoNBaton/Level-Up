import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";

const SECRET = process.env.EXERCISE_SECRET || process.env.PUSHUP_SECRET || "dev-secret-change-me";
const MIN_REP_MS: Record<string, number> = { pushup: 700, squat: 900 };
const MAX_SESSION_MS = 15 * 60 * 1000;
const sign = (p: string) => crypto.createHmac("sha256", SECRET).update(p).digest("hex");

function utcDay(offset: number): string {
  const d = new Date(Date.now() + offset * 86400000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
const err = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  const playerId = await getSessionPlayerId();
  if (!playerId) return err("НЕ АВТОРИЗОВАН", 401);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return err("НЕВЕРНЫЙ ЗАПРОС");

  if (body.action === "start") {
    const exercise = body.exercise === "squat" ? "squat" : "pushup";
    const target = Math.min(200, Math.max(1, Math.floor(Number(body.target)) || 0));
    const questId = String(body.questId || "").slice(0, 40);
    const date = String(body.date || "");
    if (!questId || ![-1, 0, 1].some((o) => utcDay(o) === date)) return err("НЕВЕРНЫЕ ДАННЫЕ");

    const payload = Buffer.from(
      JSON.stringify({ p: playerId, t: Date.now(), n: crypto.randomUUID(), exercise, target, questId, date }),
    ).toString("base64url");
    return NextResponse.json({ token: `${payload}.${sign(payload)}` });
  }

  if (body.action === "finish") {
    const [b64, sig] = String(body.token || "").split(".");
    const good = !!b64 && !!sig && sig.length === 64 &&
      crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(sign(b64)));
    if (!good) return err("НЕВЕРНЫЙ ТОКЕН");

    const p = JSON.parse(Buffer.from(b64, "base64url").toString());
    if (p.p !== playerId) return err("НЕВЕРНЫЙ ТОКЕН");

    const elapsed = Date.now() - p.t;
    const times: number[] = Array.isArray(body.repTimes) ? body.repTimes.map(Number) : [];
    const reps = Number(body.reps);
    const minGap = MIN_REP_MS[p.exercise] ?? 700;

    const ok =
      reps >= p.target && times.length === reps && times.every(Number.isFinite) &&
      times.every((t, i) => i === 0 || t - times[i - 1] >= minGap) &&
      times[reps - 1] <= elapsed + 2000 && elapsed <= MAX_SESSION_MS;
    if (!ok) return err("ПРОВЕРКА НЕ ПРОЙДЕНА");

    try {
      // Одноразовость токена: уникальный ключ (playerId + key) не даст использовать его дважды
      await prisma.rewardClaim.create({ data: { playerId, key: `exnonce:${p.n}` } });
      // Отметка «этот квест подтверждён камерой» — её читает /api/progress
      await prisma.rewardClaim.upsert({
        where: { playerId_key: { playerId, key: `verified:${p.date}:${p.questId}` } },
        update: {},
        create: { playerId, key: `verified:${p.date}:${p.questId}` },
      });
    } catch {
      return err("ТОКЕН УЖЕ ИСПОЛЬЗОВАН");
    }
    return NextResponse.json({ ok: true, reps });
  }

  return err("НЕИЗВЕСТНОЕ ДЕЙСТВИЕ");
}
