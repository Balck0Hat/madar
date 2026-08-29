import { models } from "../../shared/utils/models.js";
import { parseUnitId } from "../../shared/utils/units.js";
import { DOMAINS } from "../../shared/data/tree.js";

const LIMIT = 20;
const SNIPPET = 140;
const FIELDS = "unitId title spark cards summary";
const DOMAIN_NAME = new Map(DOMAINS.map((d) => [d.id, d.name]));

// يحيّد رموز التعبير النمطي: مدخل المستخدم نصّ بحث لا نمط قابل للحقن
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// مقتطف ~140 حرفاً حول أول تطابق، والمطابَق محاط بـ «»
function snippet(text, rx) {
  const m = rx.exec(text || "");
  if (!m) return null;
  const pad = Math.max(0, Math.round((SNIPPET - m[0].length) / 2));
  const start = Math.max(0, m.index - pad);
  const end = Math.min(text.length, m.index + m[0].length + pad);
  const head = `${start > 0 ? "…" : ""}${text.slice(start, m.index)}`;
  return `${head}«${m[0]}»${text.slice(m.index + m[0].length, end)}${end < text.length ? "…" : ""}`;
}

// أولوية المقتطف: البطاقات ثم الخلاصة ثم الشرارة ثم العنوان
function firstSnippet(doc, rx) {
  const haystacks = [...(doc.cards || []).flatMap((c) => [c.h, c.p]), ...(doc.summary || []), doc.spark, doc.title];
  for (const text of haystacks) {
    const found = snippet(text, rx);
    if (found) return found;
  }
  return (doc.cards?.[0]?.p || doc.spark || doc.title || "").slice(0, SNIPPET);
}

// احتياطي: عبارة من كلمتين متفرقتين لا يلتقطها regex، فنسأل الفهرس النصي
async function byTextIndex(Unit, q) {
  try {
    return await Unit.find({ published: true, $text: { $search: q } }).select(FIELDS).limit(LIMIT).lean();
  } catch (err) {
    console.error("[search] text index unavailable:", err.message);
    return [];
  }
}

export async function search(q) {
  const Unit = models.Unit();
  const rx = new RegExp(escapeRegex(q), "i");
  const or = [{ title: rx }, { spark: rx }, { "cards.h": rx }, { "cards.p": rx }, { summary: rx }];
  let docs = await Unit.find({ published: true, $or: or }).select(FIELDS).limit(LIMIT).lean();
  if (!docs.length) docs = await byTextIndex(Unit, q);
  const results = docs.map((doc) => {
    const domain = parseUnitId(doc.unitId)?.domain;
    return {
      unitId: doc.unitId,
      title: doc.title,
      domain: domain || "center",
      domainName: DOMAIN_NAME.get(domain) || "المركز",
      snippet: firstSnippet(doc, rx),
    };
  });
  const lines = docs
    .flatMap((doc) => (doc.summary || []).filter((s) => rx.test(s)).map((line) => ({ unitId: doc.unitId, title: doc.title, line: snippet(line, rx) || line })))
    .slice(0, LIMIT);
  return { q, count: results.length, results, lines };
}
