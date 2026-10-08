export type ItemType = "frame" | "title" | "pet";
export type Rarity = "common" | "rare" | "epic" | "legendary";
export type ItemSource = "default" | "achievement" | "shop" | "lootbox";

export type Item = {
  id: string;
  type: ItemType;
  name: string;
  rarity: Rarity;
  source: ItemSource;
  achievement?: string; // id достижения, которое открывает предмет
  price?: number; // цена в магазине
  color?: string; // только для рамок
  glow?: string; // "r,g,b", только для рамок
  emoji?: string; // только для питомцев
};

export const DEFAULT_FRAME = "frame_rank";

export const RARITY_COLOR: Record<Rarity, string> = {
  common: "#94a3b8",
  rare: "#5ecbff",
  epic: "#c084fc",
  legendary: "#ffd34d",
};

export const SOURCE_HINT: Record<ItemSource, string> = {
  default: "",
  achievement: "ЗА ДОСТИЖЕНИЕ",
  shop: "МАГАЗИН",
  lootbox: "ЛУТБОКС",
};

export const ITEMS: Item[] = [
  // ================= РАМКИ =================
  { id: "frame_rank", type: "frame", name: "РАНГОВАЯ", rarity: "common", source: "default" },
  // за достижения
  { id: "frame_emerald", type: "frame", name: "ИЗУМРУД", rarity: "common", source: "achievement", achievement: "day_complete", color: "#34d399", glow: "52,211,153" },
  { id: "frame_steel", type: "frame", name: "СТАЛЬ", rarity: "common", source: "achievement", achievement: "level_5", color: "#cbd5e1", glow: "203,213,225" },
  { id: "frame_team", type: "frame", name: "ОТРЯД", rarity: "rare", source: "achievement", achievement: "team_boss", color: "#60a5fa", glow: "96,165,250" },
  { id: "frame_duel", type: "frame", name: "ДУЭЛЬНАЯ", rarity: "rare", source: "achievement", achievement: "duel_win", color: "#fbbf24", glow: "251,191,36" },
  { id: "frame_violet", type: "frame", name: "ФИОЛЕТ", rarity: "epic", source: "achievement", achievement: "streak_7", color: "#c084fc", glow: "192,132,252" },
  { id: "frame_gold", type: "frame", name: "ЗОЛОТАЯ", rarity: "legendary", source: "achievement", achievement: "boss_defeated", color: "#ffd34d", glow: "255,211,77" },
  // магазин
  { id: "frame_ice", type: "frame", name: "ЛЕДЯНАЯ", rarity: "rare", source: "shop", price: 120, color: "#7dd3fc", glow: "125,211,252" },
  { id: "frame_crimson", type: "frame", name: "БАГРОВАЯ", rarity: "rare", source: "shop", price: 150, color: "#ff4d6d", glow: "255,77,109" },
  { id: "frame_pink", type: "frame", name: "РОЗОВЫЙ НЕОН", rarity: "rare", source: "shop", price: 200, color: "#f0abfc", glow: "240,171,252" },
  { id: "frame_toxic", type: "frame", name: "ТОКСИК", rarity: "rare", source: "shop", price: 250, color: "#a3e635", glow: "163,230,53" },
  { id: "frame_sunset", type: "frame", name: "ЗАКАТ", rarity: "epic", source: "shop", price: 300, color: "#fb923c", glow: "251,146,60" },
  { id: "frame_blood", type: "frame", name: "КРОВАВАЯ ЛУНА", rarity: "epic", source: "shop", price: 600, color: "#dc2626", glow: "220,38,38" },
  { id: "frame_aurora", type: "frame", name: "АВРОРА", rarity: "epic", source: "shop", price: 700, color: "#2dd4bf", glow: "45,212,191" },
  { id: "frame_platinum", type: "frame", name: "ПЛАТИНА", rarity: "legendary", source: "shop", price: 1500, color: "#e5e7eb", glow: "229,231,235" },
  // лутбокс
  { id: "frame_void", type: "frame", name: "ПУСТОТА", rarity: "epic", source: "lootbox", color: "#6366f1", glow: "99,102,241" },
  { id: "frame_shadow", type: "frame", name: "ТЕНЬ МОНАРХА", rarity: "legendary", source: "lootbox", color: "#8b5cf6", glow: "139,92,246" },

  // ================= ТИТУЛЫ =================
  { id: "title_novice", type: "title", name: "НОВОБРАНЕЦ", rarity: "common", source: "default" },
  // за достижения
  { id: "title_firststep", type: "title", name: "ПЕРВОПРОХОДЕЦ", rarity: "common", source: "achievement", achievement: "first_task" },
  { id: "title_streak3", type: "title", name: "НЕСГИБАЕМЫЙ", rarity: "common", source: "achievement", achievement: "streak_3" },
  { id: "title_dayclose", type: "title", name: "ДОВОДЯЩИЙ ДО КОНЦА", rarity: "rare", source: "achievement", achievement: "day_complete" },
  { id: "title_veteran", type: "title", name: "ВЕТЕРАН КОДА", rarity: "rare", source: "achievement", achievement: "level_5" },
  { id: "title_cyber", type: "title", name: "КИБЕР-ВОИН", rarity: "epic", source: "achievement", achievement: "streak_7" },
  { id: "title_team", type: "title", name: "КОМАНДА ОХОТНИКОВ", rarity: "epic", source: "achievement", achievement: "team_boss" },
  { id: "title_duelist", type: "title", name: "ДУЭЛЯНТ", rarity: "epic", source: "achievement", achievement: "duel_win" },
  { id: "title_bosshunter", type: "title", name: "ОХОТНИК НА БОССОВ", rarity: "legendary", source: "achievement", achievement: "boss_defeated" },
  { id: "title_legend", type: "title", name: "ЛЕГЕНДА СИСТЕМЫ", rarity: "legendary", source: "achievement", achievement: "streak_30" },
  { id: "title_monarch", type: "title", name: "ПОВЕЛИТЕЛЬ СИСТЕМЫ", rarity: "legendary", source: "achievement", achievement: "level_25" },
  // магазин
  { id: "title_nightwatch", type: "title", name: "НОЧНОЙ ДОЗОР", rarity: "common", source: "shop", price: 80 },
  { id: "title_midnight", type: "title", name: "ПОЛУНОЧНИК", rarity: "common", source: "shop", price: 90 },
  { id: "title_grinder", type: "title", name: "ТРУДОГОЛИК", rarity: "common", source: "shop", price: 100 },
  { id: "title_anomaly", type: "title", name: "УБИЙЦА АНОМАЛИЙ", rarity: "rare", source: "shop", price: 200 },
  { id: "title_iron", type: "title", name: "ЖЕЛЕЗНАЯ ВОЛЯ", rarity: "rare", source: "shop", price: 220 },
  { id: "title_shadowhunter", type: "title", name: "ОХОТНИК ИЗ ТЕНИ", rarity: "rare", source: "shop", price: 250 },
  { id: "title_pack", type: "title", name: "ВОЖАК СТАИ", rarity: "rare", source: "shop", price: 300 },
  { id: "title_collector", type: "title", name: "КОЛЛЕКЦИОНЕР", rarity: "rare", source: "shop", price: 350 },
  { id: "title_hunter", type: "title", name: "ВЫСШИЙ ОХОТНИК", rarity: "epic", source: "shop", price: 600 },
  { id: "title_abyss", type: "title", name: "ВЗГЛЯД В БЕЗДНУ", rarity: "epic", source: "shop", price: 700 },
  { id: "title_rich", type: "title", name: "ЗОЛОТАЯ ЖИЛА", rarity: "epic", source: "shop", price: 800 },
  // лутбокс
  { id: "title_shadow", type: "title", name: "МОНАРХ ТЕНЕЙ", rarity: "legendary", source: "lootbox" },
  { id: "title_dungeonking", type: "title", name: "КОРОЛЬ ПОДЗЕМЕЛИЙ", rarity: "legendary", source: "lootbox" },

  // ================= ПИТОМЦЫ =================
  // за достижения
  { id: "pet_pup", type: "pet", name: "ЩЕНОК ТЕНИ", rarity: "common", source: "achievement", achievement: "first_task", emoji: "🐶" },
  { id: "pet_bear", type: "pet", name: "МЕДВЕДЬ-СТРАЖ", rarity: "epic", source: "achievement", achievement: "team_boss", emoji: "🐻" },
  { id: "pet_lion", type: "pet", name: "ЛЕВ-ДУЭЛЯНТ", rarity: "epic", source: "achievement", achievement: "duel_win", emoji: "🦁" },
  { id: "pet_bossling", type: "pet", name: "ДЕТЁНЫШ БОССА", rarity: "epic", source: "achievement", achievement: "boss_defeated", emoji: "🐲" },
  { id: "pet_phoenix", type: "pet", name: "ФЕНИКС", rarity: "legendary", source: "achievement", achievement: "streak_30", emoji: "🔥" },
  // магазин
  { id: "pet_rat", type: "pet", name: "ПОДЗЕМНАЯ КРЫСА", rarity: "common", source: "shop", price: 120, emoji: "🐀" },
  { id: "pet_cat", type: "pet", name: "НОЧНОЙ КОТ", rarity: "common", source: "shop", price: 150, emoji: "🐱" },
  { id: "pet_bat", type: "pet", name: "ПЕЩЕРНАЯ ЛЕТУЧКА", rarity: "common", source: "shop", price: 180, emoji: "🦇" },
  { id: "pet_owl", type: "pet", name: "СОВА-НАБЛЮДАТЕЛЬ", rarity: "rare", source: "shop", price: 350, emoji: "🦉" },
  { id: "pet_snake", type: "pet", name: "ЯДОВИТЫЙ ЗМЕЙ", rarity: "rare", source: "shop", price: 400, emoji: "🐍" },
  { id: "pet_fox", type: "pet", name: "ЛИС-ИЛЛЮЗИОНИСТ", rarity: "rare", source: "shop", price: 450, emoji: "🦊" },
  { id: "pet_spider", type: "pet", name: "ТЕНЕВОЙ ПАУК", rarity: "rare", source: "shop", price: 500, emoji: "🕷️" },
  { id: "pet_ant", type: "pet", name: "ТЕНЕВОЙ МУРАВЕЙ", rarity: "epic", source: "shop", price: 900, emoji: "🐜" },
  { id: "pet_eagle", type: "pet", name: "ГРОЗОВОЙ ОРЁЛ", rarity: "epic", source: "shop", price: 1000, emoji: "🦅" },
  { id: "pet_wolf", type: "pet", name: "ТЕНЕВОЙ ВОЛК", rarity: "epic", source: "shop", price: 1100, emoji: "🐺" },
  { id: "pet_dragon", type: "pet", name: "ДРАКОН БЕЗДНЫ", rarity: "legendary", source: "shop", price: 2500, emoji: "🐉" },
  // лутбокс
  { id: "pet_trex", type: "pet", name: "ДРЕВНИЙ ЯЩЕР", rarity: "epic", source: "lootbox", emoji: "🦖" },
  { id: "pet_ghost", type: "pet", name: "ДУХ ПОДЗЕМЕЛЬЯ", rarity: "legendary", source: "lootbox", emoji: "👻" },
  { id: "pet_unicorn", type: "pet", name: "АСТРАЛЬНЫЙ ЕДИНОРОГ", rarity: "legendary", source: "lootbox", emoji: "🦄" },
];

export const ITEM_BY_ID: Record<string, Item> = Object.fromEntries(
  ITEMS.map((i) => [i.id, i]),
);

// Что у игрока есть: бесплатное + открытое достижениями + купленное/выпавшее
export function ownedItemIds(
  achievements: string[],
  inventory: string[],
): Set<string> {
  const owned = new Set<string>();
  for (const it of ITEMS) {
    if (it.source === "default") owned.add(it.id);
    else if (
      it.source === "achievement" &&
      it.achievement &&
      achievements.includes(it.achievement)
    ) {
      owned.add(it.id);
    }
  }
  for (const id of inventory) if (ITEM_BY_ID[id]) owned.add(id);
  return owned;
}

// Цвета рамки. null = использовать цвет ранга
export function frameColors(frameId?: string) {
  const it = frameId ? ITEM_BY_ID[frameId] : undefined;
  if (!it || it.type !== "frame" || !it.color || !it.glow) return null;
  return { color: it.color, glow: it.glow };
}
export const PET_MODELS: Record<
  string,
  { scale?: number; y?: number; color?: string }
> = {
  pet_wolf: {},
  pet_rat: {},
  pet_cat: {},
  pet_bat: { scale: 0.020 },
  pet_owl: { scale: 0.45 },
  pet_snake: { scale: 0.015 },
  pet_fox: {},
  pet_spider: {},
  pet_ant: { scale: 0.010, y: -0.4 },
  pet_eagle: {y: 0.5},
  pet_dragon: { scale: 0.045 },
  pet_pup: {},
};
export const petModelUrl = (id: string) => `/models/pets/${id}.glb`;