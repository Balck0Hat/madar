// مشاهد نظام التشغيل: الإقلاع، تعدد المهام، والآلات الافتراضية مقابل الحاويات.
export const boot = {
  id: "boot-bios-uefi", title: "ماذا يحدث بين زر التشغيل وشاشة الدخول", w: 100, h: 50,
  nodes: [
    { id: "power", kind: "power", x: 8, y: 50, label: "زر التشغيل" }, { id: "fw", kind: "firmware", x: 28, y: 50, label: "UEFI", sub: "على اللوحة الأم" }, { id: "disk", kind: "disk", x: 48, y: 50, label: "محمّل الإقلاع", sub: "على القرص" },
    { id: "kernel", kind: "kernel", x: 68, y: 50, label: "النواة", big: true }, { id: "login", kind: "user", x: 90, y: 50, label: "شاشة الدخول" },
  ],
  links: [["power", "fw"], ["fw", "disk"], ["disk", "kernel"], ["kernel", "login"]],
  steps: [
    { caption: "تضغط الزر: تصل الكهرباء، والمعالج يبدأ من عنوان ثابت فيه برنامج صغير مخزّن على اللوحة الأم (UEFI، وقديماً BIOS).", hot: ["power", "fw"], packets: [{ from: "power", to: "fw" }] },
    { caption: "البرنامج الثابت يفحص العتاد (ذاكرة، لوحة مفاتيح، أقراص) ويبحث في القرص عن محمّل إقلاع موثوق؛ Secure Boot يرفض المحمّلات غير الموقّعة.", hot: ["fw", "disk"], packets: [{ from: "fw", to: "disk", label: "من يقلع؟" }] },
    { caption: "محمّل الإقلاع (Windows Boot Manager أو GRUB) يحمّل نواة نظام التشغيل إلى الذاكرة ويسلّمها القيادة. هنا تختار النظام إن كان لديك أكثر من واحد.", hot: ["disk", "kernel"], packets: [{ from: "disk", to: "kernel", tone: "ok" }] },
    { caption: "النواة تشغّل التعريفات والخدمات (الشبكة، الصوت، الأمان) ثم واجهة الدخول. بقرص SSD كل هذا في ثوانٍ.", hot: ["kernel", "login"], packets: [{ from: "kernel", to: "login", tone: "ok" }] },
  ],
};

export const processes = {
  id: "processes-memory", title: "كيف تعمل عشرة برامج على معالج واحد", w: 100, h: 56,
  nodes: [
    { id: "sched", kind: "timer", x: 50, y: 50, label: "المجدول", sub: "في النواة", big: true }, { id: "cpu", kind: "cpu", x: 50, y: 10, label: "المعالج" },
    { id: "a", kind: "app", x: 12, y: 30, label: "المتصفح" }, { id: "b", kind: "chat", x: 12, y: 74, label: "الرسائل" }, { id: "c", kind: "image", x: 88, y: 30, label: "المشغّل" }, { id: "d", kind: "terminal", x: 88, y: 74, label: "التحديث" },
  ],
  links: [["sched", "cpu"], ["a", "sched"], ["b", "sched"], ["c", "sched"], ["d", "sched"]],
  steps: [
    { caption: "كل برنامج مفتوح «عملية» لها ذاكرتها الخاصة المعزولة؛ لا يستطيع المتصفح قراءة ذاكرة الرسائل.", hot: ["a", "b", "c", "d"] },
    { caption: "المجدول يعطي المعالج للمتصفح بضعة ملّي ثوانٍ فقط…", hot: ["a", "sched", "cpu"], packets: [{ from: "a", to: "sched" }, { from: "sched", to: "cpu", tone: "ok" }] },
    { caption: "…ثم ينتزعه ويعطيه للمشغّل، ثم الرسائل، وهكذا آلاف المرات في الثانية. الخداع سريع جداً فيبدو الكل يعمل معاً.", hot: ["c", "sched", "cpu"], packets: [{ from: "c", to: "sched" }, { from: "sched", to: "cpu", tone: "ok" }] },
    { caption: "برنامج علّق؟ بقية النظام يستمر لأن المجدول لا ينتظره. وبنوى متعددة تعمل عدة عمليات فعلاً في اللحظة نفسها.", hot: ["d", "sched"], packets: [{ from: "d", to: "sched", tone: "bad" }, { from: "sched", to: "cpu", tone: "ok" }] },
  ],
};

export const containers = {
  id: "virtual-machines-containers", title: "آلة افتراضية كاملة أم حاوية خفيفة؟", w: 100, h: 60,
  nodes: [
    { id: "hw", kind: "board", x: 50, y: 80, label: "العتاد", big: true }, { id: "host", kind: "kernel", x: 50, y: 56, label: "نظام المضيف" },
    { id: "hv", kind: "layers", x: 22, y: 40, label: "المشرف", sub: "Hypervisor" }, { id: "vm", kind: "pc", x: 22, y: 14, label: "آلة افتراضية", sub: "نظام كامل + تطبيق" },
    { id: "eng", kind: "boxes", x: 78, y: 40, label: "محرك الحاويات", sub: "Docker" }, { id: "c1", kind: "box", x: 66, y: 14, label: "حاوية" }, { id: "c2", kind: "box", x: 90, y: 14, label: "حاوية" },
  ],
  links: [["hw", "host"], ["host", "hv"], ["hv", "vm"], ["host", "eng"], ["eng", "c1"], ["eng", "c2"]],
  steps: [
    { caption: "الآلة الافتراضية: المشرف يحاكي حاسوباً كاملاً، وبداخله نظام تشغيل كامل بنواته. عزل قوي، لكن غيغابايتات ودقيقة للإقلاع.", hot: ["hv", "vm"], packets: [{ from: "hw", to: "host" }, { from: "host", to: "hv" }, { from: "hv", to: "vm" }] },
    { caption: "الحاوية: تشارك نواة المضيف وتحمل فقط التطبيق ومكتباته. تبدأ في أجزاء من الثانية وحجمها ميغابايتات.", hot: ["eng", "c1", "c2"], packets: [{ from: "host", to: "eng", tone: "ok" }, { from: "eng", to: "c1", tone: "ok" }, { from: "eng", to: "c2", tone: "ok" }] },
    { caption: "الفائدة العملية: «يعمل على جهازي» تنتهي؛ الحاوية نفسها تعمل على حاسوب المطوّر والخادم والسحابة بلا اختلاف.", hot: ["c1", "c2"] },
    { caption: "متى كل واحدة؟ الآلة الافتراضية لنظام مختلف كلياً (ويندوز على ماك) أو عزل أمني صارم؛ الحاوية لتشغيل خدمات كثيرة بكفاءة. السحابة تستعمل الاثنين معاً.", hot: ["vm", "c1"] },
  ],
};
