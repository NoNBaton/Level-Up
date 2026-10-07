export type ItemType = "frame" | "title";
export type Rarity = "common" | "rare" | "epic" | "legendary";
export type ItemSource = "default" | "achievement" | "shop" | "lootbox";

export type Item = {
  id: string;
  type: ItemType;
  name: string;
  rarity: Rarity;
  source: ItemSource;
  achievement?: string; // id достижения, которое открывает предмет
  price?: number; // цена в магазине (этап 3)
  color?: string; // только для рамок
  glow?: string; // "r,g,b", только для рамок
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
  // ---- Рамки ----
  { id: "frame_rank", type: "frame", name: "РАНГОВАЯ", rarity: "common", source: "default" },
  { id: "frame_emerald", type: "frame", name: "ИЗУМРУД", rarity: "common", source: "achievement", achievement: "day_complete", color: "#34d399", glow: "52,211,153" },
  { id: "frame_crimson", type: "frame", name: "БАГРОВАЯ", rarity: "rare", source: "shop", price: 150, color: "#ff4d6d", glow: "255,77,109" },
  { id: "frame_violet", type: "frame", name: "ФИОЛЕТ", rarity: "epic", source: "achievement", achievement: "streak_7", color: "#c084fc", glow: "192,132,252" },
  { id: "frame_gold", type: "frame", name: "ЗОЛОТАЯ", rarity: "legendary", source: "achievement", achievement: "boss_defeated", color: "#ffd34d", glow: "255,211,77" },
  { id: "frame_shadow", type: "frame", name: "ТЕНЬ МОНАРХА", rarity: "legendary", source: "lootbox", color: "#8b5cf6", glow: "139,92,246" },

  // ---- Титулы ----
  { id: "title_novice", type: "title", name: "НОВОБРАНЕЦ", rarity: "common", source: "default" },
  { id: "title_veteran", type: "title", name: "ВЕТЕРАН КОДА", rarity: "rare", source: "achievement", achievement: "level_5" },
  { id: "title_cyber", type: "title", name: "КИБЕР-ВОИН", rarity: "epic", source: "achievement", achievement: "streak_7" },
  { id: "title_bosshunter", type: "title", name: "ОХОТНИК НА БОССОВ", rarity: "legendary", source: "achievement", achievement: "boss_defeated" },
  { id: "title_team", type: "title", name: "КОМАНДА ОХОТНИКОВ", rarity: "epic", source: "achievement", achievement: "team_boss" },
  { id: "title_duelist", type: "title", name: "ДУЭЛЯНТ", rarity: "epic", source: "achievement", achievement: "duel_win" },
  { id: "title_legend", type: "title", name: "ЛЕГЕНДА СИСТЕМЫ", rarity: "legendary", source: "achievement", achievement: "streak_30" },
  { id: "title_monarch", type: "title", name: "ПОВЕЛИТЕЛЬ СИСТЕМЫ", rarity: "legendary", source: "achievement", achievement: "level_25" },
  { id: "title_anomaly", type: "title", name: "УБИЙЦА АНОМАЛИЙ", rarity: "rare", source: "shop", price: 200 },
  { id: "title_shadow", type: "title", name: "МОНАРХ ТЕНЕЙ", rarity: "legendary", source: "lootbox" },
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