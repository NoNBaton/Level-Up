"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { SystemFrame, IconBox } from "../components/SystemWindow";

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
  const TABS = [
    { id: "streak", label: "КВЕСТЫ", Icon: Flame },
    { id: "creed", label: "ОХОТА", Icon: Swords },
    { id: "level", label: "КЛАСС", Icon: Zap },
    { id: "elite", label: "ТЕНИ", Icon: Skull, purple: true },
  ];

  const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
  };

  // Всего выполненных миссий: берём счётчик с сервера, иначе считаем по истории
  function totalCompleted(prog) {
    if (Number.isFinite(prog.completedTotal)) {
      return Math.max(0, Math.floor(prog.completedTotal));
    }
    const today = todayStr();
    const hist = Array.isArray(prog.history) ? prog.history : [];
    const fromHistory = hist
      .filter((h) => h && h.date !== today)
      .reduce((sum, h) => sum + (Number(h.completed) || 0), 0);
    const tasks = Array.isArray(prog.tasks) ? prog.tasks : [];
    return fromHistory + tasks.filter((t) => t && t.completed).length;
  }

  const [stats, setStats] = useState({ streak: 0, level: 1, tasks: 0 });
  const [state, setState] = useState("loading"); // loading | ok | guest | error
  const [activeTab, setActiveTab] = useState("streak");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (res.status === 401) {
        setState("guest");
        return;
      }
      if (!res.ok) {
        setState("error");
        return;
      }
      const { player } = await res.json();
      const prog =
        player.progress && typeof player.progress === "object"
          ? player.progress
          : {};
      setStats({
        streak: Number(player.streak) || 0,
        level: Number(player.level) || 1,
        tasks: totalCompleted(prog),
      });
      setState("ok");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const unlockedIds = useMemo(
    () =>
      ACHIEVEMENTS.filter((ach) => {
        if (ach.customCheck) {
          return ach.customCheck(stats.level, stats.streak, stats.tasks);
        }
        if (ach.category === "streak") return stats.streak >= ach.req;
        if (ach.category === "creed") return stats.tasks >= ach.req;
        if (ach.category === "level") return stats.level >= ach.req;
        return false;
      }).map((a) => a.id),
    [stats],
  );

  const isUnlocked = (ach) => unlockedIds.includes(ach.id);

  const progressText = (ach) => {
    if (ach.category === "streak")
      return `${Math.min(stats.streak, ach.req)}/${ach.req}`;
    if (ach.category === "creed")
      return `${Math.min(stats.tasks, ach.req)}/${ach.req}`;
    if (ach.category === "level")
      return `${Math.min(stats.level, ach.req)}/${ach.req}`;
    return isUnlocked(ach) ? "1/1" : "0/1";
  };

  const unitLabel = (ach) =>
    ach.category === "streak"
      ? "ДНЕЙ"
      : ach.category === "creed"
        ? "МИССИЙ"
        : ach.category === "level"
          ? "LVL"
          : "УСЛОВИЕ";

  const unlockedCount = unlockedIds.length;
  const list = ACHIEVEMENTS.filter((a) => a.category === activeTab);

  if (state === "loading") {
    return (
      <div className="min-h-[100dvh] bg-black text-cyan-400 font-mono flex justify-center items-center p-4">
        <div className="flex items-center gap-2 border border-[#3b9dff]/50 p-4 rounded-xl bg-[#3b9dff]/10 backdrop-blur">
          <Cpu className="w-5 h-5 animate-spin text-[#3b9dff]" />
          <span className="text-xs tracking-[0.3em] uppercase animate-pulse">
            СИНХРОНИЗАЦИЯ С СИСТЕМОЙ...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-black text-[#cfe6ff] font-mono p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(#3b9dff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

      <SystemFrame
        tone="blue"
        className="w-full max-w-md p-5 sm:p-6 relative z-10 flex flex-col max-h-[92dvh] my-auto overflow-hidden"
      >
        {/* Шапка */}
        <header className="flex items-stretch gap-3 mb-4 shrink-0 relative">
          <IconBox tone="blue">!</IconBox>
          <div className="flex-1 min-w-0 border border-[#3b9dff]/40 flex items-center justify-center px-3">
            <h1
              className="text-sm font-black tracking-[0.16em] uppercase text-white truncate"
              style={{ textShadow: "0 0 8px #3b9dff, 0 0 18px #3b9dff" }}
            >
              ДОСТИЖЕНИЯ
            </h1>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            title="Обновить данные"
            className="shrink-0 w-9 flex items-center justify-center border border-[#3b9dff]/40 text-[#7fa8d6] hover:text-white hover:border-[#3b9dff] transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </header>

        <Link
          href="/"
          className="mb-4 shrink-0 inline-flex items-center gap-2 self-start text-[#9fd0ff] hover:text-white transition border border-[#3b9dff]/40 px-3 py-1.5 text-xs font-bold tracking-wider uppercase no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          НАЗАД
        </Link>

        {state === "guest" && (
          <div className="text-center border border-dashed border-[#3b9dff]/40 p-6 text-xs tracking-widest">
            ВЫ НЕ АВТОРИЗОВАНЫ.
            <br />
            <Link
              href="/"
              className="underline text-[#9fd0ff] hover:text-white"
            >
              ВОЙТИ В СИСТЕМУ
            </Link>
          </div>
        )}

        {state === "error" && (
          <div className="text-center text-xs text-rose-300 border border-rose-500/40 p-4 tracking-wider">
            НЕ УДАЛОСЬ ЗАГРУЗИТЬ ДАННЫЕ
          </div>
        )}

        {state === "ok" && (
          <>
            {/* Общий прогресс */}
            <section className="border border-purple-500/40 bg-purple-950/20 p-3.5 mb-4 shrink-0">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-purple-300 font-bold tracking-wider uppercase flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Уровень синхронизации
                </span>
                <span className="text-xs font-black text-purple-200 tracking-widest">
                  [{unlockedCount}/{ACHIEVEMENTS.length}]
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 overflow-hidden p-0.5 border border-purple-500/30">
                <div
                  className="h-full bg-purple-500 transition-all duration-500 shadow-[0_0_10px_#a855f7]"
                  style={{
                    width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%`,
                  }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-center text-[10px] tracking-widest text-[#7fa8d6]">
                <div>
                  LVL
                  <div className="text-base font-black text-white">
                    {stats.level}
                  </div>
                </div>
                <div>
                  СТРИК
                  <div className="text-base font-black text-white">
                    {stats.streak}D
                  </div>
                </div>
                <div>
                  МИССИЙ
                  <div className="text-base font-black text-white">
                    {stats.tasks}
                  </div>
                </div>
              </div>
            </section>

            {/* Вкладки */}
            <div className="grid grid-cols-4 gap-1.5 mb-4 shrink-0">
              {TABS.map(({ id, label, Icon, purple }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`py-2 px-1 border text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-1 transition cursor-pointer ${
                    activeTab === id
                      ? purple
                        ? "bg-purple-500/20 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                        : "bg-[#3b9dff]/20 border-[#3b9dff] text-[#cfe6ff] shadow-[0_0_10px_rgba(59,157,255,0.35)]"
                      : "bg-slate-950/60 border-slate-800 text-slate-500 hover:text-[#9fd0ff]"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${purple ? "text-purple-400" : ""}`}
                  />
                  {label}
                </button>
              ))}
            </div>

            {/* Список достижений */}
            <div className="space-y-3 overflow-y-auto pr-2 flex-1 [scrollbar-width:thin] [scrollbar-color:rgba(59,157,255,0.4)_rgba(15,23,42,0.6)]">
              {list.map((ach, index) => {
                const unlocked = isUnlocked(ach);
                const elite = ach.category === "elite";
                return (
                  <motion.div
                    key={ach.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`p-3.5 border transition-all ${
                      unlocked
                        ? elite
                          ? "bg-purple-950/40 border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                          : "bg-[#3b9dff]/10 border-[#3b9dff]/60 shadow-[0_0_15px_rgba(59,157,255,0.18)]"
                        : "bg-slate-950/60 border-slate-800/80 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1.5 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`p-1.5 border shrink-0 ${
                            unlocked
                              ? elite
                                ? "bg-purple-500/20 border-purple-400/50 text-purple-300"
                                : "bg-[#3b9dff]/20 border-[#3b9dff]/50 text-[#9fd0ff]"
                              : "bg-slate-900 border-slate-800 text-slate-600"
                          }`}
                        >
                          {unlocked ? (
                            elite ? (
                              <Crown className="w-4 h-4 text-purple-300 animate-pulse" />
                            ) : (
                              <Flame className="w-4 h-4 text-[#9fd0ff] animate-pulse" />
                            )
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3
                            className={`text-xs font-bold tracking-wider ${
                              unlocked
                                ? elite
                                  ? "text-purple-200"
                                  : "text-[#e3f0ff]"
                                : "text-slate-500"
                            }`}
                          >
                            {ach.title}
                          </h3>
                          <span className="text-[9px] text-[#5f86b3] uppercase">
                            ТРЕБОВАНИЕ: {ach.req} {unitLabel(ach)}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] px-2 py-0.5 border shrink-0 ${
                          unlocked
                            ? elite
                              ? "bg-purple-950 text-purple-300 border-purple-500/40"
                              : "bg-[#3b9dff]/15 text-[#9fd0ff] border-[#3b9dff]/40"
                            : "bg-slate-900 text-slate-600 border-slate-800"
                        }`}
                      >
                        [{unlocked ? "ОТКРЫТО" : progressText(ach)}]
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 pl-8">
                      {ach.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </SystemFrame>
    </div>
  );
}
