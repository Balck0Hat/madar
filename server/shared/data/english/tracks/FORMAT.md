# صيغة محتوى المسارات (آيلتس، توفل، الإنجليزية العامة)

كل النصوص أصلية (لا نسخ من امتحانات أو كتب). الأسئلة بالإنجليزية، `why` بالعربية الفصيحة السهلة تقتبس العبارة الإنجليزية الدالة. علامات الاقتباس المزدوجة لسلاسل JS فقط؛ داخل النص ' أو «». كل ملف ≤ 150 سطراً.

## وحدة تدريب (module) — `tracks/<track>/<id>.js`
```js
export default {
  id: "ielts-reading-1", track: "ielts", skill: "reading", title: "Academic Reading · Test 1", minutes: 60, band: "ielts-reading",
  sections: [
    { id: "p1", title: "The lost art of navigation", intro: "You should spend about 20 minutes on Questions 1–13.",
      paragraphs: [{ label: "A", text: "…" }, { label: "B", text: "…" }],   // قراءة: فقرات موسومة بحرف
      // أو للاستماع بدل paragraphs:  accent: "gb", lines: [{ who: "Man", text: "…" }, { who: "Woman", text: "…" }]
      qs: [ … ] },
  ],
};
```
- `band`: ielts-reading | ielts-listening | toefl-reading | toefl-listening (يحدد جدول التحويل).
- `who` في الاستماع: Man, Woman, Man2, Woman2, Speaker فقط (الأصوات تُختار بها). النص يُقرأ صوتياً: اختصارات، أرقام وأوقات بالحروف، بلا أرقام ولا أقواس ولا رموز.

## أنواع الأسئلة (`type`) — كل سؤال يحمل `k` (نوعه للتقرير) و`why`
| type | الحقول | ملاحظات |
|---|---|---|
| `mc` | `q, opts (2–8), a: index` | الافتراضي. الخيارات كاملة الجمل لا حروفاً فقط |
| `tfng` | `q, opts: ["True","False","Not given"], a: 0–2` | قراءة |
| `ynng` | `q, opts: ["Yes","No","Not given"], a: 0–2` | لآراء الكاتب |
| `gap` | `q` فيه `___` واحد، `answers: ["…"]`, `limit: 1–3` | كلمة إلى ثلاث كلمات و/أو رقم من النص؛ `answers` كل الصيغ المقبولة بحروف صغيرة |
| `heading` | `q: "Paragraph B", opts: [قائمة العناوين i–viii], a: index` | كل سؤال يحمل القائمة كاملة نفسها؛ العناوين أكثر من الفقرات بـ2–3 |
| `match` | `q: "…statement…", opts: ["A","B",…] أو أسماء, a: index` | أي فقرة تحوي المعلومة، أو مَن قال ماذا |
| `multi` | `q, opts (6), a: [3 indexes], pick: 3` | ملخّص توفل: اختر ثلاثاً؛ درجة جزئية |

`k` من: detail, main, vocab, inference, tfng, ynng, gap, heading, match, purpose, attitude, insert, summary, negative (توفل: NOT/EXCEPT), function (استماع توفل: لماذا قال).

## درس الإنجليزية العامة — `tracks/general/<tag>.js`
```js
export default {
  id: "perfect", tag: "perfect", title: "الأزمنة التامة", level: "B1",
  explain: [
    { h: "متى نستعمل المضارع التام", p: "…شرح عربي 3–5 جمل…", ex: [{ en: "I have lost my keys.", ar: "أضعت مفاتيحي (وما زالت ضائعة)." }] },
  ],
  qs: [ { q: "…", opts: ["…","…","…","…"], a: 1, why: "…" } ],   // 8 أسئلة جديدة، لا تكرر بنك اختبار المستوى
};
```

## مهام الكتابة — `tracks/<track>/writing.js`
```js
export default [
  { id: "ielts-w1-1", task: 1, title: "Task 1 · Table", minutes: 20, words: 150, rubric: "ielts-task1",
    prompt: "The table below shows … Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    data: { kind: "table", caption: "…", columns: ["Country", "2000", "2020"], rows: [["…", "…", "…"]] } },
  { id: "ielts-w2-1", task: 2, title: "Task 2 · Essay", minutes: 40, words: 250, rubric: "ielts-task2", prompt: "…" },
  { id: "toefl-wd-1", task: "discussion", title: "Academic Discussion", minutes: 10, words: 100, rubric: "toefl-discussion",
    prompt: "…professor's post…", posts: [{ who: "Professor", text: "…" }, { who: "Student A", text: "…" }, { who: "Student B", text: "…" }] },
];
```
