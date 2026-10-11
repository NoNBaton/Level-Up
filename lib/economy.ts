export const QUEST_COINS = 5;
export const ANOMALY_COINS = 40;
export const BOSS_COINS = 100;

// Лутбоксы
export const ANOMALY_BOX_CHANCE = 60; // % шанс получить лутбокс за аномалию

export const BOX_WEIGHTS = {
  common: 55,
  rare: 28,
  epic: 14,
  legendary: 3,
} as const;

// Сколько монет дают за предмет, который уже есть
export const DUPLICATE_REFUND = {
  common: 25,
  rare: 75,
  epic: 200,
  legendary: 500,
} as const;