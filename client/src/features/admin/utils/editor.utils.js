import { DOMAINS } from "../../../shared/data/domains";
import { CENTER } from "../../../shared/data/curriculum";
import { uid, unitInfo } from "../../../shared/utils/units";

// تحويل بين النص متعدد الأسطر والمصفوفات في حقول المحرّر
export const toLines = (arr) => (arr || []).join("\n");
export const fromLines = (s) => (s || "").split("\n").map((x) => x.trim()).filter(Boolean);
export const fromCsv = (s) => (s || "").split(/[،,]/).map((x) => x.trim()).filter(Boolean);

// كل معرّفات الوحدات الممكنة (243 + 3) مع عناوينها من الشجرة
export const ALL_UNIT_IDS = [
  ...CENTER.map((_, i) => `center-${i + 1}`),
  ...DOMAINS.flatMap((d) => d.rings.flatMap((ring, r) => ring.map((_, i) => uid(d.id, r, i)))),
];

export const emptyQuestion = (n) => ({ qid: `q${n}`, t: "mcq", q: "", opts: ["", "", "", ""], a: 0, why: "", keywords: [] });

export const emptyUnit = (unitId) => ({
  title: unitInfo(unitId).title,
  hero: { num: "", label: "" },
  spark: "",
  goals: [],
  cards: [{ h: "", p: "", art: "wheel" }],
  tryIt: { title: "", text: "" },
  deep: { title: "", why: "" },
  summary: [],
  questions: [emptyQuestion(1)],
  published: false,
});

// يهيّئ الجسم للإرسال: يحذف الحقول الفارغة الاختيارية ويضبط أنواع الإجابات
export function normalizeUnit(u) {
  const clean = { ...u };
  if (!clean.hero?.num && !clean.hero?.label) delete clean.hero;
  if (!clean.tryIt?.title && !clean.tryIt?.text) delete clean.tryIt;
  if (!clean.deep?.title && !clean.deep?.why) delete clean.deep;
  if (!clean.thread?.to) delete clean.thread;
  if (!clean.spark) delete clean.spark;
  delete clean.unitId; delete clean._id; delete clean.__v; delete clean.createdAt; delete clean.updatedAt; delete clean.updatedBy;
  clean.cards = (clean.cards || []).filter((c) => c.h || c.p).map(({ h, p, art, img }) => ({ h, p, art: art || "wheel", ...(img ? { img } : {}) }));
  clean.questions = (clean.questions || []).map((q) => {
    const base = { qid: q.qid, t: q.t, q: q.q, why: q.why || "" };
    if (q.keywords?.length) base.keywords = q.keywords;
    if (q.t === "mcq") return { ...base, opts: q.opts.filter(Boolean), a: Number(q.a) };
    if (q.t === "tf") return { ...base, a: q.a === true || q.a === "true" };
    if (q.t === "fill") return { ...base, a: Array.isArray(q.a) ? q.a : fromCsv(q.a) };
    if (q.t === "order") return { ...base, items: q.items.filter(Boolean), a: Array.isArray(q.a) ? q.a.map(Number) : fromCsv(q.a).map(Number) };
    return base;
  });
  return clean;
}

export const ART_KEYS = ["wheel", "brain", "eye", "cycle", "wash", "transfer", "shield", "bed", "drop", "sunmoon", "list", "curve", "bars", "network"];
export const Q_TYPES = [["mcq", "اختيار"], ["tf", "صح/خطأ"], ["fill", "فراغ"], ["order", "ترتيب"], ["open", "مفتوح"]];
