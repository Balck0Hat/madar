// وسوم أسئلة القواعد والمفردات: كل سؤال يحمل وسماً واحداً، فتُحسب نقاط الضعف
// حسب الموضوع لا حسب المستوى فقط، وتُبنى منها خطة الأسبوعين في التقرير.
// tip: ماذا يدرس من يضعف في هذا الموضوع (جملة واحدة عملية).
export const TAGS = {
  "be-have": { label: "فعل الكينونة والملكية", tip: "راجع am/is/are و have/has مع كل ضمير، واكتب 20 جملة عن نفسك وعائلتك." },
  present: { label: "المضارع البسيط والمستمر", tip: "الفرق بين ما يتكرر (I work) وما يحدث الآن (I'm working)، مع الـ s في الغائب." },
  past: { label: "الماضي البسيط والمستمر", tip: "احفظ 40 فعلاً شاذاً شائعاً، ثم اكتب يومياتك بالأمس في 10 جمل." },
  future: { label: "المستقبل", tip: "will للقرار اللحظي والتوقع، going to للخطة، والمضارع المستمر للموعد المحدد." },
  perfect: { label: "الأزمنة التامة", tip: "have done مقابل did: النتيجة الآن مقابل الحدث المنتهي؛ ثم had done للماضي الأسبق." },
  modals: { label: "الأفعال الناقصة", tip: "must/have to/should/might/can't: درجة الإلزام ودرجة اليقين، مع صيغة الماضي should have done." },
  conditionals: { label: "الجمل الشرطية", tip: "الأنواع صفر وواحد واثنان وثلاثة، ثم المختلط: إن كان الشرط ماضياً والنتيجة حاضرة." },
  passive: { label: "المبني للمجهول", tip: "be + التصريف الثالث في كل زمن، ومتى يُستعمل: حين الفاعل مجهول أو غير مهم." },
  articles: { label: "أدوات التعريف", tip: "a للمرة الأولى وthe للمعروف، ولا أداة مع الجمع والمعاني العامة (Life is short)." },
  prepositions: { label: "حروف الجر", tip: "احفظها مع الكلمة لا وحدها: depend on, good at, in the morning, on Monday, at night." },
  pronouns: { label: "الضمائر وأسماء الإشارة", tip: "ضمائر الفاعل والمفعول والملكية والانعكاس (myself)، وthis/that/these/those." },
  comparatives: { label: "المقارنة والتفضيل", tip: "er/est للقصير وmore/most للطويل، والشواذ good/better/best، وas … as." },
  quantifiers: { label: "الكمّ والعدّ", tip: "much/many/a few/a little/some/any: المعدود وغير المعدود، والإثبات والنفي." },
  questions: { label: "الأسئلة والنفي", tip: "ترتيب السؤال (do/does/did + الفاعل + الفعل الأصلي) والأسئلة الذيلية (isn't it?)." },
  relative: { label: "جمل الوصل", tip: "who للعاقل وwhich لغيره وwhose للملكية، ومتى تُحذف that، والفاصلة للجملة غير المحدِّدة." },
  reported: { label: "الكلام المنقول", tip: "إرجاع الزمن خطوة (is → was)، وتغيير الضمائر والظروف (today → that day)." },
  "gerund-inf": { label: "المصدر والاسم الفعلي", tip: "enjoy doing لكن want to do؛ احفظ قوائم الأفعال، وstop doing مقابل stop to do." },
  linking: { label: "أدوات الربط", tip: "although/despite/however/therefore/whereas: ما بعد كل منها اسم أم جملة، وموضع الفاصلة." },
  inversion: { label: "القلب والتوكيد", tip: "Not only … but also, Rarely have I, Had I known: تراكيب C1 للكتابة الرسمية." },
  "word-form": { label: "اشتقاق الكلمات", tip: "من الجذر: succeed/success/successful/successfully. تعلّم اللواحق -tion -ness -ive -ly." },
  "daily-vocab": { label: "المفردات اليومية", tip: "الأشياء حولك والأفعال اليومية: 10 كلمات كل يوم بجملة لكل كلمة." },
  collocation: { label: "المتلازمات اللفظية", tip: "make a decision لا do، heavy rain لا strong: احفظ الكلمة مع رفيقتها." },
  phrasal: { label: "الأفعال المركّبة", tip: "give up, put off, look after, run out of: احفظها في سياق قصة لا في قائمة." },
  "academic-vocab": { label: "المفردات الأكاديمية", tip: "قائمة الكلمات الأكاديمية (AWL): significant, establish, assess, consequently؛ اقرأ مقالاً قصيراً يومياً." },
  confusables: { label: "الكلمات المتشابهة", tip: "affect/effect, lend/borrow, say/tell, raise/rise: أزواج تُخلط، اجمعها في جدول مع مثال." },
  idiom: { label: "التعابير الاصطلاحية", tip: "التعابير الشائعة في المحادثة والامتحان (on the fence, hit the nail on the head) بمعناها الحرفي والمجازي." },
};

export const TAG_IDS = Object.keys(TAGS);

// أنواع أسئلة القراءة والاستماع، لتقرير النتيجة
export const QKINDS = {
  detail: "التفاصيل", main: "الفكرة الرئيسة", vocab: "معنى الكلمة من السياق", inference: "الاستنتاج",
  tfng: "صح / خطأ / غير مذكور", gap: "إكمال الفراغ", attitude: "موقف المتكلم", purpose: "الغرض",
};
