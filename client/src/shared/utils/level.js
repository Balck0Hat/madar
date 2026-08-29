// المستوى يقيس الجهد (نقاط الخبرة)؛ المستوى n يبدأ عند 50·n·(n−1) نقطة
export const levelFromXp = (xp) => {
  let n = 1;
  while (50 * (n + 1) * n <= xp) n++;
  return n;
};

export const xpForLevel = (n) => 50 * n * (n - 1);

export const levelTitle = (n) =>
  n >= 50 ? "شمس" : n >= 40 ? "نجم" : n >= 30 ? "منارة" : n >= 20 ? "مشعل" : n >= 10 ? "شعلة" : "شرارة";

export const levelProgress = (xp) => {
  const level = levelFromXp(xp);
  const cur = xp - xpForLevel(level);
  const need = xpForLevel(level + 1) - xpForLevel(level);
  return { level, cur, need };
};
