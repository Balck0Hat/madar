// أقسام الدرس وعناوينها في مكان واحد.
// لماذا هنا لا داخل UnitScreen: الوضعان (بطاقات/تمرير) والفهرس يجب أن يروا
// الترتيب نفسه بالضبط، وإلا اختلف «موضع القراءة» بين الوضعين وضاع الاستئناف.

const LABEL = { spark: "الشرارة", goals: "الأهداف", card: "الدرس", try: "جرّب", deep: "التعمق", thread: "الخيط", end: "الخلاصة" };

// كل قسم مشروط بوجود مادته: الوحدة المقفلة (أو الناقصة) تعود ببعض الحقول فقط،
// ولا يصح أن تنهار الشاشة على حقل غائب.
export const buildPages = (content) => {
  const c = content || {};
  return [
    { t: "spark" },
    ...(c.goals?.length ? [{ t: "goals" }] : []),
    // n = رقم البطاقة داخل الدرس، لا رقم الصفحة: الأقسام قبلها قد تغيب
    ...(c.cards || []).map((card, i) => ({ t: "card", c: card, n: i + 1 })),
    ...(c.tryIt ? [{ t: "try" }] : []),
    ...(c.deep ? [{ t: "deep" }] : []),
    ...(c.thread ? [{ t: "thread" }] : []),
    ...(c.summary?.length ? [{ t: "end" }] : []),
  ];
};

// عنوان مختصر للشريط العلوي (نوع القسم)
export const shortLabel = (p) => LABEL[p?.t] || "";

// عنوان القسم في الفهرس: البطاقة تُعرف بعنوانها هي لا بكلمة «الدرس»
export const pageTitle = (p) => (p?.t === "card" ? p.c?.h || LABEL.card : LABEL[p?.t] || "");

export const pageTitles = (pages) => pages.map(pageTitle);
