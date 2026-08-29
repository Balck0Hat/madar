// مفتاح الأسبوع بمعيار ISO (الاثنين أول أيامه)؛ يُستخدم لتصفير نقاط الأسبوع ودوري الترتيب
export function weekKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return `${date.getUTCFullYear()}-W${Math.ceil(((date - yearStart) / 864e5 + 1) / 7)}`;
}

// نهاية الأسبوع الحالي (الأحد 23:59)
export function weekEnd(d = new Date()) {
  const end = new Date(d);
  const day = end.getDay() || 7;
  end.setDate(end.getDate() + (7 - day));
  end.setHours(23, 59, 59, 999);
  return end;
}
