"use client";
import { useEffect, useRef, useState } from "react";

const WASM =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

const SIDES = {
  left: { sh: 11, el: 13, wr: 15, hip: 23, kn: 25, an: 27 },
  right: { sh: 12, el: 14, wr: 16, hip: 24, kn: 26, an: 28 },
};
const CFG = {
  pushup: {
    title: "ОТЖИМАНИЯ",
    minRep: 600,
    tip: "Поставь телефон сбоку на полу, 1,5–2 м от тебя, чтобы было видно всё тело. Прими упор лёжа.",
  },
  squat: {
    title: "ПРИСЕДАНИЯ",
    minRep: 800,
    tip: "Поставь телефон сбоку, 2–2,5 м от тебя, чтобы было видно всё тело от головы до ног. Встань прямо.",
  },
};

// Угол с поправкой на пропорции кадра (иначе углы искажаются)
const angle = (a, b, c, ar) => {
  const v1 = { x: (a.x - b.x) * ar, y: a.y - b.y },
    v2 = { x: (c.x - b.x) * ar, y: c.y - b.y };
  const m = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
  if (!m) return 180;
  return (
    (Math.acos(Math.max(-1, Math.min(1, (v1.x * v2.x + v1.y * v2.y) / m))) *
      180) /
    Math.PI
  );
};

/**
 * target: общая цель квеста (например 100)
 * done: сколько уже сделано раньше (из сохранённого прогресса)
 * onProgress(n): вызывается после каждого повтора с общим числом
 */
export default function ({
  exercise = "pushup",
  target = 10,
  done = 0,
  questId,
  date,
  verifyUrl = "/api/exercise/verify",
  onProgress,
  onVerified,
  onCancel,
}) {
  const cfg = CFG[exercise] || CFG.pushup;
  const base = Math.min(done, target - 1); // уже сделанные повторы
  const remaining = target - base; // сколько осталось сделать сейчас
  const videoRef = useRef(null),
    canvasRef = useRef(null);
  const run = useRef({ stop: () => {} });
  const alive = useRef(true);
  const [phase, setPhase] = useState("idle");
  const [reps, setReps] = useState(base);
  const [hint, setHint] = useState("");
  const [dbg, setDbg] = useState("");
  const [facing, setFacing] = useState("user");

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      run.current.stop();
    };
  }, []);

  async function start() {
    setPhase("loading");
    setReps(base);
    setHint("");
    try {
      const r0 = await fetch(verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          exercise,
          target: remaining,
          questId,
          date,
        }),
      });
      const d0 = await r0.json().catch(() => ({}));
      if (!r0.ok) throw new Error(d0.error || "Сервер не выдал токен");
      const token = d0.token;

      const { FilesetResolver, PoseLandmarker } =
        await import("@mediapipe/tasks-vision");
      const fs = await FilesetResolver.forVisionTasks(WASM);
      const make = (d) =>
        PoseLandmarker.createFromOptions(fs, {
          baseOptions: { modelAssetPath: MODEL, delegate: d },
          runningMode: "VIDEO",
          numPoses: 1,
        });
      let pose;
      try {
        pose = await make("GPU");
      } catch {
        pose = await make("CPU");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 960 },
          height: { ideal: 540 },
        },
        audio: false,
      });
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      const st = {
        phase: null,
        upY: 0,
        downY: 0,
        minBody: 180,
        h: 0,
        lastRep: 0,
        reps: 0,
        times: [],
        t0: performance.now(),
        last: -1,
        raf: 0,
        dead: false,
        ar: canvas.width / canvas.height,
      };
      run.current.stop = () => {
        st.dead = true;
        cancelAnimationFrame(st.raf);
        stream.getTracks().forEach((t) => t.stop());
        try {
          pose.close();
        } catch {}
      };
      setPhase("active");
      setHint(cfg.tip);

      const loop = () => {
        if (st.dead) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (video.currentTime !== st.last) {
          st.last = video.currentTime;
          const now = performance.now();
          const lm = pose.detectForVideo(video, now).landmarks[0];
          if (lm) {
            exercise === "squat"
              ? analyseSquat(lm, now, st)
              : analysePushup(lm, now, st);
            draw(ctx, lm, canvas);
          } else {
            st.phase = null;
            setHint("Тебя не видно, отойди чуть дальше");
          }
          if (st.reps >= remaining) {
            finish(st, token);
            return;
          }
        }
        st.raf = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) {
      run.current.stop();
      if (alive.current) {
        setPhase("error");
        setHint(
          e.name === "NotAllowedError"
            ? "Нет доступа к камере. Разреши камеру в браузере"
            : e.message || "Ошибка",
        );
      }
    }
  }

  const count = (st, now) => {
    st.reps++;
    st.lastRep = now;
    st.times.push(Math.round(now - st.t0));
    setReps(base + st.reps);
    onProgress?.(base + st.reps); // прогресс сохраняется после каждого повтора
    setHint("Засчитано ✔");
  };

  function pick(lm) {
    const vis = (k) =>
      Object.values(SIDES[k]).reduce((s, i) => s + (lm[i].visibility ?? 0), 0) /
      6;
    const k = vis("left") >= vis("right") ? "left" : "right";
    return {
      v: vis(k),
      p: Object.fromEntries(
        Object.entries(SIDES[k]).map(([n, i]) => [n, lm[i]]),
      ),
    };
  }

  function analysePushup(lm, now, st) {
    const { v, p } = pick(lm);
    if (v < 0.4) {
      st.phase = null;
      setHint("Встань боком, чтобы было видно всё тело");
      return;
    }
    const { sh, el, wr, hip, an } = p;
    const dx = Math.abs(sh.x - an.x),
      dy = Math.abs(sh.y - an.y);
    if (!(dx > 0.25 && dy / dx < 0.8)) {
      st.phase = null;
      setDbg("поза: нет упора лёжа");
      setHint("Прими упор лёжа боком к камере");
      return;
    }
    const elbow = angle(sh, el, wr, st.ar),
      body = angle(sh, hip, an, st.ar),
      len = Math.hypot((sh.x - an.x) * st.ar, sh.y - an.y);
    setDbg(
      `локоть ${Math.round(elbow)}° · корпус ${Math.round(body)}° · ${st.phase || "ждём"}`,
    );

    if (st.phase === null && elbow >= 145) {
      st.phase = "up";
      st.upY = sh.y;
    }
    if (st.phase === "up") {
      if (elbow >= 145) st.upY = Math.min(st.upY, sh.y);
      if (elbow <= 110) {
        st.phase = "down";
        st.downY = sh.y;
        st.minBody = body;
        setHint("Вверх!");
      }
    } else if (st.phase === "down") {
      st.downY = Math.max(st.downY, sh.y);
      st.minBody = Math.min(st.minBody, body);
      if (elbow >= 145) {
        if (st.minBody < 135)
          setHint("Не считаю: держи корпус прямым, таз не провисает");
        else if (st.downY - st.upY < 0.04 * len)
          setHint("Не считаю: опустись ниже");
        else if (now - st.lastRep < cfg.minRep)
          setHint("Не считаю: слишком быстро");
        else count(st, now);
        st.phase = "up";
        st.upY = sh.y;
      }
    }
  }

  function analyseSquat(lm, now, st) {
    const { v, p } = pick(lm);
    if (v < 0.4) {
      st.phase = null;
      setHint("Встань боком, чтобы было видно всё тело");
      return;
    }
    const { sh, hip, kn, an } = p;
    const knee = angle(hip, kn, an, st.ar);
    const dx = Math.abs(sh.x - an.x),
      dy = Math.abs(sh.y - an.y);
    setDbg(`колено ${Math.round(knee)}° · ${st.phase || "ждём"}`);

    if (st.phase === null) {
      if (knee >= 155 && dy > 0.3) {
        st.phase = "up";
        st.upY = hip.y;
        st.h = dy;
      } else setHint("Встань прямо боком к камере, чтобы было видно всё тело");
      return;
    }
    if (st.phase === "up") {
      if (knee >= 155) {
        st.upY = Math.min(st.upY, hip.y);
        st.h = Math.max(st.h * 0.9, dy);
      }
      if (knee <= 110) {
        st.phase = "down";
        st.downY = hip.y;
        setHint("Вверх!");
      } else if (knee < 155) setHint("Приседай глубже");
    } else if (st.phase === "down") {
      st.downY = Math.max(st.downY, hip.y);
      if (knee >= 155) {
        if (st.downY - st.upY < 0.1 * st.h) setHint("Не считаю: присядь ниже");
        else if (now - st.lastRep < cfg.minRep)
          setHint("Не считаю: слишком быстро");
        else count(st, now);
        st.phase = "up";
        st.upY = hip.y;
      }
    }
  }

  function draw(ctx, lm, canvas) {
    ctx.strokeStyle = "#5ecbff";
    ctx.lineWidth = 3;
    [
      [11, 13],
      [13, 15],
      [12, 14],
      [14, 16],
      [11, 12],
      [11, 23],
      [12, 24],
      [23, 24],
      [23, 25],
      [25, 27],
      [24, 26],
      [26, 28],
    ].forEach(([a, b]) => {
      if ((lm[a].visibility ?? 0) < 0.4 || (lm[b].visibility ?? 0) < 0.4)
        return;
      ctx.beginPath();
      ctx.moveTo(lm[a].x * canvas.width, lm[a].y * canvas.height);
      ctx.lineTo(lm[b].x * canvas.width, lm[b].y * canvas.height);
      ctx.stroke();
    });
  }

  async function finish(st, token) {
    run.current.stop();
    setPhase("sending");
    setHint("Проверяю…");
    try {
      const r = await fetch(verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "finish",
          token,
          reps: st.reps,
          repTimes: st.times,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.ok)
        throw new Error(data.error || "Сервер не принял результат");
      if (!alive.current) return;
      setPhase("done");
      setHint("ВЫПОЛНЕНО!");
      onVerified?.({ reps: target });
    } catch (e) {
      if (alive.current) {
        setPhase("error");
        setHint(e.message);
      }
    }
  }

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
  return (
    <div style={{ color: "#e6f1ff", fontFamily: "inherit" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
          letterSpacing: 2,
          fontSize: 13,
        }}
      >
        <b>
          {cfg.title}: {reps} / {target}
        </b>
      </div>
      <div
        style={{
          background: "#000",
          border: "1px solid #5ecbff55",
          overflow: "hidden",
          minHeight: 60,
        }}
      >
        <video ref={videoRef} playsInline muted style={{ display: "none" }} />
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            display:
              phase === "active" || phase === "sending" ? "block" : "none",
          }}
        />
      </div>
      <p
        style={{
          minHeight: 22,
          fontSize: 12,
          color: phase === "error" ? "#fda4af" : "#8fb6e6",
        }}
      >
        {hint}
      </p>
      {phase === "active" && (
        <p style={{ fontSize: 10, color: "#5f86b3", letterSpacing: 1 }}>
          {dbg}
        </p>
      )}
      {(phase === "idle" || phase === "error") && (
        <>
          {phase === "idle" && (
            <p style={{ fontSize: 12, color: "#8fb6e6" }}>
              {base > 0 ? `Продолжаем с ${base}. ` : ""}
              {cfg.tip}
            </p>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button style={btn} onClick={start}>
              {base > 0 ? "[ ПРОДОЛЖИТЬ ]" : "[ НАЧАТЬ ]"}
            </button>
            <button
              style={{ ...btn, opacity: 0.8 }}
              onClick={() =>
                setFacing((f) => (f === "user" ? "environment" : "user"))
              }
            >
              КАМЕРА: {facing === "user" ? "ФРОНТ" : "ОСНОВНАЯ"}
            </button>
            {onCancel && (
              <button style={{ ...btn, opacity: 0.8 }} onClick={onCancel}>
                ЗАКРЫТЬ
              </button>
            )}
          </div>
        </>
      )}
      {phase === "loading" && (
        <p style={{ fontSize: 12 }}>Загружаю модель и камеру…</p>
      )}
    </div>
  );
}
