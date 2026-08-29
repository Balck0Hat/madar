// النص الذي يُقرأ صوتياً لكل نوع صفحة: العنوان ثم المتن، بلا زخارف الواجهة
export function pageText(p, content, info) {
  if (!p || !content) return "";
  const join = (...parts) => parts.filter(Boolean).join("، ");
  switch (p.t) {
    case "spark": return join(info?.title, content.spark);
    case "goals": return join("بعد هذه الوحدة ستستطيع أن", ...(content.goals || []));
    case "card": return join(p.c?.h, p.c?.p);
    case "try": return join(content.tryIt?.title, content.tryIt?.text);
    case "deep": return join(content.deep?.title, content.deep?.why);
    case "thread": return join(content.thread?.text, content.thread?.q);
    case "end": return join("الخلاصة", ...(content.summary || []));
    default: return "";
  }
}
