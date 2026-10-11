import { ITEMS, type Rarity } from "@/lib/items";
import { BOX_WEIGHTS } from "@/lib/economy";

export type BoxTier = "normal" | "rare" | "legendary";

export const BOX_TIERS: BoxTier[] = ["normal", "rare", "legendary"];
export const RARITIES: Rarity[] = ["common", "rare", "epic", "legendary"];

// Поле в базе для каждого вида коробки
export const BOX_FIELD = {
  normal: "lootboxes",
  rare: "lootboxesRare",
  legendary: "lootboxesLegendary",
} as const;

export const BOX_INFO: Record<
  BoxTier,
  { name: string; price: number; color: string; hint: string }
> = {
  normal: {
    name: "ОБЫЧНЫЙ ЛУТБОКС",
    price: 150,
    color: "#fbbf24",
    hint: "ОБЫЧНЫЕ ШАНСЫ",
  },
  rare: {
    name: "РЕДКИЙ КОНТЕЙНЕР",
    price: 400,
    color: "#5ecbff",
    hint: "МИНИМУМ РЕДКИЙ ПРЕДМЕТ",
  },
  legendary: {
    name: "ЛЕГЕНДАРНЫЙ САРКОФАГ",
    price: 1000,
    color: "#c084fc",
    hint: "МИНИМУМ ЭПИЧЕСКИЙ · ШАНС ЛЕГЕНДАРНОГО ×2",
  },
};

export function isTier(v: unknown): v is BoxTier {
  return v === "normal" || v === "rare" || v === "legendary";
}

// Веса редкостей для каждого вида коробки
export function tierWeights(tier: BoxTier): Record<Rarity, number> {
  const w: Record<Rarity, number> = {
    common: BOX_WEIGHTS.common,
    rare: BOX_WEIGHTS.rare,
    epic: BOX_WEIGHTS.epic,
    legendary: BOX_WEIGHTS.legendary,
  };
  if (tier === "rare") {
    w.common = 0;
  } else if (tier === "legendary") {
    w.common = 0;
    w.rare = 0;
    w.legendary = Math.max(1, w.legendary * 2);
  }
  return w;
}

// Шансы в процентах, для показа игроку
export function tierChances(tier: BoxTier): Record<Rarity, number> {
  const w = tierWeights(tier);
  const total = RARITIES.reduce((s, r) => s + w[r], 0) || 1;
  const out = {} as Record<Rarity, number>;
  for (const r of RARITIES) {
    out[r] = Math.round((w[r] / total) * 1000) / 10;
  }
  return out;
}

// В лутбокс попадают предметы из магазина и из лутбокса
export const POOL = ITEMS.filter(
  (i) => i.source === "shop" || i.source === "lootbox",
);

// Предметы, которые реально могут выпасть из этого вида коробки
export function poolFor(tier: BoxTier) {
  const w = tierWeights(tier);
  return POOL.filter((i) => w[i.rarity] > 0);
}