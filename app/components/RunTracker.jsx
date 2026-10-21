"use client";
import { useEffect, useRef, useState } from "react";

const R = 6371000;
const rad = (x) => (x * Math.PI) / 180;
const hav = (a, b) => {
  const dLat = rad(b[0] - a[0]),
    dLon = rad(b[1] - a[1]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};
const MAX_SPEED = 8; // м/с: быстрее — это не бег (машина, глюк GPS)
const MAX_ACC = 30; // м: точность хуже — точку игнорируем
const GAP_S = 30; // сек: дольше без точек — участок не считаем
const mmss = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * target: километры (например 1 или 2.5)
 * questId, date: что подтверждаем
 * onVerified: вызывается, когда сервер подтвердил пробежку
 */
export default function RunTracker({
  target = 1,
  questId,
  date,
  verifyUrl = "/api/exercise/verify",
  onVerified,
  onCancel,
}) {
  const [phase, setPhase] = useState("idle"); // idle | starting | active | sending | done | error
  const [dist, setDist] = useState(0); // метры
  const [secs, setSecs] = useState(0);
  const [acc, setAcc] = useState(null);
  const [hint, setHint] = useState("");
  const r = useRef({});
  const alive = useRef(true);

  function stopAll() {
    const s = r.current;
    if (s.watch != null) navigator.geolocation.clearWatch(s.watch);
    clearInterval(s.timer);
    try {
      s.lock && s.lock.release();
    } catch {}
    if (s.vis) document.removeEventListener("visibilitychange", s.vis);
    s.watch = null;
    s.timer = null;
    s.lock = null;
    s.vis = null;
    s.done = true;
  }

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      stopAll();
    };
  }, []);

  async function getLock() {
    try {
      if ("wakeLock" in navigator)
        r.current.lock = await navigator.wakeLock.request("screen");
    } catch {}
  }

  async function start() {
    if (!("geolocation" in navigator)) {
      setPhase("error");
      setHint("Это устройство не поддерживает геолокацию");
      return;
    }
    setPhase("starting");
    setHint("");
    setDist(0);
    setSecs(0);
    try {
      const res = await fetch(verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          exercise: "run",
          target,
          questId,
          date,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Сервер не выдал токен");

      const s = (r.current = {
        token: d.token,
        t0: Date.now(),
        last: null,
        points: [],
        dist: 0,
        done: false,
      });
      await getLock();
      s.vis = () => {
        if (document.visibilityState === "visible") {
          getLock();
          setHint("Экран выключался: часть пути могла не записаться");
        }
      };
      document.addEventListener("visibilitychange", s.vis);
      s.timer = setInterval(
        () => setSecs(Math.floor((Date.now() - s.t0) / 1000)),
        1000,
      );

      s.watch = navigator.geolocation.watchPosition(onPos, onErr, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 20000,
      });
      setPhase("active");
      setHint("Ищу GPS… выйди на открытое место и начинай бежать");
    } catch (e) {
      stopAll();
      setPhase("error");
      setHint(e.message || "Ошибка");
    }
  }

  function onErr(e) {
    if (e.code === 1) {
      stopAll();
      setPhase("error");
      setHint("Нет доступа к геолокации. Разреши её в настройках браузера");
    } else setHint("GPS не отвечает, выйди на открытое место");
  }

  function onPos(p) {
    const s = r.current;
    if (s.done) return;
    const { latitude: lat, longitude: lon, accuracy } = p.coords;
    setAcc(Math.round(accuracy));
    if (accuracy > MAX_ACC) {
      setHint("Слабый GPS, выйди на открытое место");
      return;
    }

    const t = Date.now() - s.t0,
      cur = [lat, lon];
    const pt = [+lat.toFixed(6), +lon.toFixed(6), t];
    if (!s.last) {
      s.last = { pt: cur, t };
      s.points.push(pt);
      setHint("Беги!");
      return;
    }

    const dt = (t - s.last.t) / 1000;
    if (dt <= 0) return;
    if (dt > GAP_S) {
      s.last = { pt: cur, t };
      s.points.push(pt);
      setHint("GPS пропадал: этот участок не засчитан");
      return;
    }

    const d = hav(s.last.pt, cur);
    if (d / dt > MAX_SPEED) {
      setHint("Слишком быстро, это не бег");
      return;
    }
    if (d < Math.max(4, accuracy * 0.6)) return; // дрожание GPS на месте

    s.dist += d;
    s.last = { pt: cur, t };
    s.points.push(pt);
    setDist(s.dist);
    setHint("Засчитано, продолжай");
    if (s.dist >= target * 1000) finish();
  }

  async function finish() {
    const s = r.current;
    if (s.done) return;
    stopAll();
    setPhase("sending");
    setHint("Проверяю маршрут…");
    try {
      const res = await fetch(verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "finish",
          token: s.token,
          points: s.points.slice(-6000),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok)
        throw new Error(data.error || "Сервер не принял результат");
      if (!alive.current) return;
      setPhase("done");
      setHint("ВЫПОЛНЕНО!");
      onVerified?.({ distance: data.distance });
    } catch (e) {
      if (alive.current) {
        setPhase("error");
        setHint(e.message);
      }
    }
  }

  function stop() {
    stopAll();
    setPhase("idle");
    setHint("Забег остановлен, прогресс не засчитан");
    setDist(0);
    setSecs(0);
  }

  const pct = Math.min(100, (dist / (target * 1000)) * 100);
  const pace = dist > 50 ? secs / (dist / 1000) : 0;
  const btn = {
    background: "#5ecbff22",
    color: "#cfe6ff",
    border: "1px solid #5ecbff99",
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: 2,
    fontSize: 12,
  };
  const cell = {
    flex: 1,
    border: "1px solid #5ecbff33",
    padding: "6px 4px",
    textAlign: "center",
  };
  const lab = { fontSize: 9, letterSpacing: 2, color: "#7fa8d6" };

  return (
    <div style={{ color: "#e6f1ff", fontFamily: "inherit" }}>
      <div style={{ textAlign: "center", margin: "6px 0 10px" }}>
        <div
          style={{
            fontSize: 40,
            fontWeight: 800,
            textShadow: "0 0 10px #5ecbff",
            lineHeight: 1,
          }}
        >
          {(dist / 1000).toFixed(2)}
          <span style={{ fontSize: 16, opacity: 0.7 }}>
            {" "}
            / {Number(target).toFixed(2)} КМ
          </span>
        </div>
      </div>
      <div
        style={{
          height: 12,
          border: "1px solid #5ecbff66",
          padding: 2,
          background: "#020817",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg,#5ecbff,#dff0ff)",
            boxShadow: "0 0 10px #5ecbff",
            transition: "width .4s",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        <div style={cell}>
          <div style={lab}>ВРЕМЯ</div>
          <b>{mmss(secs)}</b>
        </div>
        <div style={cell}>
          <div style={lab}>ТЕМП /КМ</div>
          <b>{pace ? mmss(pace) : "--:--"}</b>
        </div>
        <div style={cell}>
          <div style={lab}>GPS</div>
          <b>{acc == null ? "--" : `±${acc} м`}</b>
        </div>
      </div>
      <p
        style={{
          minHeight: 20,
          fontSize: 12,
          margin: "10px 0",
          color: phase === "error" ? "#fda4af" : "#8fb6e6",
        }}
      >
        {hint}
      </p>

      {(phase === "idle" || phase === "error") && (
        <>
          {phase === "idle" && (
            <p style={{ fontSize: 12, color: "#8fb6e6" }}>
              Выйди на улицу, нажми «Начать» и держи экран включённым, а эту
              страницу открытой. Если экран погаснет, GPS может перестать
              записываться.
            </p>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button style={btn} onClick={start}>
              [ НАЧАТЬ ]
            </button>
            {onCancel && (
              <button style={{ ...btn, opacity: 0.8 }} onClick={onCancel}>
                ОТМЕНА
              </button>
            )}
          </div>
        </>
      )}
      {phase === "starting" && <p style={{ fontSize: 12 }}>Запускаю GPS…</p>}
      {phase === "active" && (
        <button
          style={{ ...btn, borderColor: "#fb7185aa", color: "#fda4af" }}
          onClick={stop}
        >
          [ СТОП ]
        </button>
      )}
    </div>
  );
}
