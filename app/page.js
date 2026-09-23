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
  X,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Power,
  History as HistoryIcon,
  Sparkles,
  Zap,
  Crown,
  Trophy,
  Star,
  Swords,
  Skull,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const SOUNDS = {
  openModal: "/sounds/open.mp3",
  closeModal: "/sounds/close.mp3",
  addMission: "/sounds/add.mp3",
  completeTask: "/sounds/complete.mp3",
  achievement: "/sounds/achievement.mp3",
  epicAchievement: "/sounds/epic_achievement.mp3",
};

// База данных всех уникальных ачивок с кастомными типами анимаций
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
    description: "Достигнут 5 уровень развития!",
    icon: <Star className="w-6 h-6 text-amber-300" />,
    rarity: "epic",
    animationType: "level_spin",
  },
  LEVEL_25: {
    id: "level_25",
    title: "ПОВЕЛИТЕЛЬ СИСТЕМЫ",
    description: "Достигнут 25 уровень! Максимальная грань!",
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

// Индивидуальные анимации появления/эффектов ачивок
const ACHIEVEMENT_ANIMATIONS = {
  zap: {
    initial: { scale: 0.2, rotate: -45, opacity: 0 },
    animate: { scale: [1.2, 1], rotate: 0, opacity: 1 },
    transition: { type: "spring", stiffness: 500, damping: 15 },
  },
  streak_pulse: {
    initial: { y: -50, scale: 0.8, opacity: 0 },
    animate: {
      y: 0,
      scale: 1,
      opacity: 1,
      x: [0, -6, 6, -4, 4, 0],
    },
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
      scale: [1.15, 1],
      opacity: 1,
      y: 0,
      boxShadow: [
        "0_0_10px_rgba(217,70,239,0.2)",
        "0_0_60px_rgba(217,70,239,0.9)",
        "0_0_40px_rgba(217,70,239,0.6)",
      ],
    },
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

export default function HomePage() {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastCompletedDate, setLastCompletedDate] = useState("");

  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");

  const [isLoaded, setIsLoaded] = useState(false);
  const isFirstRender = useRef(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDayFinishedModalOpen, setIsDayFinishedModalOpen] = useState(false);
  const [selectedDayHistory, setSelectedDayHistory] = useState(null);
  const [unlockedAchievementNotification, setUnlockedAchievementNotification] =
    useState(null);

  const xpPerLevel = 100;
  const xpPerTask = 25;

  const playSound = (soundUrl) => {
    try {
      const audio = new Audio(soundUrl);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const triggerAchievement = (achievementKey) => {
    const ach = ACHIEVEMENTS_LIST[achievementKey];
    if (!ach) return;

    if (unlockedAchievements.includes(ach.id)) return;

    const updated = [...unlockedAchievements, ach.id];
    setUnlockedAchievements(updated);
    localStorage.setItem(
      "levelup_unlocked_achievements",
      JSON.stringify(updated),
    );

    if (ach.rarity === "legendary" || ach.rarity === "epic") {
      playSound(SOUNDS.epicAchievement);
    } else {
      playSound(SOUNDS.achievement);
    }

    setUnlockedAchievementNotification(ach);

    setTimeout(() => {
      setUnlockedAchievementNotification(null);
    }, 5500);
  };

  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const generate7DaysHistory = (existingHistory = [], currentTasks = []) => {
    const result = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      let label = i === 0 ? "Сегодня" : i === 1 ? "Вчера" : `${i}д назад`;

      if (i === 0) {
        const completedList = currentTasks.filter((t) => t.completed);
        result.push({
          date: dateStr,
          label,
          completed: completedList.length,
          total: currentTasks.length,
          tasksSnapshot: currentTasks.map((t) => ({
            text: t.text,
            completed: t.completed,
          })),
          dayOffset: i,
        });
      } else {
        const savedDay = existingHistory.find((h) => h.date === dateStr);
        result.push({
          date: dateStr,
          label,
          completed: savedDay ? savedDay.completed : 0,
          total: savedDay ? savedDay.total : 0,
          tasksSnapshot: savedDay ? savedDay.tasksSnapshot || [] : [],
          dayOffset: i,
        });
      }
    }
    return result;
  };

  useEffect(() => {
    const today = getTodayString();

    const savedLevel = localStorage.getItem("levelup_level");
    const savedXp = localStorage.getItem("levelup_xp");
    const savedStreak = localStorage.getItem("levelup_streak");
    const savedLastCompleted =
      localStorage.getItem("levelup_last_completed") || "";
    const savedDate = localStorage.getItem("levelup_date") || today;
    const savedHistoryRaw = localStorage.getItem("levelup_history");
    const savedTasksRaw = localStorage.getItem("levelup_tasks");
    const savedAchRaw = localStorage.getItem("levelup_unlocked_achievements");

    let loadedTasks = savedTasksRaw ? JSON.parse(savedTasksRaw) : [];
    let loadedHistory = savedHistoryRaw ? JSON.parse(savedHistoryRaw) : [];
    let loadedAch = savedAchRaw ? JSON.parse(savedAchRaw) : [];

    if (savedDate !== today) {
      const yesterdayCompleted = loadedTasks.filter((t) => t.completed);

      loadedHistory = loadedHistory.filter((h) => h.date !== savedDate);
      loadedHistory.push({
        date: savedDate,
        completed: yesterdayCompleted.length,
        total: loadedTasks.length,
        tasksSnapshot: loadedTasks.map((t) => ({
          text: t.text,
          completed: t.completed,
        })),
      });

      loadedTasks = loadedTasks.map((t) => ({ ...t, completed: false }));
      localStorage.setItem("levelup_date", today);
    }

    if (savedLevel !== null) setLevel(Number(savedLevel));
    if (savedXp !== null) setXp(Number(savedXp));
    if (savedStreak !== null) setStreak(Number(savedStreak));
    setLastCompletedDate(savedLastCompleted);

    setTasks(loadedTasks);
    setUnlockedAchievements(loadedAch);

    const fullHistory = generate7DaysHistory(loadedHistory, loadedTasks);
    setHistory(fullHistory);

    setIsLoaded(true);
    isFirstRender.current = false;
  }, []);

  useEffect(() => {
    if (!isLoaded || isFirstRender.current) return;

    const today = getTodayString();
    localStorage.setItem("levelup_date", today);
    localStorage.setItem("levelup_level", level.toString());
    localStorage.setItem("levelup_xp", xp.toString());
    localStorage.setItem("levelup_streak", streak.toString());
    localStorage.setItem("levelup_last_completed", lastCompletedDate);
    localStorage.setItem("levelup_tasks", JSON.stringify(tasks));

    const historyToSave = history
      .filter((h) => h.dayOffset !== 0)
      .map(({ date, completed, total, tasksSnapshot }) => ({
        date,
        completed,
        total,
        tasksSnapshot,
      }));
    localStorage.setItem("levelup_history", JSON.stringify(historyToSave));
  }, [level, xp, streak, lastCompletedDate, tasks, history, isLoaded]);

  useEffect(() => {
    if (!isLoaded || isFirstRender.current) return;

    const completedTasks = tasks.filter((t) => t.completed);
    setHistory((prev) =>
      prev.map((item) =>
        item.dayOffset === 0
          ? {
              ...item,
              completed: completedTasks.length,
              total: tasks.length,
              tasksSnapshot: tasks.map((t) => ({
                text: t.text,
                completed: t.completed,
              })),
            }
          : item,
      ),
    );
  }, [tasks, isLoaded]);

  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const dailyProgress =
    tasks.length > 0
      ? Math.round((completedTasksCount / tasks.length) * 100)
      : 0;

  const handleOpenModal = () => {
    playSound(SOUNDS.openModal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    playSound(SOUNDS.closeModal);
    setIsModalOpen(false);
  };

  const handleAddMission = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    playSound(SOUNDS.addMission);

    const newTask = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTaskText("");
    setIsModalOpen(false);
  };

  const toggleTask = (id) => {
    const today = getTodayString();

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === id) {
          const isNowCompleted = !task.completed;

          if (isNowCompleted) {
            playSound(SOUNDS.completeTask);
            addXp(xpPerTask);

            triggerAchievement("FIRST_TASK");

            if (lastCompletedDate !== today) {
              const newStreak = streak + 1;
              setStreak(newStreak);
              setLastCompletedDate(today);

              if (newStreak === 3) triggerAchievement("STREAK_3");
              else if (newStreak === 7) triggerAchievement("STREAK_7");
              else if (newStreak === 30) triggerAchievement("STREAK_30");
            }
          } else {
            playSound(SOUNDS.closeModal);
            removeXp(xpPerTask);
          }
          return { ...task, completed: isNowCompleted };
        }
        return task;
      }),
    );
  };

  const handleFinishDay = () => {
    const today = getTodayString();
    const uncompletedTasks = tasks.filter((t) => !t.completed);

    if (uncompletedTasks.length > 0) {
      playSound(SOUNDS.completeTask);
      addXp(uncompletedTasks.length * xpPerTask);
    } else {
      playSound(SOUNDS.openModal);
    }

    setTasks((prev) => prev.map((t) => ({ ...t, completed: true })));

    if (lastCompletedDate !== today) {
      setStreak((prev) => prev + 1);
      setLastCompletedDate(today);
    }

    setIsDayFinishedModalOpen(true);
    triggerAchievement("DAY_COMPLETE");
  };

  const deleteTask = (id) => {
    playSound(SOUNDS.closeModal);
    setTasks((prevTasks) => prevTasks.filter((t) => t.id !== id));
  };

  const addXp = (amount) => {
    setXp((prevXp) => {
      let newXp = prevXp + amount;
      if (newXp >= xpPerLevel) {
        const newLevel = level + 1;
        setLevel(newLevel);

        if (newLevel === 5) triggerAchievement("LEVEL_5");
        if (newLevel === 25) triggerAchievement("LEVEL_25");

        return newXp - xpPerLevel;
      }
      return newXp;
    });
  };

  const removeXp = (amount) => {
    setXp((prevXp) => {
      let newXp = prevXp - amount;
      if (newXp < 0) {
        if (level > 1) {
          setLevel((prevLvl) => prevLvl - 1);
          return xpPerLevel + newXp;
        }
        return 0;
      }
      return newXp;
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-[100dvh] bg-black text-cyan-400 font-mono flex justify-center items-center p-4">
        <div className="flex items-center gap-2 border border-cyan-500/50 p-3 sm:p-4 rounded-xl bg-cyan-950/20 backdrop-blur">
          <Cpu className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-cyan-400" />
          <span className="text-[10px] sm:text-xs tracking-[0.2em] uppercase animate-pulse">
            СИНХРОНИЗАЦИЯ СИСТЕМЫ...
          </span>
        </div>
      </div>
    );
  }

  // Отрисовка персонализированной анимационной карточки достижения
  const renderAchievementCard = (ach) => {
    const animConfig =
      ACHIEVEMENT_ANIMATIONS[ach.animationType] || ACHIEVEMENT_ANIMATIONS.zap;

    const baseContainerStyle =
      ach.rarity === "legendary"
        ? "bg-gradient-to-r from-fuchsia-950/95 via-purple-950/95 to-slate-950/95 border-2 border-fuchsia-400 shadow-[0_0_50px_rgba(217,70,239,0.7)]"
        : ach.rarity === "epic"
          ? "bg-slate-950/95 border-2 border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.6)]"
          : "bg-slate-950/95 border border-cyan-400/90 shadow-[0_0_25px_rgba(6,182,212,0.5)]";

    return (
      <motion.div
        initial={animConfig.initial}
        animate={animConfig.animate}
        exit={{ opacity: 0, scale: 0.7, y: -20 }}
        transition={animConfig.transition}
        style={{ perspective: 1000 }}
        className={`${baseContainerStyle} rounded-2xl p-4 backdrop-blur-2xl flex items-center gap-3.5 relative overflow-hidden`}
      >
        {/* Фоновые вспышки для редких элементов */}
        {ach.rarity === "legendary" && (
          <motion.div
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/30 via-pink-500/20 to-transparent pointer-events-none"
          />
        )}

        <motion.div
          animate={
            ach.animationType === "streak_pulse"
              ? { scale: [1, 1.15, 1], rotate: [0, -8, 8, 0] }
              : ach.animationType === "level_spin"
                ? { rotate: [0, 360] }
                : {}
          }
          transition={{
            duration: 0.6,
            repeat: ach.rarity !== "common" ? 1 : 0,
          }}
          className={`w-13 h-13 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
            ach.rarity === "legendary"
              ? "bg-gradient-to-br from-fuchsia-500 via-pink-500 to-purple-700 border-fuchsia-200 shadow-[0_0_20px_rgba(217,70,239,0.9)]"
              : ach.rarity === "epic"
                ? "bg-gradient-to-br from-amber-400 to-yellow-600 border-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.8)]"
                : "bg-cyan-950 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
          }`}
        >
          {ach.icon}
        </motion.div>

        <div className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase mb-0.5 ${
              ach.rarity === "legendary"
                ? "text-fuchsia-300"
                : ach.rarity === "epic"
                  ? "text-amber-300"
                  : "text-cyan-400"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            {ach.rarity === "legendary"
              ? "ЛЕГЕНДАРНОЕ ДОСТИЖЕНИЕ!"
              : ach.rarity === "epic"
                ? "ЭПИЧЕСКОЕ ДОСТИЖЕНИЕ!"
                : "ДОСТИЖЕНИЕ РАЗБЛОКИРОВАНО!"}
          </motion.div>
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-sm sm:text-base font-black text-white tracking-wide truncate"
          >
            {ach.title}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[10px] text-slate-300 truncate"
          >
            {ach.description}
          </motion.p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-black text-cyan-400 font-mono p-3 sm:p-6 flex flex-col justify-between sm:justify-center items-center select-none relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:20px_20px] sm:[background-size:24px_24px] opacity-10 pointer-events-none"></div>

      {/* ИНДИВИДУАЛЬНО АНИМИРОВАННЫЙ ТОСТ АЧИВКИ */}
      <AnimatePresence mode="wait">
        {unlockedAchievementNotification && (
          <div className="fixed top-6 z-50 px-4 w-full max-w-sm sm:max-w-md pointer-events-none">
            {renderAchievementCard(unlockedAchievementNotification)}
          </div>
        )}
      </AnimatePresence>

      <main className="w-full max-w-md bg-slate-950/90 border border-cyan-500/40 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.15)] relative z-10 overflow-hidden my-auto flex flex-col justify-between">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-400/80 shadow-[0_0_10px_#22d3ee] animate-pulse"></div>

        <div>
          {/* Шапка HUD */}
          <header className="flex justify-between items-center border-b border-cyan-500/20 pb-3 sm:pb-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1 sm:p-1.5 bg-cyan-500/10 border border-cyan-400/40 rounded-md">
                <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase text-white drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                  LEVEL_UP // OS
                </h1>
                <p className="text-[9px] sm:text-[10px] text-cyan-600 tracking-widest uppercase">
                  ИГРОК: АКТИВЕН
                </p>
              </div>
            </div>

            <div
              className={`flex items-center gap-1 sm:gap-1.5 bg-cyan-950/80 border px-2 py-0.5 sm:px-3 sm:py-1 rounded-md text-[11px] sm:text-xs font-bold transition-all ${
                streak > 0
                  ? "border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                  : "border-slate-800 text-slate-600 opacity-60"
              }`}
            >
              <Flame
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                  streak > 0
                    ? "fill-cyan-400 text-cyan-300 animate-pulse drop-shadow-[0_0_8px_#22d3ee]"
                    : "text-slate-600 fill-transparent"
                }`}
              />
              <span className="tracking-widest">{streak}D</span>
            </div>
          </header>

          {/* Статус уровней */}
          <section className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-slate-900/90 to-cyan-950/40 border border-cyan-500/30 p-3 sm:p-4 rounded-xl relative">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-[9px] sm:text-[10px] text-cyan-400/70 font-semibold tracking-widest uppercase block mb-0.5">
                    [ СТАТУС РАЗВИТИЯ ]
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-widest flex items-center gap-2">
                    <span>LVL</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-white text-2xl sm:text-3xl drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                      {level}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] sm:text-[11px] text-cyan-400 font-bold tracking-widest bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded">
                  {xp} / {xpPerLevel} XP
                </div>
              </div>

              <div className="w-full h-2 sm:h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-cyan-500/30 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 rounded-full transition-all duration-500 shadow-[0_0_12px_#06b6d4]"
                  style={{ width: `${(xp / xpPerLevel) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Ежедневный прогресс */}
            <div className="bg-slate-900/60 border border-cyan-500/20 p-3 sm:p-3.5 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] sm:text-[11px] text-cyan-400 font-bold tracking-wider flex items-center gap-1.5 uppercase">
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  Ежедневный прогресс
                </span>
                <span className="text-[11px] sm:text-xs font-black text-cyan-300 tracking-widest">
                  {dailyProgress}%
                </span>
              </div>

              <div className="w-full h-1.5 sm:h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-cyan-500/20">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_8px_#22d3ee]"
                  style={{ width: `${dailyProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Календарь активности */}
            <div className="bg-slate-900/40 border border-cyan-500/20 p-3 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-cyan-400/80 font-bold tracking-wider uppercase flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  История активности
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center">
                {history.map((item) => {
                  const is100Percent =
                    item.total > 0 && item.completed === item.total;
                  const isPartial =
                    item.completed > 0 && item.completed < item.total;

                  return (
                    <button
                      key={item.date}
                      onClick={() => {
                        playSound(SOUNDS.openModal);
                        setSelectedDayHistory(item);
                      }}
                      className={`flex flex-col items-center justify-between p-1.5 rounded-lg border text-[9px] transition hover:scale-105 active:scale-95 ${
                        item.dayOffset === 0
                          ? "border-cyan-400/80 bg-cyan-950/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
                          : "border-cyan-500/20 bg-slate-950/60"
                      }`}
                    >
                      <span className="text-slate-400 font-mono text-[8px] truncate mb-1">
                        {item.label}
                      </span>

                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-bold my-0.5 ${
                          is100Percent
                            ? "bg-cyan-400 text-slate-950 shadow-[0_0_8px_#22d3ee]"
                            : isPartial
                              ? "bg-cyan-950 text-cyan-300 border border-cyan-500/50"
                              : "bg-slate-900 text-slate-600 border border-slate-800"
                        }`}
                      >
                        {is100Percent ? (
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : (
                          <span>{item.completed}</span>
                        )}
                      </div>

                      <span className="text-[8px] text-slate-500 font-mono">
                        {item.completed}/{item.total}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ссылка на достижения */}
            <Link
              href="/achievements"
              className="w-full bg-slate-900/60 hover:bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 p-3 rounded-xl flex items-center justify-between transition shadow-[0_0_10px_rgba(6,182,212,0.1)] group"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold tracking-wider uppercase text-white">
                  [ ДОСТИЖЕНИЯ И НАГРАДЫ ]
                </span>
              </div>
              <span className="text-[10px] text-cyan-500 font-mono">
                ОТКРЫТЬ →
              </span>
            </Link>
          </section>

          {/* Кнопки управления */}
          <div className="grid grid-cols-1 gap-2 mb-4 sm:mb-6">
            <button
              onClick={handleOpenModal}
              className="w-full bg-cyan-950/60 hover:bg-cyan-900/50 border border-cyan-400/50 text-cyan-300 font-bold py-3 px-4 rounded-xl flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.2)] active:scale-95 transition tracking-widest text-xs uppercase group"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400 group-hover:rotate-90 transition-transform duration-300" />
                [ ПОЛУЧИТЬ НОВУЮ МИССИЮ ]
              </span>
              <span className="text-[10px] text-cyan-500 font-mono">
                +25 XP
              </span>
            </button>

            <button
              onClick={handleFinishDay}
              className="w-full bg-gradient-to-r from-emerald-950/80 to-teal-950/80 hover:from-emerald-900/80 hover:to-teal-900/80 border border-emerald-500/50 text-emerald-300 font-bold py-2.5 px-4 rounded-xl flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.2)] active:scale-95 transition tracking-widest text-xs uppercase group"
            >
              <span className="flex items-center gap-2">
                <Power className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                [ ЗАКОНЧИТЬ НА СЕГОДНЯ ]
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                100%
              </span>
            </button>
          </div>

          {/* Список задач */}
          <div className="space-y-2 sm:space-y-2.5 max-h-[18vh] sm:max-h-36 overflow-y-auto pr-1 custom-scrollbar">
            <AnimatePresence>
              {tasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-6 sm:py-8 border border-dashed border-cyan-500/20 rounded-xl text-slate-600 text-[10px] sm:text-xs tracking-widest uppercase"
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
                    transition={{ duration: 0.2 }}
                    className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all ${
                      task.completed
                        ? "bg-slate-950/40 border-cyan-500/10 text-slate-600"
                        : "bg-slate-900/80 border-cyan-500/40 text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.05)]"
                    }`}
                  >
                    <div
                      onClick={() => toggleTask(task.id)}
                      className="flex items-center gap-2.5 sm:gap-3 cursor-pointer flex-1 min-w-0"
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition shrink-0 ${
                          task.completed
                            ? "bg-cyan-400 border-cyan-300 text-black shadow-[0_0_8px_#22d3ee]"
                            : "border-cyan-500/50 bg-slate-950"
                        }`}
                      >
                        {task.completed && (
                          <Check className="w-3 h-3 stroke-[3]" />
                        )}
                      </div>
                      <span
                        className={`text-xs tracking-wider truncate ${
                          task.completed
                            ? "line-through text-slate-600"
                            : "text-cyan-50"
                        }`}
                      >
                        {task.text}
                      </span>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-600 hover:text-red-400 p-1 transition shrink-0 ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Окно создания миссии */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="w-full max-w-sm bg-cyan-950/90 border-2 border-cyan-400 rounded-xl p-5 sm:p-6 shadow-[0_0_60px_rgba(6,182,212,0.7)] relative overflow-hidden flex flex-col items-center text-center z-10"
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-3 right-3 text-cyan-400/60 hover:text-cyan-300 transition p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-black tracking-widest text-white uppercase mb-4">
                [ ДОБАВИТЬ МИССИЮ ]
              </h2>

              <form onSubmit={handleAddMission} className="w-full space-y-4">
                <input
                  type="text"
                  autoFocus
                  placeholder="Введите условие миссии..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className="w-full bg-slate-950/90 border border-cyan-400/60 rounded-lg px-4 py-3 text-xs sm:text-sm text-white placeholder-cyan-700 focus:outline-none focus:border-cyan-300 font-mono tracking-wider text-center"
                />

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black py-3 rounded-lg tracking-[0.2em] uppercase text-xs transition shadow-[0_0_25px_rgba(6,182,212,0.8)]"
                >
                  [ ПРИНЯТЬ МИССИЮ ]
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Окно истории */}
      <AnimatePresence>
        {selectedDayHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDayHistory(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="w-full max-w-sm bg-slate-950 border-2 border-cyan-400 rounded-xl p-5 shadow-[0_0_50px_rgba(6,182,212,0.4)] relative z-10 flex flex-col"
            >
              <button
                onClick={() => setSelectedDayHistory(null)}
                className="absolute top-3 right-3 text-cyan-400/60 hover:text-cyan-300 transition p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <HistoryIcon className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-black text-white tracking-widest uppercase">
                  ОТЧЕТ ЗА {selectedDayHistory.label} ({selectedDayHistory.date}
                  )
                </h2>
              </div>

              <div className="text-[10px] text-cyan-400 font-mono mb-4">
                ВЫПОЛНЕНО: {selectedDayHistory.completed} из{" "}
                {selectedDayHistory.total} МИССИЙ
              </div>

              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar mb-4">
                {selectedDayHistory.tasksSnapshot &&
                selectedDayHistory.tasksSnapshot.length > 0 ? (
                  selectedDayHistory.tasksSnapshot.map((task, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border flex items-center gap-2.5 text-xs font-mono ${
                        task.completed
                          ? "bg-cyan-950/30 border-cyan-500/30 text-cyan-200"
                          : "bg-slate-900/60 border-slate-800 text-slate-500"
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                          task.completed
                            ? "bg-cyan-400 border-cyan-300 text-black"
                            : "border-slate-700 bg-slate-950"
                        }`}
                      >
                        {task.completed && (
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        )}
                      </div>
                      <span
                        className={
                          task.completed ? "line-through text-slate-400" : ""
                        }
                      >
                        {task.text}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-600 text-xs font-mono">
                    // НЕТ ЗАПИСЕЙ О МИССИЯХ
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedDayHistory(null)}
                className="w-full bg-cyan-950 border border-cyan-500/50 hover:bg-cyan-900/50 text-cyan-300 font-bold py-2 rounded-lg text-xs uppercase tracking-wider"
              >
                ЗАКРЫТЬ
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Окно Завершения дня */}
      <AnimatePresence>
        {isDayFinishedModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDayFinishedModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="w-full max-w-sm bg-slate-950 border-2 border-emerald-400 rounded-xl p-6 shadow-[0_0_60px_rgba(16,185,129,0.5)] relative flex flex-col items-center text-center z-10"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>

              <h2 className="text-xl font-black text-white tracking-widest uppercase mb-1">
                ДЕНЬ ЗАВЕРШЕН!
              </h2>
              <p className="text-xs text-emerald-400 font-mono tracking-wider mb-4">
                ВСЕ МИССИИ ВЫПОЛНЕНЫ // СТРИК СОХРАНЕН
              </p>

              <button
                onClick={() => setIsDayFinishedModalOpen(false)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 rounded-lg tracking-widest uppercase text-xs transition shadow-[0_0_20px_rgba(16,185,129,0.6)]"
              >
                ПРИНЯТО
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
