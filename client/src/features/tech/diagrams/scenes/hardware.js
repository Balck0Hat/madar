// مشاهد العتاد: دورة المعالج، الذاكرة مقابل التخزين، وبطاقة الرسوم.
export const cpuCycle = {
  id: "how-cpu-executes", title: "دورة المعالج: اجلب، افهم، نفّذ", w: 100, h: 56,
  nodes: [
    { id: "ram", kind: "ram", x: 10, y: 50, label: "الذاكرة", sub: "التعليمات والبيانات" }, { id: "cache", kind: "layers", x: 34, y: 50, label: "الكاش", sub: "نسخة قريبة" },
    { id: "ctl", kind: "cog", x: 62, y: 20, label: "وحدة التحكم", sub: "تفكّ التعليمة" }, { id: "alu", kind: "cpu", x: 62, y: 78, label: "وحدة الحساب", sub: "ALU", big: true }, { id: "reg", kind: "binary", x: 86, y: 50, label: "المسجّلات", sub: "أسرع ذاكرة" },
  ],
  links: [["ram", "cache"], ["cache", "ctl"], ["cache", "alu"], ["ctl", "alu"], ["alu", "reg"], ["ctl", "reg"]],
  steps: [
    { caption: "اجلب: يقرأ المعالج التعليمة التالية من الذاكرة (عبر الكاش إن كانت فيه؛ الكاش أسرع بعشرات المرات).", hot: ["ram", "cache", "ctl"], packets: [{ from: "ram", to: "cache", label: "ADD" }, { from: "cache", to: "ctl" }] },
    { caption: "افهم: وحدة التحكم تفكّ التعليمة: «اجمع ما في المسجّل A مع ما في B». التعليمة مجرد أرقام لها معنى متفق عليه.", hot: ["ctl"] },
    { caption: "نفّذ: وحدة الحساب تجمع الرقمين في نانو ثانية.", hot: ["alu", "reg"], packets: [{ from: "reg", to: "alu" }, { from: "ctl", to: "alu" }] },
    { caption: "اكتب: النتيجة تعود إلى مسجّل ثم إلى الذاكرة إن لزم. الدورة كلها تتكرر مليارات المرات في الثانية (3 غيغاهرتز = 3 مليارات نبضة).", hot: ["alu", "reg", "ram"], packets: [{ from: "alu", to: "reg", tone: "ok" }, { from: "cache", to: "ram", tone: "ok" }] },
    { caption: "لماذا الكاش؟ الذاكرة أبطأ من المعالج بمئة مرة؛ لو انتظرها في كل تعليمة لضاع معظم الوقت. النوى المتعددة تنفذ دورات متوازية.", hot: ["cache", "ram"], packets: [{ from: "ram", to: "cache", tone: "bad" }, { from: "cache", to: "ctl", tone: "ok" }] },
  ],
};

export const ramVsStorage = {
  id: "ram", title: "الذاكرة مكتب العمل، والتخزين خزانة الأرشيف", w: 100, h: 50,
  nodes: [
    { id: "disk", kind: "disk", x: 12, y: 50, label: "SSD", sub: "دائم · بطيء نسبياً" }, { id: "ram", kind: "ram", x: 50, y: 50, label: "RAM", sub: "مؤقت · سريع", big: true }, { id: "cpu", kind: "cpu", x: 88, y: 50, label: "المعالج" },
    { id: "app", kind: "app", x: 50, y: 12, label: "تطبيق مفتوح" },
  ],
  links: [["disk", "ram"], ["ram", "cpu"], ["app", "ram"]],
  steps: [
    { caption: "تفتح تطبيقاً: يُنسخ من التخزين إلى الذاكرة. هذا هو زمن «التحميل» الذي تنتظره.", hot: ["disk", "ram"], packets: [{ from: "disk", to: "ram", label: "تحميل" }] },
    { caption: "أثناء العمل يقرأ المعالج ويكتب في الذاكرة فقط؛ الوصول إليها أسرع من أسرع SSD بمئة مرة.", hot: ["ram", "cpu", "app"], packets: [{ from: "ram", to: "cpu", tone: "ok" }, { from: "cpu", to: "ram", tone: "ok" }] },
    { caption: "امتلأت الذاكرة؟ النظام يُخرج أجزاء إلى التخزين (swap) ويعيدها عند الحاجة؛ لذلك يصبح الجهاز بطيئاً حين تفتح الكثير.", hot: ["ram", "disk"], packets: [{ from: "ram", to: "disk", tone: "bad" }, { from: "disk", to: "ram", tone: "bad" }] },
    { caption: "الحفظ = نسخ من الذاكرة إلى التخزين. انقطعت الكهرباء قبل الحفظ؟ الذاكرة تُمحى، والتخزين يبقى.", hot: ["ram", "disk"], packets: [{ from: "ram", to: "disk", label: "حفظ", tone: "ok" }] },
  ],
};

export const gpuParallel = {
  id: "gpu", title: "معالج ذكي واحد مقابل آلاف العمال البسطاء", w: 100, h: 56,
  nodes: [
    { id: "cpu", kind: "cpu", x: 22, y: 30, label: "المعالج", sub: "8 أنوية قوية", big: true }, { id: "gpu", kind: "gpu", x: 22, y: 76, label: "بطاقة الرسوم", sub: "آلاف الأنوية", big: true },
    { id: "px1", kind: "image", x: 62, y: 16, label: "صف بكسلات" }, { id: "px2", kind: "image", x: 62, y: 44, label: "صف بكسلات" }, { id: "px3", kind: "image", x: 62, y: 72, label: "صف بكسلات" }, { id: "screen", kind: "pc", x: 90, y: 44, label: "الشاشة", sub: "60 إطاراً/ث" },
  ],
  links: [["cpu", "px1"], ["gpu", "px1"], ["gpu", "px2"], ["gpu", "px3"], ["px1", "screen"], ["px2", "screen"], ["px3", "screen"]],
  steps: [
    { caption: "المعالج ممتاز في المهام المتسلسلة المعقدة: يقرر، يتفرع، يتعامل مع نظام التشغيل. لكنه يعالج بضع أشياء في اللحظة.", hot: ["cpu"], packets: [{ from: "cpu", to: "px1" }] },
    { caption: "الصورة مليونا بكسل، وكل بكسل يحتاج الحساب نفسه. بطاقة الرسوم تُطلق آلاف الأنوية الصغيرة على آلاف البكسلات معاً.", hot: ["gpu", "px1", "px2", "px3"], packets: [{ from: "gpu", to: "px1", tone: "ok" }, { from: "gpu", to: "px2", tone: "ok" }, { from: "gpu", to: "px3", tone: "ok" }] },
    { caption: "الإطار يكتمل في أقل من 16 ملّي ثانية فتظهر الحركة سلسة (60 إطاراً في الثانية).", hot: ["screen"], packets: [{ from: "px1", to: "screen", tone: "ok" }, { from: "px2", to: "screen", tone: "ok" }, { from: "px3", to: "screen", tone: "ok" }] },
    { caption: "الحساب نفسه (ضرب مصفوفات ضخمة) هو ما تحتاجه الشبكات العصبية؛ لذلك صارت بطاقات الرسوم محرك الذكاء الاصطناعي.", hot: ["gpu"], packets: [{ from: "gpu", to: "px2", tone: "ok" }, { from: "gpu", to: "px3", tone: "ok" }] },
  ],
};
