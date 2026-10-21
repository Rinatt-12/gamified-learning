// Level N → Level N+1 үшін керек XP: 100 * N^1.5
export function xpForNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

// Жалпы XP-тан level есептеу
export function calculateLevel(totalXp: number): number {
  let level = 1;
  let xpNeeded = xpForNextLevel(level);
  let remaining = totalXp;
  
  while (remaining >= xpNeeded) {
    remaining -= xpNeeded;
    level++;
    xpNeeded = xpForNextLevel(level);
  }
  
  return level;
}

// Level ішіндегі прогресс (%)
export function levelProgress(totalXp: number): { current: number; needed: number; percent: number } {
  let level = 1;
  let xpNeeded = xpForNextLevel(level);
  let remaining = totalXp;
  
  while (remaining >= xpNeeded) {
    remaining -= xpNeeded;
    level++;
    xpNeeded = xpForNextLevel(level);
  }
  
  return {
    current: remaining,
    needed: xpNeeded,
    percent: Math.round((remaining / xpNeeded) * 100),
  };
}