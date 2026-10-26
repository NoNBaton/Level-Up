import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPlayerId } from "@/lib/session";

const SECRET = process.env.EXERCISE_SECRET || process.env.PUSHUP_SECRET || "dev-secret-change-me";
const MIN_REP_MS: Record<string, number> = { pushup: 700, squat: 900 };
const MAX_SESSION_MS = 30 * 60 * 1000;     // для отжиманий и приседаний
const MAX_RUN_MS = 3 * 60 * 60 * 1000;      // для пробежки
const sign = (p: string) => crypto.createHmac("sha256", SECRET).update(p).digest("hex");

function utcDay(offset: number): string {
  const d = new Date(Date.now() + offset * 86400000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
const err = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

const rad = (x: number) => (x * Math.PI) / 180;
function hav(a: number[], b: number[]): number {
  const dLat = rad(b[0] - a[0]), dLon = rad(b[1] - a[1]);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(s));
}

// Пересчитываем дистанцию из точек сами, клиенту на слово не верим
function checkRun(points: unknown, targetKm: number, elapsed: number): { ok: boolean; distance: number } {
  if (!Array.isArray(points) || points.length < 2 || points.length > 6000) return { ok: false, distance: 0 };
  let dist = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (!Array.isArray(p) || p.length !== 3 || !p.every(Number.isFinite)) return { ok: false, distance: 0 };
    if (Math.abs(p[0]) > 90 || Math.abs(p[1]) > 180) return { ok: false, distance: 0 };
    if (i === 0) continue;
    const q = points[i - 1] as number[];
    const dt = (p[2] - q[2]) / 1000;
    if (dt <= 0) return { ok: false, distance: 0 };
    if (dt > 30) continue;                         // разрыв GPS: участок не считаем
    const d = hav(q, p);
    if (d / dt > 8) return { ok: false, distance: 0 }; // быстрее 8 м/с: не бег
    dist += d;
  }
  const first = points[0][2], last = points[points.length - 1][2];
  const span = (last - first) / 1000;
  const avg = span > 0 ? dist / span : 0;
  const ok =
    dist >= targetKm * 1000 * 0.97 &&
    avg >= 0.8 && avg <= 6.5 &&                    // от очень медленного шага до быстрого бега
    last <= elapsed + 2000 && elapsed <= MAX_RUN_MS;
  return { ok, distance: Math.round(dist) };
}

export async function POST(req: Request) {
  const playerId = await getSessionPlayerId();
  if (!playerId) return err("НЕ АВТОРИЗОВАН", 401);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return err("НЕВЕРНЫЙ ЗАПРОС");

  if (body.action === "start") {
    const exercise = body.exercise === "run" ? "run" : body.exercise === "squat" ? "squat" : "pushup";
    const raw = Number(body.target);
    const target =
      exercise === "run"
        ? Math.min(50, Math.max(0.1, Number.isFinite(raw) ? raw : 0))
        : Math.min(200, Math.max(1, Math.floor(raw) || 0));
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
    let distance = 0;

    if (p.exercise === "run") {
      const res = checkRun(body.points, p.target, elapsed);
      if (!res.ok) return err("МАРШРУТ НЕ ПРОШЁЛ ПРОВЕРКУ");
      distance = res.distance;
    } else {
      const times: number[] = Array.isArray(body.repTimes) ? body.repTimes.map(Number) : [];
      const reps = Number(body.reps);
      const minGap = MIN_REP_MS[p.exercise] ?? 700;
      const ok =
        reps >= p.target && times.length === reps && times.every(Number.isFinite) &&
        times.every((t, i) => i === 0 || t - times[i - 1] >= minGap) &&
        times[reps - 1] <= elapsed + 2000 && elapsed <= MAX_SESSION_MS;
      if (!ok) return err("ПРОВЕРКА НЕ ПРОЙДЕНА");
    }

    try {
      // Одноразовость токена: уникальный ключ (playerId + key) не даст использовать его дважды
      await prisma.rewardClaim.create({ data: { playerId, key: `exnonce:${p.n}` } });
      // Отметка «этот квест подтверждён» — её читает /api/progress
      await prisma.rewardClaim.upsert({
        where: { playerId_key: { playerId, key: `verified:${p.date}:${p.questId}` } },
        update: {},
        create: { playerId, key: `verified:${p.date}:${p.questId}` },
      });
    } catch {
      return err("ТОКЕН УЖЕ ИСПОЛЬЗОВАН");
    }
    return NextResponse.json({ ok: true, distance });
  }

  return err("НЕИЗВЕСТНОЕ ДЕЙСТВИЕ");
}
