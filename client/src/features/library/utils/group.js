// يجمع التظليلات حسب الوحدة مع الحفاظ على ترتيب الخادم (الأحدث أولاً)،
// وداخل كل وحدة نرتّب حسب رقم الصفحة ليقرأها صاحبها بترتيب الدرس
export function groupByUnit(notes = []) {
  const order = [];
  const map = new Map();
  for (const note of notes) {
    if (!map.has(note.unitId)) { map.set(note.unitId, []); order.push(note.unitId); }
    map.get(note.unitId).push(note);
  }
  return order.map((unitId) => ({ unitId, notes: map.get(unitId).slice().sort((a, b) => a.page - b.page) }));
}
