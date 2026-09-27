// مشاهد البرمجة: Git، واجهات البرمجة، وخط الاختبار والنشر.
export const git = {
  id: "git-version-control", title: "رحلة التعديل من ملفك إلى الفريق", w: 100, h: 50,
  nodes: [
    { id: "wd", kind: "code", x: 10, y: 50, label: "ملفاتك", sub: "working dir" }, { id: "stage", kind: "doc", x: 34, y: 50, label: "المنطقة المؤقتة", sub: "git add" }, { id: "local", kind: "git", x: 58, y: 50, label: "مستودعك", sub: "git commit", big: true },
    { id: "remote", kind: "cloud", x: 84, y: 50, label: "GitHub", sub: "push / pull" }, { id: "mate", kind: "users", x: 84, y: 12, label: "زميلك" },
  ],
  links: [["wd", "stage"], ["stage", "local"], ["local", "remote"], ["remote", "mate"]],
  steps: [
    { caption: "تعدّل ملفاً. Git يرى الفرق سطراً بسطر لكنه لا يحفظ شيئاً بعد.", hot: ["wd"] },
    { caption: "git add: تختار أي التغييرات تدخل اللقطة القادمة (يمكنك ترك تعديل تجريبي خارجها).", hot: ["wd", "stage"], packets: [{ from: "wd", to: "stage", label: "add" }] },
    { caption: "git commit: لقطة دائمة برسالة تشرح «لماذا»، لها بصمة فريدة. يمكنك الرجوع إليها بعد سنة.", hot: ["stage", "local"], packets: [{ from: "stage", to: "local", label: "commit", tone: "ok" }] },
    { caption: "git push: ترفع لقطاتك إلى المستودع المشترك؛ زميلك يسحبها بـpull. كل واحد يملك نسخة كاملة من التاريخ.", hot: ["local", "remote", "mate"], packets: [{ from: "local", to: "remote", label: "push", tone: "ok" }, { from: "remote", to: "mate", label: "pull", tone: "ok" }] },
    { caption: "الفروع: تعمل على ميزة في فرع منفصل، وحين تنضج تُدمج في الرئيسي بعد مراجعة (Pull Request). تعارض؟ Git يريك السطرين وتختار.", hot: ["local", "remote"], packets: [{ from: "mate", to: "remote" }, { from: "remote", to: "local", tone: "ok" }] },
  ],
};

export const apis = {
  id: "apis", title: "ماذا يحدث حين يطلب التطبيق «الطقس الآن»", w: 100, h: 50,
  nodes: [
    { id: "app", kind: "phone", x: 10, y: 50, label: "تطبيق الطقس" }, { id: "api", kind: "server", x: 42, y: 50, label: "واجهة API", sub: "api.weather.com", big: true }, { id: "db", kind: "db", x: 74, y: 24, label: "قاعدة البيانات" }, { id: "ext", kind: "cloud", x: 74, y: 78, label: "خدمة أقمار" },
    { id: "key", kind: "key", x: 26, y: 16, label: "مفتاح API" },
  ],
  links: [["app", "api"], ["api", "db"], ["api", "ext"], ["key", "app"]],
  steps: [
    { caption: "التطبيق لا يعرف كيف تُحسب توقعات الطقس؛ يطلبها فقط: GET /forecast?city=amman مع مفتاح يعرّفه.", hot: ["app", "key", "api"], packets: [{ from: "app", to: "api", label: "GET /forecast" }] },
    { caption: "الخادم يتحقق من المفتاح (من أنت؟ كم طلباً لك اليوم؟) ثم يجمع الجواب من قاعدة بياناته وخدمات أخرى.", hot: ["api", "db", "ext"], packets: [{ from: "api", to: "db" }, { from: "api", to: "ext" }, { from: "db", to: "api", tone: "ok" }, { from: "ext", to: "api", tone: "ok" }] },
    { caption: "الرد بصيغة متفق عليها (JSON) ورمز حالة: 200 نجاح، 401 مفتاح خاطئ، 429 تجاوزت الحد. التطبيق يعرض الأرقام فقط.", hot: ["api", "app"], packets: [{ from: "api", to: "app", label: "200 {temp: 31}", tone: "ok" }] },
    { caption: "العقد هو التوثيق: أي لغة وأي جهاز يستطيع طلب الواجهة نفسها. هكذا يظهر الطقس في ساعتك وسيارتك وتطبيق طرف ثالث.", hot: ["api"], packets: [{ from: "app", to: "api" }, { from: "api", to: "app", tone: "ok" }] },
  ],
};

export const cicd = {
  id: "testing-deployment", title: "من commit إلى المستخدمين بلا لمسة يد", w: 100, h: 50,
  nodes: [
    { id: "dev", kind: "code", x: 8, y: 50, label: "المطوّر" }, { id: "repo", kind: "git", x: 26, y: 50, label: "المستودع" }, { id: "ci", kind: "test", x: 46, y: 50, label: "الاختبارات", sub: "CI", big: true },
    { id: "build", kind: "box", x: 64, y: 50, label: "البناء" }, { id: "stage", kind: "server", x: 82, y: 22, label: "بيئة التجريب" }, { id: "prod", kind: "rocket", x: 82, y: 78, label: "الإنتاج" },
  ],
  links: [["dev", "repo"], ["repo", "ci"], ["ci", "build"], ["build", "stage"], ["stage", "prod"]],
  steps: [
    { caption: "المطوّر يرفع تعديلاً. خادم التكامل المستمر يلتقطه فوراً.", hot: ["dev", "repo", "ci"], packets: [{ from: "dev", to: "repo" }, { from: "repo", to: "ci" }] },
    { caption: "تعمل مئات الاختبارات الآلية: وحدات صغيرة، ثم تكامل، ثم سيناريوهات كاملة. اختبار فشل؟ التعديل يتوقف هنا ويعرف المطوّر خلال دقائق.", hot: ["ci"], packets: [{ from: "ci", to: "build", tone: "bad" }, { from: "ci", to: "repo", tone: "bad" }] },
    { caption: "نجحت: يُبنى التطبيق في حزمة (حاوية غالباً) وتُنشر في بيئة تجريب مطابقة للإنتاج ليجربها الفريق.", hot: ["ci", "build", "stage"], packets: [{ from: "ci", to: "build", tone: "ok" }, { from: "build", to: "stage", tone: "ok" }] },
    { caption: "النشر إلى الإنتاج تدريجياً: 5٪ من المستخدمين أولاً، تُراقب الأخطاء، ثم الجميع. خلل؟ رجوع فوري إلى الإصدار السابق. الشركات الكبيرة تنشر عشرات المرات يومياً.", hot: ["stage", "prod"], packets: [{ from: "stage", to: "prod", label: "5%", tone: "ok" }, { from: "stage", to: "prod", tone: "ok" }] },
  ],
};
