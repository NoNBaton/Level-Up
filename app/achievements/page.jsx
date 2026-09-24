"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Flame,
  Lock,
  ArrowLeft,
  Trophy,
  Cpu,
  Zap,
  Crown,
  Skull,
  Swords,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const ACHIEVEMENTS = [
  // --- РАЗДЕЛ: СТРИК ---
  {
    id: "streak_3",
    category: "streak",
    title: "ВЫЖИВШИЙ В ДВОЙНОМ ПОДЗЕМЕЛЬЕ",
    req: 3,
    desc: "Удерживайте стрик 3 дня. Первые правила Системы освоены.",
  },
  {
    id: "streak_7",
    category: "streak",
    title: "ЕЖЕДНЕВНЫЙ КВЕСТ: ИСПЫТАНИЕ",
    req: 7,
    desc: "Удерживайте стрик 7 дней. Избегайте Штрафной Зоны.",
  },
  {
    id: "streak_14",
    category: "streak",
    title: "ПРОБУЖДЕННЫЙ ИГРОК",
    req: 14,
    desc: "Удерживайте стрик 14 дней подряд.",
  },
  {
    id: "streak_21",
    category: "streak",
    title: "БЕЗЖАЛОСТНЫЙ ТРЕНИРОВОЧНЫЙ РЕЖИМ",
    req: 21,
    desc: "100 отжиманий, 100 приседаний каждый день на протяжении 3 недель.",
  },
  {
    id: "streak_30",
    category: "streak",
    title: "ПРЕОДОЛЕНИЕ ПРЕДЕЛА",
    req: 30,
    desc: "Удерживайте стрик 30 дней подряд.",
  },
  {
    id: "streak_60",
    category: "streak",
    title: "СОСУД ДЛЯ ВЛАДЫКИ",
    req: 60,
    desc: "Удерживайте стрик 60 дней. Ваше тело готово принять истинную силу.",
  },
  {
    id: "streak_90",
    category: "streak",
    title: "ТЕМНОЕ ПЛАМЯ МУНДЖУНА",
    req: 90,
    desc: "Удерживайте стрик 90 дней (3 месяца подряд).",
  },
  {
    id: "streak_180",
    category: "streak",
    title: "ВЕЧНАЯ СИСТЕМА",
    req: 180,
    desc: "Удерживайте стрик полгода (180 дней).",
  },
  {
    id: "streak_365",
    category: "streak",
    title: "ПРАВИТЕЛЬ ВЕЧНОСТИ",
    req: 365,
    desc: "Удерживайте стрик целый год без единого пропуска.",
  },

  // --- РАЗДЕЛ: КРИД ---
  {
    id: "tasks_1",
    category: "creed",
    title: "СЛАБЕЙШЕЕ ОРУЖИЕ ЧЕЛОВЕЧЕСТВА",
    req: 1,
    desc: "Зачистите свое первое подземелье (1 миссия).",
  },
  {
    id: "tasks_5",
    category: "creed",
    title: "ОХОТНИК E-РАНГА",
    req: 5,
    desc: "Выполните 5 миссий. Начните собирать магические кристаллы.",
  },
  {
    id: "tasks_10",
    category: "creed",
    title: "ОХОТНИК D-РАНГА",
    req: 10,
    desc: "Выполните 10 миссий. Вы больше не самый слабый.",
  },
  {
    id: "tasks_25",
    category: "creed",
    title: "ОХОТНИК C-РАНГА",
    req: 25,
    desc: "Выполните 25 миссий в сумме.",
  },
  {
    id: "tasks_50",
    category: "creed",
    title: "ОХОТНИК B-РАНГА",
    req: 50,
    desc: "Выполните 50 миссий. Гильдии начинают замечать вас.",
  },
  {
    id: "tasks_100",
    category: "creed",
    title: "ОХОТНИК A-РАНГА",
    req: 100,
    desc: "Выполните 100 миссий. Рейд-лидер элитного отряда.",
  },
  {
    id: "tasks_150",
    category: "creed",
    title: "ОХОТНИК S-РАНГА",
    req: 150,
    desc: "Выполните 150 миссий. Вы — живое стратегическое оружие.",
  },
  {
    id: "tasks_250",
    category: "creed",
    title: "ОХОТНИК НАЦИОНАЛЬНОГО УРОВНЯ",
    req: 250,
    desc: "Выполните 250 миссий. Силы, способные противостоять армии.",
  },
  {
    id: "tasks_500",
    category: "creed",
    title: "ИЗВЛЕЧЕНИЕ ТЕНИ: ПРИКАЗ «ВОСТАНЬ»",
    req: 500,
    desc: "Выполните 500 миссий. Пополните армию теней павшими врагами.",
  },
  {
    id: "tasks_1000",
    category: "creed",
    title: "УБИЙЦА ДРАКОНОВ: КАМИШ",
    req: 1000,
    desc: "Выполните 1000 миссий. Победа над величайшим бедствием.",
  },

  // --- РАЗДЕЛ: ЛЕВЕЛ ---
  {
    id: "level_2",
    category: "level",
    title: "ПОВЫШЕНИЕ ХАРАКТЕРИСТИК",
    req: 2,
    desc: "Достигните 2-го уровня.",
  },
  {
    id: "level_5",
    category: "level",
    title: "УБИЙЦА ВОЛКОВ (РАЗИТЕЛЬ ЛЕСА)",
    req: 5,
    desc: "Достигните 5-го уровня и одолейте Клыкастого Волка.",
  },
  {
    id: "level_10",
    category: "level",
    title: "ПОБЕДИТЕЛЬ КАСАКЕ",
    req: 10,
    desc: "Достигните 10-го уровня. Получите кинжал Клыка Касаки.",
  },
  {
    id: "level_15",
    category: "level",
    title: "КВЕСТ СМЕНЫ ПРОФЕССИИ",
    req: 15,
    desc: "Достигните 15-го уровня. Рыцарское испытание в одиночной зоне.",
  },
  {
    id: "level_20",
    category: "level",
    title: "ПОВЕЛИТЕЛЬ ТЕНЕЙ (НОВИЧОК)",
    req: 20,
    desc: "Достигните 20-го уровня. Получите скрытый класс Повелителя Теней.",
  },
  {
    id: "level_25",
    category: "level",
    title: "СМЕРТЕЛЬНЫЙ НЕКРОМАНТ",
    req: 25,
    desc: "Достигните 25-го уровня. Управляйте первыми рыцарями.",
  },
  {
    id: "level_35",
    category: "level",
    title: "ХРАНИТЕЛЬ ДЕМОНИЧЕСКОЙ ЗАМКОВОЙ БАШНИ",
    req: 35,
    desc: "Достигните 35-го уровня. Зачистите 100 этажей Демонической башни.",
  },
  {
    id: "level_50",
    category: "level",
    title: "МАРШАЛ АРМИИ ТЕНЕЙ",
    req: 50,
    desc: "Достигните 50-го уровня.",
  },
  {
    id: "level_75",
    category: "level",
    title: "ВЛАДЫКА ТЕНЕЙ (SHADOW MONARCH)",
    req: 75,
    desc: "Достигните 75-го уровня. Полное слияние с силой Эшборна.",
  },
  {
    id: "level_100",
    category: "level",
    title: "БОГ СМЕРТИ И ТЕНЕЙ",
    req: 100,
    desc: "Достигните 100-го уровня. Абсолютный правитель бездны.",
  },

  // --- РАЗДЕЛ: МИФИЧЕСКИЕ ---
  {
    id: "elite_1",
    category: "elite",
    title: "ПРИЗЫВ КРАСНОГО РЫЦАРЯ: КЛИНОК КУРАНА (ИГРИС)",
    req: 10,
    desc: "Уровень 10 + 7 дней стрика. Кровавый рыцарь присягает вам на верность.",
    customCheck: (l, s) => Number(l) >= 10 && Number(s) >= 7,
  },
  {
    id: "elite_2",
    category: "elite",
    title: "ПРИЗЫВ ЖЕЛЕЗА И ТАНКА",
    req: 50,
    desc: "50 зачисток подземелий + 14 дней стрика. Тяжелая пехота теней.",
    customCheck: (_l, s, t) => Number(t) >= 50 && Number(s) >= 14,
  },
  {
    id: "elite_3",
    category: "elite",
    title: "КОРОЛЬ МУРАВЬЕВ: БЕРУ",
    req: 100,
    desc: "Уровень 25, 30 дней стрика и 100 зачисток. Кошмар острова ЧЕДЖУ подчинен.",
    customCheck: (l, s, t) =>
      Number(l) >= 25 && Number(s) >= 30 && Number(t) >= 100,
  },
  {
    id: "elite_4",
    category: "elite",
    title: "ВЛАДЫКА ПЕРВОЗДАННОЙ СКВЕРНЫ (МОНАРХ ОПЛОТА)",
    req: 500,
    desc: "Уровень 50, 90 дней стрика и 250 зачисток. Уничтожьте монархов.",
    customCheck: (l, s, t) =>
      Number(l) >= 50 && Number(s) >= 90 && Number(t) >= 250,
  },
];

export default function AchievementsPage() {
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [activeTab, setActiveTab] = useState("streak");
  const [isLoaded, setIsLoaded] = useState(false);

  const getPrefix = () => {
    let prefix = "levelup_";
    const currentAccRaw = localStorage.getItem("solo_hunter_current_account");
    if (currentAccRaw && currentAccRaw.trim() !== "") {
      try {
        const parsedAcc = JSON.parse(currentAccRaw);
        if (parsedAcc?.authId) {
          prefix = `hunter_${parsedAcc.authId}_`;
        }
      } catch {}
    }
    return prefix;
  };

  const syncAchievements = () => {
    const prefix = getPrefix();
    // Для именного аккаунта (hunter_{authId}_) НЕЛЬЗЯ откатываться на общие
    // ключи levelup_*/streak/tasks — там могут лежать данные другого аккаунта
    // или гостевой сессии, и именно это вызывало "утечку" старого прогресса
    // на новые аккаунты. Общий фолбэк оставляем только для гостя (без authId),
    // чтобы не терять старые данные пользователей, у которых ещё нет аккаунта.
    const isAccountMode = prefix.startsWith("hunter_");

    const savedStreak = isAccountMode
      ? (localStorage.getItem(`${prefix}streak`) ?? "0")
      : (localStorage.getItem(`${prefix}streak`) ??
        localStorage.getItem("levelup_streak") ??
        localStorage.getItem("streak") ??
        "0");
    const savedLevel = isAccountMode
      ? (localStorage.getItem(`${prefix}level`) ?? "1")
      : (localStorage.getItem(`${prefix}level`) ??
        localStorage.getItem("levelup_level") ??
        localStorage.getItem("level") ??
        "1");
    const savedTasksRaw = isAccountMode
      ? localStorage.getItem(`${prefix}tasks`)
      : (localStorage.getItem(`${prefix}tasks`) ??
        localStorage.getItem("levelup_tasks") ??
        localStorage.getItem("tasks"));

    const currentStreak = Number(savedStreak) || 0;
    const currentLevel = Number(savedLevel) || 1;
    let currentTasksCount = 0;

    if (savedTasksRaw && savedTasksRaw.trim() !== "") {
      try {
        const parsedTasks = JSON.parse(savedTasksRaw);
        if (Array.isArray(parsedTasks)) {
          currentTasksCount = parsedTasks.filter(
            (t) => t && (t.completed || t.status === "completed"),
          ).length;
        } else if (typeof parsedTasks === "object") {
          // фоллбэк если обертка с массивом квестов
          const arr = parsedTasks.quests || parsedTasks.tasks || [];
          if (Array.isArray(arr)) {
            currentTasksCount = arr.filter(
              (t) => t && (t.completed || t.status === "completed"),
            ).length;
          }
        }
      } catch (e) {
        // игнорируем ошибку парсинга
      }
    }
    // Если по пермиссионному ключу счетчик хранится отдельно
    const countFallback = isAccountMode
      ? localStorage.getItem(`${prefix}completed_count`)
      : localStorage.getItem(`${prefix}completed_count`) ||
        localStorage.getItem("levelup_completed_count");
    if (countFallback) {
      currentTasksCount = Math.max(
        currentTasksCount,
        Number(countFallback) || 0,
      );
    }

    setStreak(currentStreak);
    setLevel(currentLevel);
    setCompletedTasksCount(currentTasksCount);

    const validUnlocked = ACHIEVEMENTS.filter((ach) => {
      const numLevel = Number(currentLevel) || 1;
      const numStreak = Number(currentStreak) || 0;
      const numTasks = Number(currentTasksCount) || 0;

      if (ach.customCheck) {
        return ach.customCheck(numLevel, numStreak, numTasks);
      }
      if (ach.category === "streak") return numStreak >= ach.req;
      if (ach.category === "creed") return numTasks >= ach.req;
      if (ach.category === "level") return numLevel >= ach.req;
      return false;
    }).map((a) => a.id);

    setUnlockedIds(validUnlocked);
    localStorage.setItem(
      `${prefix}unlocked_achievements`,
      JSON.stringify(validUnlocked),
    );
  };

  useEffect(() => {
    syncAchievements();
    setIsLoaded(true);

    const handleUpdate = () => {
      syncAchievements();
    };

    window.addEventListener("hunter_account_changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("custom_storage_update", handleUpdate);

    return () => {
      window.removeEventListener("hunter_account_changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("custom_storage_update", handleUpdate);
    };
  }, []);

  const handleHardReset = () => {
    const prefix = getPrefix();
    localStorage.removeItem(`${prefix}unlocked_achievements`);
    localStorage.removeItem("unlocked_achievements");
    syncAchievements();
  };

  if (!isLoaded) {
    return (
      <div className="min-h-[100dvh] bg-black text-cyan-400 font-mono flex justify-center items-center p-4">
        <div className="flex items-center gap-2 border border-cyan-500/50 p-4 rounded-xl bg-cyan-950/20 backdrop-blur">
          <Cpu className="w-5 h-5 animate-spin text-cyan-400" />
          <span className="text-xs tracking-[0.3em] uppercase animate-pulse">
            СИНХРОНИЗАЦИЯ С СИСТЕМОЙ...
          </span>
        </div>
      </div>
    );
  }

  const checkUnlocked = (ach) => unlockedIds.includes(ach.id);

  const getCurrentProgress = (ach) => {
    const numLevel = Number(level) || 1;
    const numStreak = Number(streak) || 0;
    const numTasks = Number(completedTasksCount) || 0;

    if (ach.category === "streak")
      return `${Math.min(numStreak, ach.req)}/${ach.req}`;
    if (ach.category === "creed")
      return `${Math.min(numTasks, ach.req)}/${ach.req}`;
    if (ach.category === "level")
      return `${Math.min(numLevel, ach.req)}/${ach.req}`;
    if (ach.category === "elite") return checkUnlocked(ach) ? "1/1" : "0/1";
    return "0";
  };

  const unlockedCount = ACHIEVEMENTS.filter((a) => checkUnlocked(a)).length;
  const filteredAchievements = ACHIEVEMENTS.filter(
    (a) => a.category === activeTab,
  );

  return (
    <div className="min-h-[100dvh] bg-black text-cyan-400 font-mono p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

      <main className="w-full max-w-md bg-slate-950/90 border border-cyan-500/40 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.2)] relative z-10 flex flex-col max-h-[92vh] my-auto">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-400/80 shadow-[0_0_10px_#22d3ee] animate-pulse"></div>

        {/* Шапка с кнопкой назад и сбросом */}
        <header className="flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-4 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-200 transition bg-cyan-950/50 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase no-underline"
          >
            <ArrowLeft className="w-4 h-4" />
            НАЗАД
          </Link>

          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-bold tracking-widest text-white uppercase">
              СИСТЕМА: ДОСТИЖЕНИЯ
            </span>
          </div>

          <button
            onClick={handleHardReset}
            title="Очистить и пересчитать достижения"
            className="p-1.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-400 hover:bg-red-900/50 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </header>

        {/* Общий прогресс */}
        <section className="bg-slate-900/60 border border-purple-500/30 p-3.5 rounded-xl mb-4 shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-purple-400 font-bold tracking-wider uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Уровень Синхронизации
            </span>
            <span className="text-xs font-black text-purple-300 tracking-widest">
              {unlockedCount} / {ACHIEVEMENTS.length}
            </span>
          </div>

          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-purple-500/30">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500 shadow-[0_0_10px_#a855f7]"
              style={{
                width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%`,
              }}
            ></div>
          </div>
        </section>

        {/* Вкладки разделов (Табы) */}
        <div className="grid grid-cols-4 gap-1.5 mb-4 shrink-0">
          <button
            onClick={() => setActiveTab("streak")}
            className={`py-2 px-1 rounded-lg border text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === "streak"
                ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                : "bg-slate-950/60 border-slate-800 text-slate-500 hover:text-cyan-400"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            КВЕСТЫ
          </button>

          <button
            onClick={() => setActiveTab("creed")}
            className={`py-2 px-1 rounded-lg border text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === "creed"
                ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                : "bg-slate-950/60 border-slate-800 text-slate-500 hover:text-cyan-400"
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            ОХОТА
          </button>

          <button
            onClick={() => setActiveTab("level")}
            className={`py-2 px-1 rounded-lg border text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === "level"
                ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                : "bg-slate-950/60 border-slate-800 text-slate-500 hover:text-cyan-400"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            КЛАСС
          </button>

          <button
            onClick={() => setActiveTab("elite")}
            className={`py-2 px-1 rounded-lg border text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === "elite"
                ? "bg-purple-500/20 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                : "bg-slate-950/60 border-slate-800 text-slate-500 hover:text-purple-400"
            }`}
          >
            <Skull className="w-3.5 h-3.5 text-purple-400" />
            ТЕНИ
          </button>
        </div>

        {/* Список ачивок */}
        <div className="space-y-3 overflow-y-auto pr-2 flex-1 [scrollbar-width:thin] [scrollbar-color:rgba(6,182,212,0.4)_rgba(15,23,42,0.6)]">
          {filteredAchievements.map((ach, index) => {
            const isUnlocked = checkUnlocked(ach);
            const progressText = getCurrentProgress(ach);

            return (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`p-3.5 rounded-xl border transition-all ${
                  isUnlocked
                    ? ach.category === "elite"
                      ? "bg-purple-950/40 border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                      : "bg-cyan-950/40 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "bg-slate-950/60 border-slate-800/80 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg border ${
                        isUnlocked
                          ? ach.category === "elite"
                            ? "bg-purple-500/20 border-purple-400/50 text-purple-300"
                            : "bg-cyan-500/20 border-cyan-400/50 text-cyan-300"
                          : "bg-slate-900 border-slate-800 text-slate-600"
                      }`}
                    >
                      {isUnlocked ? (
                        ach.category === "elite" ? (
                          <Crown className="w-4 h-4 text-purple-300 animate-pulse" />
                        ) : (
                          <Flame className="w-4 h-4 fill-cyan-400 text-cyan-300 animate-pulse" />
                        )
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h3
                        className={`text-xs font-bold tracking-wider ${
                          isUnlocked
                            ? ach.category === "elite"
                              ? "text-purple-200"
                              : "text-cyan-100"
                            : "text-slate-500"
                        }`}
                      >
                        {ach.title}
                      </h3>
                      <span className="text-[9px] text-cyan-600 font-mono uppercase">
                        ТРЕБОВАНИЕ: {ach.req}{" "}
                        {ach.category === "streak"
                          ? "ДНЕЙ"
                          : ach.category === "creed"
                            ? "МИССИЙ"
                            : ach.category === "level"
                              ? "LVL"
                              : "УСЛОВИЕ"}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                      isUnlocked
                        ? ach.category === "elite"
                          ? "bg-purple-950 text-purple-300 border-purple-500/40"
                          : "bg-cyan-950 text-cyan-300 border-cyan-500/40"
                        : "bg-slate-900 text-slate-600 border-slate-800"
                    }`}
                  >
                    {isUnlocked ? "ОТКРЫТО" : progressText}
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 pl-8">{ach.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
