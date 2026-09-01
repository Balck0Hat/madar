// توزيع عدد ثابت من المقاعد على فئات بنسبة أحجامها، بطريقة أكبر البواقي.
// يُستعمل في موضعين: حجز أسئلة الامتحان بنسب أنواع البنك، وسحب الامتحان
// بنسب المجالات. في الحالتين كان السحب الحرّ يعطي توزيعاً منحرفاً بصمت.
//
// counts: { key: available }  ·  want: عدد المقاعد  ·  floor: أقلّ حصة مضمونة لفئة غير فارغة
export function allocate(counts, want, { floor = 0 } = {}) {
  const keys = Object.keys(counts).filter((k) => (counts[k] || 0) > 0).sort();
  const total = keys.reduce((sum, k) => sum + counts[k], 0);
  if (!total || want <= 0) return {};

  const exact = {}, take = {};
  for (const k of keys) {
    exact[k] = (counts[k] / total) * want;
    // الحدّ الأدنى يمنع غياب فئة كاملة، والسقف يمنع طلب ما لا يوجد
    take[k] = Math.min(counts[k], Math.max(floor, Math.floor(exact[k])));
  }

  // إن تجاوز مجموع الحدود الدنيا المطلوبَ، ننزع من الأكبر حصةً أولاً
  let over = keys.reduce((sum, k) => sum + take[k], 0) - want;
  while (over > 0) {
    const from = keys.filter((k) => take[k] > 0).sort((a, b) => take[b] - take[a] || a.localeCompare(b))[0];
    if (!from) break;
    take[from]--; over--;
  }

  // الباقي للفئات الأكبر كسراً، ثم الأوفر، ثم أبجدياً — ليبقى التوزيع حتمياً
  const rank = [...keys].sort(
    (a, b) => (exact[b] % 1) - (exact[a] % 1) || counts[b] - counts[a] || a.localeCompare(b),
  );
  let left = want - keys.reduce((sum, k) => sum + take[k], 0);
  while (left > 0) {
    const before = left;
    for (const k of rank) {
      if (left === 0) break;
      if (take[k] < counts[k]) { take[k]++; left--; }
    }
    if (left === before) break; // نفد المتاح في كل الفئات
  }
  return take;
}
