# صيغة موضوعات خريطة القواعد — `grammar/topics/<branch>.js`

كل ملف يصدّر مصفوفة موضوعات فرع واحد بحسب `tree.js` (المعرّفات فيه ملزمة). كل موضوع **سطر واحد** (الملف ≤ 150 سطراً). العربية فصيحة سهلة موجّهة لمتعلم عربي؛ الإنجليزية طبيعية بريطانية الإملاء. علامات الاقتباس المزدوجة لسلاسل JS فقط؛ داخل النص ' أو «».

```js
export default [
  { id: "present-continuous", title: "المضارع المستمر", en: "Present Continuous", level: "A1", tag: "present",
    summary: "للحديث عمّا يحدث الآن أو في هذه الفترة.",
    form: ["Subject + am / is / are + verb-ing", "I am working · You are working · He / She / It is working · We / They are working", "النفي: am not / isn't / aren't · السؤال: Are you working?"],
    usage: ["فعل يحدث في لحظة الكلام (now, at the moment).", "حالة مؤقتة هذه الأيام.", "تغيّر أو تطوّر جارٍ.", "ترتيب مستقبلي مؤكد (غير رسمي)."],
    examples: [{ en: "I am studying English now.", ar: "أدرس الإنجليزية الآن." }, { en: "She is working at a hospital this month.", ar: "تعمل في مستشفى هذا الشهر." }],
    mistakes: [{ wrong: "She go to school now.", right: "She is going to school now.", note: "المستمر يحتاج be + ing." }, { wrong: "I am knowing him.", right: "I know him.", note: "أفعال الحالة (know, like, want) لا تأتي في المستمر." }],
    related: ["present-simple", "stative-verbs"] },
];
```

| الحقل | القاعدة |
|---|---|
| `level` | A1 · A2 · B1 · B2 · C1 (أدنى مستوى يُدرَّس فيه) |
| `tag` | وسم من `tags.js` لأقرب درس/تمرين (للزر «تدرّب»)؛ إن لم يوجد قريب استعمل الأقرب معنىً |
| `summary` | جملة واحدة: متى نستعمله |
| `form` | 2–4 أسطر: الصيغة بالرموز (Subject + …)، ثم أمثلة التصريف، ثم النفي والسؤال إن وُجدا. للموضوعات غير الصيغية (مثل ترتيب الصفات) اكتب القاعدة نفسها |
| `usage` | 3–5 نقاط عربية، كل نقطة قاعدة استعمال واحدة، قد تحمل الكلمات الإنجليزية الدالة بين قوسين |
| `examples` | 3–5 أمثلة `{ en, ar }`، الجزء الذي يجسّد القاعدة داخل الجملة الإنجليزية، والعربية ترجمة طبيعية |
| `mistakes` | 2–4 أخطاء يقع فيها العرب تحديداً `{ wrong, right, note }`؛ `note` عربية قصيرة تشرح السبب |
| `related` | 1–3 معرّفات موضوعات من الشجرة |

لا تنسخ من كتب أو مواقع؛ الأمثلة أصلية. تجنّب التعميم الخاطئ (مثل «الحاضر التام لا يأتي مع زمن محدد» صحيح، أما «have breakfast لا eat breakfast» فخاطئ).
