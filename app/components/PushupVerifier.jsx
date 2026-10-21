"use client";
import { useEffect, useRef, useState } from "react";

const WASM =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

// Индексы точек MediaPipe Pose: плечо, локоть, запястье, бедро, лодыжка
const SIDES = { left: [11, 13, 15, 23, 27], right: [12, 14, 16, 24, 28] };
const MIN_REP_MS = 700; // быстрее одного повтора за 0.7с не засчитываем

const angle = (a, b, c) => {
  const v1 = { x: a.x - b.x, y: a.y - b.y },
    v2 = { x: c.x - b.x, y: c.y - b.y };
  const m = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
  if (!m) return 180;
  return (
    (Math.acos(Math.max(-1, Math.min(1, (v1.x * v2.x + v1.y * v2.y) / m))) *
      180) /
    Math.PI
  );
};

export default function PushupVerifier({
  target = 10,
  taskId = null,
  verifyUrl = "/api/pushups/verify",
  onVerified,
  onCancel,
}) {
  const videoRef = useRef(null),
    canvasRef = useRef(null);
  const run = useRef({ stop: () => {} });
  const [phase, setPhase] = useState("idle"); // idle | loading | active | sending | done | error
  const [reps, setReps] = useState(0);
  const [hint, setHint] = useState("");
  const [facing, setFacing] = useState("user");

  useEffect(() => () => run.current.stop(), []);

  async function start() {
    setPhase("loading");
    setReps(0);
    setHint("");
    try {
      const r0 = await fetch(verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", target, taskId }),
      });
      if (!r0.ok) throw new Error("Сервер не выдал токен");
      const { token } = await r0.json();

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
        lastRep: 0,
        reps: 0,
        times: [],
        t0: performance.now(),
        last: -1,
        raf: 0,
        dead: false,
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
      setHint("Встань в упор лёжа боком к камере, чтобы было видно всё тело");

      const loop = () => {
        if (st.dead) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (video.currentTime !== st.last) {
          st.last = video.currentTime;
          const now = performance.now();
          const lm = pose.detectForVideo(video, now).landmarks[0];
          if (lm) analyse(lm, now, st);
          else {
            st.phase = null;
            setHint("Тебя не видно, отойди чуть дальше");
          }
          if (lm) draw(ctx, lm, canvas);
          if (st.reps >= target) {
            finish(st, token);
            return;
          }
        }
        st.raf = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) {
      run.current.stop();
      setPhase("error");
      setHint(e.message || "Ошибка");
    }
  }

  function analyse(lm, now, st) {
    const vis = (k) =>
      SIDES[k].reduce((s, i) => s + (lm[i].visibility ?? 0), 0) / 5;
    const side = vis("left") >= vis("right") ? "left" : "right";
    if (vis(side) < 0.5) {
      st.phase = null;
      setHint("Встань боком, чтобы было видно плечо, локоть, бедро и ногу");
      return;
    }
    const [sh, el, wr, hip, an] = SIDES[side].map((i) => lm[i]);

    const dx = Math.abs(sh.x - an.x),
      dy = Math.abs(sh.y - an.y);
    const horizontal = dx > 0.3 && dy / dx < 0.6;
    const handsOnFloor = wr.y > sh.y - 0.02;
    if (!horizontal || !handsOnFloor) {
      st.phase = null;
      setHint("Прими упор лёжа боком к камере");
      return;
    }

    const elbow = angle(sh, el, wr);
    const body = angle(sh, hip, an);
    const bodyLen = Math.hypot(sh.x - an.x, sh.y - an.y);

    if (st.phase === null && elbow >= 150) {
      st.phase = "up";
      st.upY = sh.y;
    }
    if (st.phase === "up") {
      if (elbow >= 150) st.upY = Math.min(st.upY, sh.y);
      if (elbow <= 100) {
        st.phase = "down";
        st.downY = sh.y;
        st.minBody = body;
        setHint("Вверх!");
      }
    } else if (st.phase === "down") {
      st.downY = Math.max(st.downY, sh.y);
      st.minBody = Math.min(st.minBody, body);
      if (elbow >= 150) {
        const drop = st.downY - st.upY;
        if (st.minBody < 145)
          setHint("Не считаю: держи корпус прямой, таз не провисает");
        else if (drop < 0.05 * bodyLen) setHint("Не считаю: опустись ниже");
        else if (now - st.lastRep < MIN_REP_MS)
          setHint("Не считаю: слишком быстро");
        else {
          st.reps++;
          st.lastRep = now;
          st.times.push(Math.round(now - st.t0));
          setReps(st.reps);
          setHint("Засчитано ✔");
        }
        st.phase = "up";
        st.upY = sh.y;
      }
    }
  }

  function draw(ctx, lm, canvas) {
    ctx.strokeStyle = "#22d3ee";
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
      const data = await r.json();
      if (!r.ok || !data.ok)
        throw new Error(data.error || "Сервер не принял результат");
      setPhase("done");
      setHint("Задание выполнено!");
      onVerified?.({ reps: st.reps, ...data });
    } catch (e) {
      setPhase("error");
      setHint(e.message);
    }
  }

  const box = {
    background: "#020817",
    color: "#e2e8f0",
    border: "1px solid #22d3ee55",
    borderRadius: 12,
    padding: 16,
    maxWidth: 640,
    fontFamily: "monospace",
  };
  const btn = {
    background: "#22d3ee",
    color: "#020817",
    border: 0,
    borderRadius: 8,
    padding: "10px 16px",
    fontWeight: 700,
    cursor: "pointer",
  };
  return (
    <div style={box}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <b>
          ОТЖИМАНИЯ: {reps} / {target}
        </b>
        {onCancel && (
          <button
            onClick={() => {
              run.current.stop();
              onCancel();
            }}
            style={{ ...btn, background: "#334155", color: "#fff" }}
          >
            Закрыть
          </button>
        )}
      </div>
      <div
        style={{
          position: "relative",
          background: "#000",
          borderRadius: 8,
          overflow: "hidden",
          minHeight: 120,
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
          minHeight: 24,
          color: phase === "error" ? "#f87171" : "#94a3b8",
        }}
      >
        {hint}
      </p>
      {(phase === "idle" || phase === "error") && (
        <>
          <p style={{ fontSize: 12, color: "#94a3b8" }}>
            Поставь телефон или камеру сбоку на расстоянии 1,5–2 м так, чтобы
            целиком было видно тело.
          </p>
          <button style={btn} onClick={start}>
            Начать
          </button>{" "}
          <button
            style={{ ...btn, background: "#334155", color: "#fff" }}
            onClick={() =>
              setFacing((f) => (f === "user" ? "environment" : "user"))
            }
          >
            Камера: {facing === "user" ? "фронтальная" : "основная"}
          </button>
        </>
      )}
      {phase === "loading" && <p>Загружаю модель и камеру…</p>}
    </div>
  );
}
