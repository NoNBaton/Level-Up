"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Check,
  Trash2,
  Flame,
  Terminal,
  Cpu,
  Award,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Power,
  Sparkles,
  Zap,
  Crown,
  Trophy,
  Star,
  User,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import SystemWindow, {
  SystemFrame,
  SysSubtitle,
  SysRow,
  SysInput,
  SysButton,
  IconBox,
  MidnightTimer,
  TONES,
} from "./components/SystemWindow";

const SOUNDS = {
  openModal: "/sounds/open.mp3",
  closeModal: "/sounds/close.mp3",
  addMission: "/sounds/add.mp3",
  completeTask: "/sounds/complete.mp3",
  achievement: "/sounds/achievement.mp3",
  epicAchievement: "/sounds/epic_achievement.mp3",
};

const xpPerLevel = 100;
const xpPerTask = 25;

const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const dateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

const getTodayString = () => dateStr(new Date());

const getYesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateStr(d);
};

const generate7DaysHistory = (existingHistory = [], currentTasks = []) => {
  const result = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = dateStr(d);
    const label = i === 0 ? "Сегодня" : i === 1 ? "Вчера" : `${i}д назад`;

    if (i === 0) {
      result.push({
        date: ds,
        label,
        completed: currentTasks.filter((t) => t.completed).length,
        total: currentTasks.length,
        tasksSnapshot: currentTasks.map((t) => ({
          text: t.text,
          completed: t.completed,
        })),
        dayOffset: i,
      });
    } else {
      const saved = existingHistory.find((h) => h.date === ds);
      result.push({
        date: ds,
        label,
        completed: saved ? saved.completed : 0,
        total: saved ? saved.total : 0,
        tasksSnapshot: saved ? saved.tasksSnapshot || [] : [],
        dayOffset: i,
      });
    }
  }
  return result;
};

// Прогресс из старой версии (localStorage) — для одноразового переноса на сервер
const readLegacyLocal = (authId) => {
  try {
    const p = `sci_fi_${authId}_`;
    const level = localStorage.getItem(`${p}level`);
    if (level === null) return null;
    return {
      level: Number(level) || 1,
      xp: Number(localStorage.getItem(`${p}xp`)) || 0,
      streak: Number(localStorage.getItem(`${p}streak`)) || 0,
      achievements: safeParse(
        localStorage.getItem(`${p}unlocked_achievements`),
        [],
      ),
      progress: {
        date: localStorage.getItem(`${p}date`) || "",
        lastCompletedDate: localStorage.getItem(`${p}last_completed`) || "",
        tasks: safeParse(localStorage.getItem(`${p}tasks`), []),
        history: safeParse(localStorage.getItem(`${p}history`), []),
      },
    };
  } catch {
    return null;
  }
};

const getHunterRank = (lvl) => {
  if (lvl >= 25)
    return {
      rank: "S-РАНГ",
      color:
        "text-fuchsia-400 border-fuchsia-400 bg-fuchsia-950/40 shadow-[0_0_15px_rgba(217,70,239,0.5)]",
    };
  if (lvl >= 20)
    return {
      rank: "A-РАНГ",
      color:
        "text-amber-300 border-amber-400 bg-amber-950/40 shadow-[0_0_15px_rgba(251,191,36,0.4)]",
    };
  if (lvl >= 15)
    return {
      rank: "B-РАНГ",
      color: "text-purple-300 border-purple-400 bg-purple-950/40",
    };
  if (lvl >= 10)
    return {
      rank: "C-РАНГ",
      color: "text-blue-300 border-blue-400 bg-blue-950/40",
    };
  if (lvl >= 5)
    return {
      rank: "D-РАНГ",
      color: "text-cyan-300 border-cyan-400 bg-cyan-950/40",
    };
  return {
    rank: "E-РАНГ",
    color: "text-slate-300 border-slate-500 bg-slate-900/60",
  };
};

const ACHIEVEMENTS_LIST = {
  FIRST_TASK: {
    id: "first_task",
    title: "ПЕРВЫЙ ШАГ",
    description: "Выполнена первая миссия!",
    icon: <Zap className="w-6 h-6 text-cyan-300" />,
    rarity: "common",
    animationType: "zap",
  },
  STREAK_3: {
    id: "streak_3",
    title: "НАБИРАЯ ХОД",
    description: "3 дня продуктивности подряд!",
    icon: <Flame className="w-6 h-6 text-amber-300" />,
    rarity: "epic",
    animationType: "streak_pulse",
  },
  STREAK_7: {
    id: "streak_7",
    title: "КИБЕР-ВОИН",
    description: "Недельный стрик удерживается!",
    icon: <ShieldCheck className="w-6 h-6 text-amber-300" />,
    rarity: "epic",
    animationType: "streak_pulse",
  },
  STREAK_30: {
    id: "streak_30",
    title: "ЛЕГЕНДА СИСТЕМЫ",
    description: "30 дней беспрерывного прогресса!",
    icon: <Crown className="w-6 h-6 text-fuchsia-300" />,
    rarity: "legendary",
    animationType: "legendary_storm",
  },
  LEVEL_5: {
    id: "level_5",
    title: "ВЕТЕРАН КОДА",
    description: "Достигнут D-ранг (5 уровень)!",
    icon: <Star className="w-6 h-6 text-amber-300" />,
    rarity: "epic",
    animationType: "level_spin",
  },
  LEVEL_25: {
    id: "level_25",
    title: "ПОВЕЛИТЕЛЬ СИСТЕМЫ",
    description: "Достигнут S-ранг (25 уровень)! Пик силы!",
    icon: <Trophy className="w-6 h-6 text-fuchsia-200" />,
    rarity: "legendary",
    animationType: "legendary_storm",
  },
  DAY_COMPLETE: {
    id: "day_complete",
    title: "ДЕНЬ ЗАКРЫТ",
    description: "Все задачи на сегодня выполнены на 100%!",
    icon: <CheckCircle2 className="w-6 h-6 text-cyan-300" />,
    rarity: "common",
    animationType: "matrix_stamp",
  },
};

const ACHIEVEMENT_ANIMATIONS = {
  zap: {
    initial: { scale: 0.2, rotate: -45, opacity: 0 },
    animate: { scale: 1, rotate: 0, opacity: 1 },
    transition: { type: "spring", stiffness: 500, damping: 15 },
  },
  streak_pulse: {
    initial: { y: -50, scale: 0.8, opacity: 0 },
    animate: { y: 0, scale: 1, opacity: 1, x: [0, -6, 6, -4, 4, 0] },
    transition: {
      y: { type: "spring", stiffness: 350, damping: 25 },
      x: { duration: 0.4, delay: 0.15 },
    },
  },
  level_spin: {
    initial: { rotateY: 180, scale: 0.5, opacity: 0 },
    animate: { rotateY: 0, scale: 1, opacity: 1 },
    transition: { type: "spring", stiffness: 280, damping: 20 },
  },
  matrix_stamp: {
    initial: { scale: 2.2, opacity: 0, filter: "blur(10px)" },
    animate: { scale: 1, opacity: 1, filter: "blur(0px)" },
    transition: { type: "tween", duration: 0.35, ease: "easeOut" },
  },
  legendary_storm: {
    initial: { scale: 0.3, opacity: 0, y: -40 },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      boxShadow: [
        "0 0 10px rgba(217,70,239,0.2)",
        "0 0 60px rgba(217,70,239,0.9)",
        "0 0 40px rgba(217,70,239,0.6)",
      ],
    },
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

export default function HomePage() {
  // Профиль: { name, authId }
  const [profile, setProfile] = useState(null);

  // Форма входа / регистрации
  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authConfirm, setAuthConfirm] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Игровое состояние
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastCompletedDate, setLastCompletedDate] = useState("");
  const [completedTotal, setCompletedTotal] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");

  const [isLoaded, setIsLoaded] = useState(false);
  const [syncState, setSyncState] = useState("idle"); // idle | saving | saved | error

  const loadedFor = useRef(null);
  const unlockedRef = useRef([]);
  const saveTimer = useRef(null);
  const payloadRef = useRef(null);
  const dirtyRef = useRef(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDayFinishedModalOpen, setIsDayFinishedModalOpen] = useState(false);
  const [selectedDayHistory, setSelectedDayHistory] = useState(null);
  const [unlockedAchievementNotification, setUnlockedAchievementNotification] =
    useState(null);

  const playSound = (soundUrl) => {
    try {
      if (typeof window !== "undefined") {
        const audio = new Audio(soundUrl);
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }
    } catch {
      // ignore
    }
  };

  // ---------- Загрузка / сброс состояния ----------

  const hydrateFromPlayer = (player) => {
    let src = player;
    const hasServerProgress =
      player.progress &&
      typeof player.progress === "object" &&
      typeof player.progress.date === "string";

    // Новый аккаунт без прогресса на сервере: переносим старый из браузера
    if (
      !hasServerProgress &&
      player.level === 1 &&
      player.xp === 0 &&
      player.streak === 0
    ) {
      const legacy = readLegacyLocal(player.authId);
      if (legacy) src = { ...player, ...legacy };
    }

    const today = getTodayString();
    const prog =
      src.progress && typeof src.progress === "object" ? src.progress : {};

    let loadedTasks = Array.isArray(prog.tasks) ? prog.tasks : [];
    let loadedHistory = Array.isArray(prog.history) ? prog.history : [];
    const savedDate =
      typeof prog.date === "string" && prog.date ? prog.date : today;

    if (savedDate !== today) {
      loadedHistory = loadedHistory.filter((h) => h.date !== savedDate);
      loadedHistory.push({
        date: savedDate,
        completed: loadedTasks.filter((t) => t.completed).length,
        total: loadedTasks.length,
        tasksSnapshot: loadedTasks.map((t) => ({
          text: t.text,
          completed: t.completed,
        })),
      });
      loadedTasks = loadedTasks.map((t) => ({ ...t, completed: false }));
    }

    const last =
      typeof prog.lastCompletedDate === "string" ? prog.lastCompletedDate : "";
    const streakAlive =
      !last || last === today || last === getYesterdayString();
    const achievements = Array.isArray(src.achievements)
      ? src.achievements
      : [];

    // Общее число выполненных миссий: берём сохранённое, иначе считаем по истории
    const total = Number.isFinite(prog.completedTotal)
      ? Math.max(0, Math.floor(prog.completedTotal))
      : loadedHistory
          .filter((h) => h.date !== today)
          .reduce((sum, h) => sum + (Number(h.completed) || 0), 0) +
        loadedTasks.filter((t) => t.completed).length;

    unlockedRef.current = achievements;
    setLevel(Number(src.level) || 1);
    setXp(Number(src.xp) || 0);
    setStreak(streakAlive ? Number(src.streak) || 0 : 0);
    setLastCompletedDate(last);
    setCompletedTotal(total);
    setTasks(loadedTasks);
    setUnlockedAchievements(achievements);
    setHistory(generate7DaysHistory(loadedHistory, loadedTasks));
  };

  const resetGameState = () => {
    loadedFor.current = null;
    dirtyRef.current = false;
    payloadRef.current = null;
    clearTimeout(saveTimer.current);
    unlockedRef.current = [];
    setLevel(1);
    setXp(0);
    setStreak(0);
    setLastCompletedDate("");
    setCompletedTotal(0);
    setTasks([]);
    setHistory(generate7DaysHistory([], []));
    setUnlockedAchievements([]);
    setSyncState("idle");
  };

  const forceLogout = () => {
    resetGameState();
    setProfile(null);
    setAuthMode("login");
    setAuthError("СЕССИЯ ИСТЕКЛА. ВОЙДИТЕ СНОВА");
  };

  // Первая загрузка: спрашиваем сервер, кто вошёл
  useEffect(() => {
    let cancelled = false;
    try {
      localStorage.removeItem("sci_fi_player_profile");
    } catch {
      // ignore
    }

    (async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.player) {
            loadedFor.current = data.player.authId;
            setProfile({
              name: data.player.nickname,
              authId: data.player.authId,
            });
            hydrateFromPlayer(data.player);
          }
        }
      } catch {
        // нет связи — покажем окно входа
      }
      if (!cancelled) {
        setHistory((h) => (h.length ? h : generate7DaysHistory([], [])));
        setIsLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Сохранение на сервер ----------

  const buildPayload = () => ({
    level,
    xp,
    streak,
    achievements: unlockedAchievements,
    progress: {
      date: getTodayString(),
      lastCompletedDate,
      completedTotal,
      tasks,
      history: history.map(({ date, completed, total, tasksSnapshot }) => ({
        date,
        completed,
        total,
        tasksSnapshot,
      })),
    },
  });

  const sendProgress = async (payload, keepalive = false) => {
    dirtyRef.current = false;
    setSyncState("saving");
    try {
      const res = await fetch("/api/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive,
      });
      if (res.status === 401) {
        forceLogout();
        return;
      }
      if (res.ok) {
        setSyncState("saved");
      } else {
        dirtyRef.current = true;
        setSyncState("error");
      }
    } catch {
      dirtyRef.current = true;
      setSyncState("error");
    }
  };

  // Автосохранение с задержкой
  useEffect(() => {
    if (!isLoaded || !profile || loadedFor.current !== profile.authId) return;

    const payload = buildPayload();
    payloadRef.current = payload;
    dirtyRef.current = true;

    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => sendProgress(payload), 800);
    return () => clearTimeout(saveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    level,
    xp,
    streak,
    lastCompletedDate,
    completedTotal,
    tasks,
    history,
    unlockedAchievements,
    profile,
    isLoaded,
  ]);

  // Досохраняем, если вкладку закрывают или сворачивают
  useEffect(() => {
    const flush = () => {
      if (dirtyRef.current && payloadRef.current) {
        clearTimeout(saveTimer.current);
        sendProgress(payloadRef.current, true);
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Вход / регистрация / выход ----------

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (authLoading) return;

    const name = authName.trim();
    if (name.length < 3) {
      setAuthError("НИКНЕЙМ — МИНИМУМ 3 СИМВОЛА");
      return;
    }
    if (authPass.length < 6) {
      setAuthError("КОД ДОСТУПА — МИНИМУМ 6 СИМВОЛОВ");
      return;
    }
    if (authMode === "register" && authPass !== authConfirm) {
      setAuthError("КОДЫ ДОСТУПА НЕ СОВПАДАЮТ");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      const res = await fetch(
        authMode === "register" ? "/api/register" : "/api/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nickname: name, password: authPass }),
        },
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setAuthError(String(data.error || "ОШИБКА СИСТЕМЫ"));
        return;
      }

      const player = data.player;
      loadedFor.current = player.authId;
      setProfile({ name: player.nickname, authId: player.authId });
      hydrateFromPlayer(player);

      setAuthName("");
      setAuthPass("");
      setAuthConfirm("");
      setAuthMode("login");
      playSound(SOUNDS.openModal);
    } catch {
      setAuthError("НЕТ СВЯЗИ С СЕРВЕРОМ");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    playSound(SOUNDS.closeModal);
    clearTimeout(saveTimer.current);
    if (dirtyRef.current && payloadRef.current) {
      await sendProgress(payloadRef.current);
    }
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {
      // ignore
    }
    resetGameState();
    setProfile(null);
    setAuthMode("login");
    setAuthName("");
    setAuthPass("");
    setAuthConfirm("");
    setAuthError("");
  };

  // ---------- Игровая логика ----------

  const triggerAchievement = (achievementKey) => {
    const ach = ACHIEVEMENTS_LIST[achievementKey];
    if (!ach || unlockedRef.current.includes(ach.id)) return;

    unlockedRef.current = [...unlockedRef.current, ach.id];
    setUnlockedAchievements(unlockedRef.current);

    if (ach.rarity === "legendary" || ach.rarity === "epic") {
      playSound(SOUNDS.epicAchievement);
    } else {
      playSound(SOUNDS.achievement);
    }

    setUnlockedAchievementNotification(ach);
    setTimeout(() => setUnlockedAchievementNotification(null), 5500);
  };

  // Меняет XP и уровень одним пересчётом (delta может быть отрицательной)
  const changeXp = (delta) => {
    let newXp = xp + delta;
    let newLevel = level;

    while (newXp >= xpPerLevel) {
      newXp -= xpPerLevel;
      newLevel += 1;
    }
    while (newXp < 0) {
      if (newLevel > 1) {
        newLevel -= 1;
        newXp += xpPerLevel;
      } else {
        newXp = 0;
      }
    }

    setXp(newXp);
    if (newLevel !== level) {
      setLevel(newLevel);
      if (level < 5 && newLevel >= 5) triggerAchievement("LEVEL_5");
      if (level < 25 && newLevel >= 25) triggerAchievement("LEVEL_25");
    }
  };

  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const dailyProgress =
    tasks.length > 0
      ? Math.round((completedTasksCount / tasks.length) * 100)
      : 0;
  const hunterRankInfo = getHunterRank(level);

  const handleOpenModal = () => {
    playSound(SOUNDS.openModal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    playSound(SOUNDS.closeModal);
    setIsModalOpen(false);
  };

  const closeHistory = () => {
    playSound(SOUNDS.closeModal);
    setSelectedDayHistory(null);
  };

  const handleAddMission = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    playSound(SOUNDS.addMission);
    setTasks((prev) => [
      ...prev,
      { id: Date.now().toString(), text: newTaskText.trim(), completed: false },
    ]);
    setNewTaskText("");
    setIsModalOpen(false);
  };

  const bumpStreak = () => {
    const today = getTodayString();
    if (lastCompletedDate === today) return;
    const newStreak = streak + 1;
    setStreak(newStreak);
    setLastCompletedDate(today);
    if (newStreak === 3) triggerAchievement("STREAK_3");
    else if (newStreak === 7) triggerAchievement("STREAK_7");
    else if (newStreak === 30) triggerAchievement("STREAK_30");
  };

  const toggleTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const isNowCompleted = !task.completed;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: isNowCompleted } : t)),
    );

    if (isNowCompleted) {
      playSound(SOUNDS.completeTask);
      changeXp(xpPerTask);
      setCompletedTotal((c) => c + 1);
      triggerAchievement("FIRST_TASK");
      bumpStreak();
    } else {
      playSound(SOUNDS.closeModal);
      changeXp(-xpPerTask);
      setCompletedTotal((c) => Math.max(0, c - 1));
    }
  };

  const handleFinishDay = () => {
    const uncompleted = tasks.filter((t) => !t.completed);
    if (uncompleted.length > 0) {
      playSound(SOUNDS.completeTask);
      changeXp(uncompleted.length * xpPerTask);
      setCompletedTotal((c) => c + uncompleted.length);
    } else {
      playSound(SOUNDS.openModal);
    }
    setTasks((prev) => prev.map((t) => ({ ...t, completed: true })));
    bumpStreak();
    setIsDayFinishedModalOpen(true);
    triggerAchievement("DAY_COMPLETE");
  };

  const deleteTask = (id) => {
    playSound(SOUNDS.closeModal);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // ---------- Отрисовка ----------

  if (!isLoaded) {
    return (
      <div className="min-h-[100dvh] bg-black text-cyan-400 font-mono flex justify-center items-center p-4">
        <div className="flex items-center gap-2 border border-cyan-500/50 p-3 rounded-xl bg-cyan-950/20 backdrop-blur">
          <Cpu className="w-5 h-5 animate-spin text-cyan-400" />
          <span className="text-xs tracking-[0.2em] uppercase animate-pulse">
            СИНХРОНИЗАЦИЯ СИСТЕМЫ...
          </span>
        </div>
      </div>
    );
  }

  // Уведомление о достижении в стиле системного окна
  const renderAchievementCard = (ach) => {
    const animConfig =
      ACHIEVEMENT_ANIMATIONS[ach.animationType] || ACHIEVEMENT_ANIMATIONS.zap;
    const tone =
      ach.rarity === "legendary"
        ? "purple"
        : ach.rarity === "epic"
          ? "amber"
          : "blue";
    const t = TONES[tone];

    return (
      <motion.div
        initial={animConfig.initial}
        animate={animConfig.animate}
        exit={{ opacity: 0, scale: 0.7, y: -20 }}
        transition={animConfig.transition}
      >
        <SystemFrame tone={tone} className="p-3 flex items-center gap-3">
          <IconBox tone={tone}>
            <Sparkles className="w-5 h-5" />
          </IconBox>
          <div className="flex-1 min-w-0 relative">
            <div
              className="text-[9px] font-black tracking-[0.25em] uppercase"
              style={{ color: t.main }}
            >
              УВЕДОМЛЕНИЕ // ДОСТИЖЕНИЕ
            </div>
            <h3
              className="text-sm font-black text-white tracking-wide truncate"
              style={{ textShadow: `0 0 8px ${t.main}` }}
            >
              {ach.title}
            </h3>
            <p className="text-[10px] text-slate-300 truncate">
              {ach.description}
            </p>
          </div>
        </SystemFrame>
      </motion.div>
    );
  };

  const day = selectedDayHistory;

  return (
    <div className="min-h-[100dvh] bg-black text-cyan-400 font-mono p-3 sm:p-6 flex flex-col justify-between sm:justify-center items-center select-none relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#3b9dff_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>

      {/* Окно входа / регистрации */}
      <SystemWindow
        open={!profile}
        tone="blue"
        title={authMode === "login" ? "ВХОД В СИСТЕМУ" : "РЕГИСТРАЦИЯ"}
        maxWidth="max-w-md"
        z="z-[100]"
      >
        <form onSubmit={handleAuthSubmit} className="space-y-3">
          <SysSubtitle>
            {authMode === "login"
              ? "ИДЕНТИФИКАЦИЯ ОПЕРАТОРА"
              : "НОВЫЙ ОПЕРАТОР"}
          </SysSubtitle>
          <div className="text-[11px] text-[#7fa8d6] text-center tracking-wider pb-1">
            {authMode === "login"
              ? "Введите позывной и код доступа."
              : "Создайте позывной и код доступа."}
          </div>

          <SysInput
            type="text"
            value={authName}
            onChange={(e) => {
              setAuthName(e.target.value);
              if (authError) setAuthError("");
            }}
            placeholder="Позывной (никнейм)..."
            autoComplete="username"
          />
          <SysInput
            type="password"
            value={authPass}
            onChange={(e) => {
              setAuthPass(e.target.value);
              if (authError) setAuthError("");
            }}
            placeholder="Код доступа (пароль)..."
            autoComplete={
              authMode === "login" ? "current-password" : "new-password"
            }
          />
          {authMode === "register" && (
            <SysInput
              type="password"
              value={authConfirm}
              onChange={(e) => {
                setAuthConfirm(e.target.value);
                if (authError) setAuthError("");
              }}
              placeholder="Повторите код доступа..."
              autoComplete="new-password"
            />
          )}

          {authError && (
            <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/50 p-2.5 tracking-wider">
              {authError}
            </div>
          )}

          <SysButton type="submit" disabled={authLoading} className="w-full">
            {authLoading
              ? "ОБРАБОТКА..."
              : authMode === "login"
                ? "[ ПОДТВЕРДИТЬ ВХОД ]"
                : "[ СОЗДАТЬ АККАУНТ ]"}
          </SysButton>

          <button
            type="button"
            onClick={() => {
              setAuthMode(authMode === "login" ? "register" : "login");
              setAuthError("");
              setAuthConfirm("");
            }}
            className="block mx-auto pt-1 text-[11px] text-[#7fa8d6] underline hover:text-white cursor-pointer"
          >
            {authMode === "login"
              ? "// НЕТ АККАУНТА? ЗАРЕГИСТРИРОВАТЬСЯ"
              : "// УЖЕ ЕСТЬ АККАУНТ? ВОЙТИ"}
          </button>
        </form>
      </SystemWindow>

      {/* Уведомление о достижении */}
      <AnimatePresence mode="wait">
        {unlockedAchievementNotification && (
          <div className="fixed top-6 z-[90] px-4 w-full max-w-sm sm:max-w-md pointer-events-none">
            {renderAchievementCard(unlockedAchievementNotification)}
          </div>
        )}
      </AnimatePresence>

      <SystemFrame
        tone="blue"
        className="w-full max-w-md p-4 sm:p-6 relative z-10 overflow-hidden my-auto flex flex-col justify-between"
      >
        {" "}
        <div className="relative z-10 w-full max-w-md my-auto py-8">
          <div className="sys-float-soft">
            <div className="sys-flicker">
              <div className="sys-glow">
                <SystemFrame
                  tone="blue"
                  glass
                  outer
                  className="p-4 sm:p-6 flex flex-col"
                >
                  {/* Шапка */}
                  <header className="relative flex items-stretch gap-3 pt-2 mb-3">
                    <IconBox tone="blue">!</IconBox>
                    <div className="flex-1 min-w-0 border border-[#d6e8ff]/40 flex items-center justify-center px-2 py-2">
                      <h1
                        className="sys-title uppercase tracking-[0.08em] text-base sm:text-lg text-white truncate"
                        style={{
                          textShadow:
                            "0 0 5px #4fa3e0, 0 0 12px rgba(79,163,224,0.55)",
                        }}
                      >
                        LEVEL_UP // OS
                      </h1>
                    </div>
                    <div
                      className="shrink-0 flex items-center gap-1.5 border px-2.5 text-xs font-bold"
                      style={{
                        borderColor:
                          streak > 0
                            ? "rgba(59,157,255,0.8)"
                            : "rgba(214,232,255,0.25)",
                        color: streak > 0 ? "#e6f1ff" : "#64748b",
                        boxShadow:
                          streak > 0 ? "0 0 12px rgba(59,157,255,0.5)" : "none",
                      }}
                    >
                      <span
                        title={
                          syncState === "error"
                            ? "Ошибка синхронизации"
                            : syncState === "saving"
                              ? "Сохранение..."
                              : "Синхронизировано"
                        }
                        className={`w-1.5 h-1.5 rounded-full ${
                          syncState === "error"
                            ? "bg-red-500"
                            : syncState === "saving"
                              ? "bg-amber-400 animate-pulse"
                              : "bg-emerald-400"
                        }`}
                      />
                      <Flame
                        className={`w-4 h-4 ${streak > 0 ? "text-[#9fd0ff] animate-pulse" : "text-slate-600"}`}
                      />
                      <span className="tracking-widest">{streak}D</span>
                    </div>
                  </header>

                  {/* Профиль и выход */}
                  <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-[#d6e8ff]/20 text-[10px] tracking-widest uppercase">
                    <Link
                      href="/profile"
                      className="flex items-center gap-1 min-w-0 text-[#9fd0ff] hover:text-white transition"
                    >
                      <User className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {profile
                          ? `${profile.name} [${profile.authId}]`
                          : "ОПЕРАТОР"}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      title="Выйти из системы"
                      className="shrink-0 flex items-center gap-1 text-rose-300/80 hover:text-rose-300 transition cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" />
                      ВЫХОД
                    </button>
                  </div>

                  {/* Статус развития */}
                  <section className="mb-5">
                    <SysSubtitle>СТАТУС РАЗВИТИЯ</SysSubtitle>
                    <div className="mt-3 space-y-1.5">
                      <SysRow label="Уровень" value={`LVL ${level}`} done />
                      <SysRow label="Ранг" value={hunterRankInfo.rank} done />
                      <SysRow label="Опыт" value={`${xp}/${xpPerLevel} XP`} />
                    </div>
                    <div className="mt-3 h-2.5 border border-[#d6e8ff]/40 bg-[#020817]/60 p-0.5">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${(xp / xpPerLevel) * 100}%`,
                          background:
                            "linear-gradient(90deg, #3b9dff, #dff0ff)",
                          boxShadow: "0 0 10px #3b9dff",
                        }}
                      />
                    </div>
                  </section>

                  {/* Ежедневный прогресс */}
                  <section className="mb-5">
                    <SysRow
                      label="Ежедневный прогресс"
                      value={`${dailyProgress}%`}
                      done={dailyProgress === 100}
                    />
                    <div className="mt-2 h-2 border border-[#d6e8ff]/40 bg-[#020817]/60 p-0.5">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${dailyProgress}%`,
                          background:
                            dailyProgress === 100
                              ? "linear-gradient(90deg, #34d399, #d1fae5)"
                              : "linear-gradient(90deg, #3b9dff, #dff0ff)",
                          boxShadow:
                            dailyProgress === 100
                              ? "0 0 10px #34d399"
                              : "0 0 10px #3b9dff",
                        }}
                      />
                    </div>
                  </section>

                  {/* История активности */}
                  <section className="mb-5">
                    <SysSubtitle>ИСТОРИЯ АКТИВНОСТИ</SysSubtitle>
                    <div className="mt-3 grid grid-cols-7 gap-1.5 text-center">
                      {history.map((item) => {
                        const full =
                          item.total > 0 && item.completed === item.total;
                        const partial =
                          item.completed > 0 && item.completed < item.total;
                        return (
                          <button
                            key={item.date}
                            onClick={() => {
                              playSound(SOUNDS.openModal);
                              setSelectedDayHistory(item);
                            }}
                            className={`flex flex-col items-center justify-between p-1.5 border text-[9px] transition hover:scale-105 active:scale-95 cursor-pointer ${
                              item.dayOffset === 0
                                ? "border-[#3b9dff] bg-[#3b9dff]/15 shadow-[0_0_10px_rgba(59,157,255,0.4)]"
                                : "border-[#d6e8ff]/25 bg-[#020817]/50"
                            }`}
                          >
                            <span className="text-[#8fb6e6] text-[8px] truncate max-w-full mb-1">
                              {item.label}
                            </span>
                            <div
                              className={`w-5 h-5 flex items-center justify-center font-bold my-0.5 border ${
                                full
                                  ? "bg-emerald-400 text-slate-950 border-emerald-300"
                                  : partial
                                    ? "bg-[#3b9dff]/20 text-[#cfe6ff] border-[#3b9dff]/60"
                                    : "bg-slate-900 text-slate-600 border-slate-800"
                              }`}
                            >
                              {full ? (
                                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                              ) : (
                                <span>{item.completed}</span>
                              )}
                            </div>
                            <span className="text-[8px] text-[#5f86b3]">
                              {item.completed}/{item.total}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {/* Ссылки */}
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    <Link
                      href="/achievements"
                      className="sys-title col-span-2 flex items-center justify-between border border-[#3b9dff]/60 bg-[#3b9dff]/10 hover:bg-[#3b9dff] hover:text-[#020617] text-[#cfe6ff] py-2.5 px-4 text-xs tracking-[0.15em] uppercase transition"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        ДОСТИЖЕНИЯ
                      </span>
                      <span className="text-[10px] opacity-70">→</span>
                    </Link>
                    <Link
                      href="/profile"
                      className="sys-title flex items-center justify-center gap-2 border border-[#3b9dff]/60 bg-[#3b9dff]/10 hover:bg-[#3b9dff] hover:text-[#020617] text-[#cfe6ff] py-2.5 text-xs tracking-[0.15em] uppercase transition"
                    >
                      <User className="w-4 h-4" />
                      ПРОФИЛЬ
                    </Link>
                    <Link
                      href="/leaderboard"
                      className="sys-title flex items-center justify-center gap-2 border border-amber-400/60 bg-amber-400/10 hover:bg-amber-400 hover:text-slate-950 text-amber-200 py-2.5 text-xs tracking-[0.15em] uppercase transition"
                    >
                      <Trophy className="w-4 h-4" />
                      РЕЙТИНГ
                    </Link>
                  </div>

                  {/* Кнопки управления */}
                  <div className="grid grid-cols-1 gap-2 mb-5">
                    <SysButton
                      onClick={handleOpenModal}
                      className="w-full flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />[ ПОЛУЧИТЬ МИССИЮ ]
                      </span>
                      <span className="text-[10px] opacity-70">+25 XP</span>
                    </SysButton>
                    <SysButton
                      tone="green"
                      onClick={handleFinishDay}
                      className="w-full flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Power className="w-4 h-4" />[ ЗАКОНЧИТЬ НА СЕГОДНЯ ]
                      </span>
                      <span className="text-[10px] opacity-70">100%</span>
                    </SysButton>
                  </div>

                  {/* Список задач */}
                  <section>
                    <SysSubtitle>ЦЕЛИ</SysSubtitle>
                    <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
                      <AnimatePresence>
                        {tasks.length === 0 ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-5 border border-dashed border-[#3b9dff]/30 text-[#5f86b3] text-xs tracking-widest uppercase"
                          >
                            // НЕТ АКТИВНЫХ КВЕСТОВ
                          </motion.div>
                        ) : (
                          tasks.map((task) => (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex items-start gap-2"
                            >
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => toggleTask(task.id)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    toggleTask(task.id);
                                  }
                                }}
                                className={`flex-1 min-w-0 cursor-pointer ${task.completed ? "line-through opacity-70" : ""}`}
                              >
                                <SysRow
                                  label={task.text}
                                  value={task.completed ? "1/1" : "0/1"}
                                  done={task.completed}
                                />
                              </div>
                              <button
                                onClick={() => deleteTask(task.id)}
                                aria-label="Удалить миссию"
                                className="text-[#5f86b3] hover:text-rose-400 p-1 transition shrink-0 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </section>
                </SystemFrame>
              </div>
            </div>
          </div>
        </div>
      </SystemFrame>

      {/* Окно создания миссии */}
      <SystemWindow
        open={isModalOpen}
        tone="blue"
        title="НОВАЯ МИССИЯ"
        onClose={handleCloseModal}
      >
        <form onSubmit={handleAddMission} className="space-y-3">
          <SysSubtitle>УСЛОВИЕ МИССИИ</SysSubtitle>
          <SysInput
            type="text"
            autoFocus
            maxLength={120}
            placeholder="Введите условие миссии..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="text-center"
          />
          <SysRow label="Награда" value={`+${xpPerTask} XP`} done />
          <SysButton type="submit" className="w-full">
            [ ПРИНЯТЬ МИССИЮ ]
          </SysButton>
        </form>
      </SystemWindow>

      {/* Окно отчёта за день */}
      <SystemWindow
        open={!!day}
        tone="blue"
        title={day ? `ОТЧЁТ: ${day.label}` : ""}
        onClose={closeHistory}
      >
        {day && (
          <div>
            <SysSubtitle>{day.date}</SysSubtitle>
            <div className="mt-3 space-y-1.5 max-h-[40vh] overflow-y-auto pr-1">
              {day.tasksSnapshot && day.tasksSnapshot.length > 0 ? (
                day.tasksSnapshot.map((task, idx) => (
                  <SysRow
                    key={idx}
                    label={task.text}
                    value={task.completed ? "1/1" : "0/1"}
                    done={task.completed}
                  />
                ))
              ) : (
                <div className="text-center py-5 text-[#6b8fb8] text-xs tracking-widest">
                  // НЕТ ЗАПИСЕЙ О МИССИЯХ
                </div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-[#3b9dff]/30">
              <SysRow
                label="Выполнено"
                value={`${day.completed}/${day.total}`}
                done={day.total > 0 && day.completed === day.total}
              />
            </div>
            <SysButton className="w-full mt-4" onClick={closeHistory}>
              ЗАКРЫТЬ
            </SysButton>
          </div>
        )}
      </SystemWindow>

      {/* Окно «День завершён» */}
      <SystemWindow
        open={isDayFinishedModalOpen}
        tone="green"
        title="ДЕНЬ ЗАВЕРШЁН"
        onClose={() => setIsDayFinishedModalOpen(false)}
      >
        <SysSubtitle>ЦЕЛИ</SysSubtitle>
        <div className="mt-3 space-y-1.5">
          <SysRow
            label="Все миссии выполнены"
            value={`${tasks.length}/${tasks.length}`}
            done
          />
          <SysRow label="Стрик сохранён" value={`${streak}D`} done />
        </div>
        <MidnightTimer tone="green" />
        <SysButton
          tone="green"
          className="w-full mt-5"
          onClick={() => setIsDayFinishedModalOpen(false)}
        >
          ПРИНЯТО
        </SysButton>
      </SystemWindow>
    </div>
  );
}
