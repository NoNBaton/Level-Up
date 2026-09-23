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
  Target,
  Crown,
  Sparkles,
  Skull,
  Swords,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// Разделенные по категориям достижения в стиле Solo Leveling
const ACHIEVEMENTS = [
  // --- РАЗДЕЛ: СТРИК (Система ежедневных квестов) ---
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
    title: "ПРОБУЖДЕННЫЙ ИРОК",
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
    title: "ТЕМНОЕ ПЛАМЯ МУНДЖУНA",
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

  // --- РАЗДЕЛ: КРИД (Охота и зачистка подземелий) ---
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
    title: "ИЗВЛЕЧЕНИЕ ТЕНИ: ПРИКАЗ «ВОССТАНЬ»",
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

  // --- РАЗДЕЛ: ЛЕВЕЛ (Классы и смены профессий) ---
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
    title: "ХРАНИТЕЛЬ ДЕМOНИЧЕСКОЙ ЗАМКОВОЙ БАШНИ",
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

  // --- РАЗДЕЛ: МИФИЧЕСКИЕ (Великие рыцари и Монархи) ---
  {
    id: "elite_1",
    category: "elite",
    title: "ПРИЗЫВ КРАСНОГО РЫЦАРЯ: КЛИНОК КУРАНА (ИГРИС)",
    req: 10,
    desc: "Уровень 10 + 7 дней стрика. Кровавый рыцарь присягает вам на верность.",
    customCheck: (l, s, t) => l >= 10 && s >= 7,
  },
  {
    id: "elite_2",
    category: "elite",
    title: "ПРИЗЫВ ЖЕЛЕЗА И ТАНКA",
    req: 50,
    desc: "50 зачисток подземелий + 14 дней стрика. Тяжелая пехота теней.",
    customCheck: (l, s, t) => t >= 50 && s >= 14,
  },
  {
    id: "elite_3",
    category: "elite",
    title: "КОРОЛЬ МУРАВЬЕВ: БЕРУ",
    req: 100,
    desc: "Уровень 25, 30 дней стрика и 100 зачисток. Кошмар острова ЧЕДЖУ подчинен.",
    customCheck: (l, s, t) => l >= 25 && s >= 30 && t >= 100,
  },
  {
    id: "elite_4",
    category: "elite",
    title: "ВЛАДЫКА ПЕРВОЗДАННОЙ СКВЕРНЫ (МОНАРХ ОПЛОТА)",
    req: 500,
    desc: "Уровень 50, 90 дней стрика и 250 зачисток. Уничтожьте монархов.",
    customCheck: (l, s, t) => l >= 50 && s >= 90 && t >= 250,
  },
];

export default function AchievementsPage() {
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [activeTab, setActiveTab] = useState("streak");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedStreak = localStorage.getItem("levelup_streak");
    const savedLevel = localStorage.getItem("levelup_level");
    const savedTasksRaw = localStorage.getItem("levelup_tasks");

    if (savedStreak !== null) setStreak(Number(savedStreak));
    if (savedLevel !== null) setLevel(Number(savedLevel));

    if (savedTasksRaw) {
      try {
        const parsedTasks = JSON.parse(savedTasksRaw);
        if (Array.isArray(parsedTasks)) {
          const count = parsedTasks.filter((t) => t.completed).length;
          setCompletedTasksCount(count);
        }
      } catch (e) {
        console.error("Ошибка парсинга задач:", e);
      }
    }

    setIsLoaded(true);
  }, []);

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

  // Проверка условий разблокировки
  const checkUnlocked = (ach) => {
    if (ach.customCheck) {
      return ach.customCheck(level, streak, completedTasksCount);
    }
    if (ach.category === "streak") return streak >= ach.req;
    if (ach.category === "creed") return completedTasksCount >= ach.req;
    if (ach.category === "level") return level >= ach.req;
    return false;
  };

  // Текущий прогресс в численной форме
  const getCurrentProgress = (ach) => {
    if (ach.category === "streak") return `${streak}/${ach.req}`;
    if (ach.category === "creed") return `${completedTasksCount}/${ach.req}`;
    if (ach.category === "level") return `${level}/${ach.req}`;
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

      <main className="w-full max-w-md bg-slate-950/90 border border-cyan-500/40 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.2)] relative z-10 overflow-hidden my-auto">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-400/80 shadow-[0_0_10px_#22d3ee] animate-pulse"></div>

        {/* Шапка с кнопкой назад */}
        <header className="flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-200 transition bg-cyan-950/50 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase"
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
        </header>

        {/* Общий прогресс */}
        <section className="bg-slate-900/60 border border-purple-500/30 p-3.5 rounded-xl mb-4 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
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
        <div className="grid grid-cols-4 gap-1.5 mb-4">
          <button
            onClick={() => setActiveTab("streak")}
            className={`py-2 px-1 rounded-lg border text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-1 transition ${
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
            className={`py-2 px-1 rounded-lg border text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-1 transition ${
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
            className={`py-2 px-1 rounded-lg border text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-1 transition ${
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
            className={`py-2 px-1 rounded-lg border text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-1 transition ${
              activeTab === "elite"
                ? "bg-purple-500/20 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                : "bg-slate-950/60 border-slate-800 text-slate-500 hover:text-purple-400"
            }`}
          >
            <Skull className="w-3.5 h-3.5 text-purple-400" />
            ТЕНИ
          </button>
        </div>

        {/* Список ачивок активного раздела */}
        <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
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
