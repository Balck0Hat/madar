// مشاهد البرمجيات والمفاهيم: رحلة البريد، مزامنة السحابة، من الرابط إلى الصفحة، وسلسلة الكتل.
export const email = {
  id: "email-and-messaging", title: "رحلة رسالة بريد", w: 100, h: 50,
  nodes: [
    { id: "you", kind: "user", x: 8, y: 50, label: "أنت" }, { id: "smtp", kind: "send", x: 30, y: 50, label: "خادم إرسالك", sub: "SMTP" }, { id: "mx", kind: "inbox", x: 56, y: 50, label: "خادم المستلم", sub: "MX", big: true },
    { id: "spam", kind: "shield", x: 78, y: 18, label: "فلتر" }, { id: "them", kind: "phone", x: 92, y: 62, label: "المستلم", sub: "IMAP" },
  ],
  links: [["you", "smtp"], ["smtp", "mx"], ["mx", "spam"], ["spam", "them"], ["mx", "them"]],
  steps: [
    { caption: "تضغط «إرسال»: تطبيقك يسلّم الرسالة إلى خادم مزوّد بريدك عبر SMTP، كما تضع ظرفاً في صندوق البريد.", hot: ["you", "smtp"], packets: [{ from: "you", to: "smtp" }] },
    { caption: "خادمك يسأل DNS: من يستقبل بريد نطاق المستلم؟ (سجل MX) ويسلّمه إليه مباشرة، غالباً مشفّراً في الطريق.", hot: ["smtp", "mx"], packets: [{ from: "smtp", to: "mx", tone: "ok" }] },
    { caption: "خادم المستلم يتحقق: هل الخادم المرسل مخوّل لهذا النطاق (SPF/DKIM)؟ هل تشبه الرسالة تصيّداً؟ ثم يودعها في الوارد أو المزعج.", hot: ["mx", "spam"], packets: [{ from: "mx", to: "spam" }, { from: "spam", to: "them", tone: "ok" }] },
    { caption: "هاتف المستلم يسحبها عبر IMAP فتظهر على كل أجهزته. البريد مفتوح: أي مزوّد يراسل أي مزوّد، بخلاف تطبيقات الرسائل المغلقة.", hot: ["them"], packets: [{ from: "mx", to: "them", tone: "ok" }] },
  ],
};

export const cloudSync = {
  id: "cloud-storage-sync", title: "تعدّل على الحاسوب فيظهر على الهاتف", w: 100, h: 50,
  nodes: [
    { id: "pc", kind: "laptop", x: 12, y: 50, label: "حاسوبك" }, { id: "cloud", kind: "cloud", x: 50, y: 50, label: "السحابة", sub: "النسخة المرجعية", big: true }, { id: "phone", kind: "phone", x: 88, y: 50, label: "هاتفك" },
    { id: "hist", kind: "doc", x: 50, y: 12, label: "الإصدارات السابقة" },
  ],
  links: [["pc", "cloud"], ["cloud", "phone"], ["cloud", "hist"]],
  steps: [
    { caption: "برنامج المزامنة يراقب مجلداً. تحفظ ملفاً فيه، فيلاحظ التغيير خلال ثوانٍ.", hot: ["pc"] },
    { caption: "يرفع الأجزاء المتغيرة فقط (لا الملف كله) إلى السحابة، التي تحتفظ بالنسخة المرجعية وبالإصدارات القديمة مدة.", hot: ["pc", "cloud", "hist"], packets: [{ from: "pc", to: "cloud", label: "الفرق" }, { from: "cloud", to: "hist" }] },
    { caption: "السحابة تُخطر أجهزتك الأخرى فتنزّل التغيير. عدّلتم الملف نفسه على جهازين معاً؟ تحصل على نسختين «متعارضتين» لتختار.", hot: ["cloud", "phone"], packets: [{ from: "cloud", to: "phone", tone: "ok" }] },
    { caption: "تنبيه: المزامنة ليست نسخاً احتياطياً. حذفت ملفاً بالخطأ (أو شفّره فيروس)؟ يُحذف على كل الأجهزة. الإصدارات السابقة هي طوق النجاة، ونسخة منفصلة أفضل.", hot: ["hist"], packets: [{ from: "pc", to: "cloud", tone: "bad" }, { from: "cloud", to: "phone", tone: "bad" }] },
  ],
};

export const browserRender = {
  id: "browsers", title: "من الرابط إلى صفحة مرسومة", w: 100, h: 50,
  nodes: [
    { id: "url", kind: "site", x: 8, y: 50, label: "الرابط" }, { id: "dns", kind: "dns", x: 28, y: 18, label: "DNS" }, { id: "srv", kind: "server", x: 28, y: 82, label: "الخادم" }, { id: "html", kind: "code", x: 50, y: 50, label: "HTML + CSS + JS", big: true },
    { id: "tree", kind: "layers", x: 72, y: 50, label: "شجرة الصفحة", sub: "DOM" }, { id: "screen", kind: "pc", x: 92, y: 50, label: "الرسم" },
  ],
  links: [["url", "dns"], ["url", "srv"], ["srv", "html"], ["html", "tree"], ["tree", "screen"]],
  steps: [
    { caption: "تكتب الرابط: المتصفح يحلّ الاسم إلى عنوان، يفتح اتصالاً مشفّراً، ويطلب الصفحة.", hot: ["url", "dns", "srv"], packets: [{ from: "url", to: "dns" }, { from: "dns", to: "url", tone: "ok" }, { from: "url", to: "srv" }] },
    { caption: "يصل HTML (البنية). المتصفح يقرأه ويكتشف أنه يحتاج ملفات CSS (الشكل) وJavaScript (السلوك) وصوراً، فيطلبها بالتوازي.", hot: ["srv", "html"], packets: [{ from: "srv", to: "html", label: "HTML" }, { from: "srv", to: "html", label: "CSS" }, { from: "srv", to: "html", label: "JS" }] },
    { caption: "يبني شجرة العناصر (DOM) ويطبّق الأنماط، ثم يحسب مكان كل عنصر وحجمه (التخطيط) ويرسم البكسلات على بطاقة الرسوم.", hot: ["html", "tree", "screen"], packets: [{ from: "html", to: "tree" }, { from: "tree", to: "screen", tone: "ok" }] },
    { caption: "JavaScript يعدّل الشجرة استجابةً لنقراتك فيعاد الرسم. كل تبويب عملية معزولة: تعطّل واحد لا يسقط الباقي، وموقع لا يقرأ بيانات موقع آخر.", hot: ["tree", "screen"], packets: [{ from: "tree", to: "screen", tone: "ok" }] },
  ],
};

export const blockchain = {
  id: "blockchain-crypto", title: "دفتر حسابات لا يملكه أحد", w: 100, h: 56,
  nodes: [
    { id: "tx", kind: "send", x: 10, y: 50, label: "تحويل", sub: "أ → ب" }, { id: "n1", kind: "server", x: 40, y: 16, label: "عقدة" }, { id: "n2", kind: "server", x: 40, y: 50, label: "عقدة", big: true }, { id: "n3", kind: "server", x: 40, y: 84, label: "عقدة" },
    { id: "b1", kind: "blocks", x: 68, y: 50, label: "كتلة 1041", sub: "بصمة السابقة + تحويلات" }, { id: "b2", kind: "blocks", x: 90, y: 50, label: "كتلة 1042" },
  ],
  links: [["tx", "n1"], ["tx", "n2"], ["tx", "n3"], ["n1", "n2"], ["n2", "n3"], ["n2", "b1"], ["b1", "b2"]],
  steps: [
    { caption: "لا بنك في المنتصف: التحويل يُبثّ إلى آلاف الحواسيب (العقد) التي تملك كلها نسخة من الدفتر كاملاً.", hot: ["tx", "n1", "n2", "n3"], packets: [{ from: "tx", to: "n1" }, { from: "tx", to: "n2" }, { from: "tx", to: "n3" }] },
    { caption: "كل عقدة تتحقق: هل يملك «أ» الرصيد فعلاً؟ هل التوقيع بمفتاحه الخاص صحيح؟ التحويلات الصالحة تُجمع في كتلة.", hot: ["n2", "b1"], packets: [{ from: "n2", to: "b1", tone: "ok" }] },
    { caption: "كل كتلة تحمل بصمة (hash) الكتلة السابقة. تغيير حرف في كتلة قديمة يغيّر بصمتها فتنكسر كل السلسلة بعدها، وتلاحظه بقية العقد فوراً.", hot: ["b1", "b2"], packets: [{ from: "b1", to: "b2", label: "بصمة", tone: "ok" }] },
    { caption: "الثمن: الاتفاق بين آلاف العقد بطيء ومكلف (بتكوين: نحو 7 تحويلات في الثانية مقابل آلاف لفيزا). لذلك تناسب ما يحتاج غياب الوسيط، لا كل شيء.", hot: ["n1", "n2", "n3"], packets: [{ from: "n1", to: "n2", tone: "ok" }, { from: "n2", to: "n3", tone: "ok" }] },
  ],
};
