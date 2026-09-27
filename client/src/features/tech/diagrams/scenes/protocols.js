// مشاهد البروتوكولات: DNS، HTTPS، TCP/UDP والمنافذ، وعرض النطاق مقابل الكمون.
export const dns = {
  id: "dns", title: "كيف يتحول الاسم إلى عنوان", w: 100, h: 56,
  nodes: [
    { id: "you", kind: "laptop", x: 10, y: 50, label: "متصفحك" }, { id: "resolver", kind: "dns", x: 34, y: 50, label: "محلّل المزوّد", sub: "8.8.8.8", big: true },
    { id: "root", kind: "dns", x: 62, y: 16, label: "خوادم الجذر", sub: "." }, { id: "tld", kind: "dns", x: 84, y: 36, label: "خوادم .com" }, { id: "auth", kind: "dns", x: 84, y: 80, label: "خادم النطاق", sub: "example.com" },
    { id: "site", kind: "site", x: 58, y: 84, label: "الموقع", sub: "93.184.216.34" },
  ],
  links: [["you", "resolver"], ["resolver", "root"], ["resolver", "tld"], ["resolver", "auth"], ["you", "site"]],
  steps: [
    { caption: "تكتب example.com. جهازك يبحث أولاً في ذاكرته المؤقتة؛ إن لم يجد، يسأل محلّل DNS (عادة عند مزوّدك أو 8.8.8.8).", hot: ["you", "resolver"], packets: [{ from: "you", to: "resolver", label: "example.com؟" }] },
    { caption: "المحلّل لا يعرف، فيسأل خوادم الجذر: «من المسؤول عن .com؟»", hot: ["resolver", "root"], packets: [{ from: "resolver", to: "root" }, { from: "root", to: "resolver", tone: "ok" }] },
    { caption: "ثم يسأل خوادم .com: «من المسؤول عن example.com؟» فتحيله إلى خادم النطاق نفسه.", hot: ["resolver", "tld"], packets: [{ from: "resolver", to: "tld" }, { from: "tld", to: "resolver", tone: "ok" }] },
    { caption: "خادم النطاق يجيب بالعنوان الحقيقي. المحلّل يحفظه مدة TTL (دقائق أو ساعات) كي لا يعيد الرحلة لكل زائر.", hot: ["resolver", "auth"], packets: [{ from: "resolver", to: "auth" }, { from: "auth", to: "resolver", tone: "ok", label: "93.184.216.34" }] },
    { caption: "يصل الجواب إلى متصفحك، فيتصل بالعنوان مباشرة. كل هذا يستغرق عادة أقل من 50 ملّي ثانية.", hot: ["you", "site"], packets: [{ from: "resolver", to: "you", tone: "ok" }, { from: "you", to: "site" }] },
  ],
};

export const https = {
  id: "http-https", title: "طلب صفحة عبر HTTPS", w: 100, h: 46,
  nodes: [
    { id: "you", kind: "laptop", x: 12, y: 50, label: "متصفحك" }, { id: "lock", kind: "lock", x: 50, y: 50, label: "قناة مشفّرة", sub: "TLS", big: true }, { id: "site", kind: "server", x: 88, y: 50, label: "الخادم", sub: "example.com" },
  ],
  links: [["you", "lock"], ["lock", "site"]],
  steps: [
    { caption: "المصافحة: متصفحك يقول «مرحباً، أريد اتصالاً آمناً» ويذكر ما يدعمه من تشفير.", hot: ["you"], packets: [{ from: "you", to: "lock", label: "ClientHello" }, { from: "lock", to: "site" }] },
    { caption: "الخادم يرد بشهادته: وثيقة موقّعة من جهة موثوقة تثبت أنه فعلاً example.com. المتصفح يتحقق منها.", hot: ["site"], packets: [{ from: "site", to: "lock", label: "الشهادة", tone: "ok" }, { from: "lock", to: "you", tone: "ok" }] },
    { caption: "الطرفان يتفقان على مفتاح سرّي مؤقت لهذه الجلسة وحدها. من هنا كل شيء مشفّر: حتى مزوّدك لا يرى إلا اسم الموقع.", hot: ["lock"], packets: [{ from: "you", to: "lock" }, { from: "site", to: "lock" }] },
    { caption: "الطلب: GET /page … مع ترويسات (المتصفح، اللغة، الكوكيز) داخل القناة المشفّرة.", hot: ["you", "lock"], packets: [{ from: "you", to: "lock", label: "GET /page" }, { from: "lock", to: "site" }] },
    { caption: "الرد: رمز حالة (200 نجاح، 404 غير موجود، 500 خطأ) ثم محتوى الصفحة. الصفحة الواحدة قد تعني عشرات الطلبات: صور وخطوط وسكربتات.", hot: ["site", "you"], packets: [{ from: "site", to: "lock", label: "200 OK", tone: "ok" }, { from: "lock", to: "you", tone: "ok" }] },
  ],
};

export const tcpUdp = {
  id: "tcp-udp-ports", title: "TCP يضمن، UDP يسرع، والمنافذ تفرز", w: 100, h: 56,
  nodes: [
    { id: "you", kind: "laptop", x: 12, y: 50, label: "جهازك", big: true }, { id: "web", kind: "server", x: 88, y: 18, label: "موقع", sub: "منفذ 443" }, { id: "mail", kind: "server", x: 88, y: 50, label: "بريد", sub: "منفذ 993" }, { id: "call", kind: "phone", x: 88, y: 82, label: "مكالمة فيديو", sub: "UDP" },
  ],
  links: [["you", "web"], ["you", "mail"], ["you", "call"]],
  steps: [
    { caption: "العنوان يوصلك إلى الجهاز، والمنفذ يوصلك إلى البرنامج فيه: 443 للويب المشفّر، 993 للبريد، وهكذا. جهاز واحد يخدم آلاف الاتصالات بمنافذ مختلفة.", hot: ["you", "web", "mail"] },
    { caption: "TCP يبدأ بمصافحة ثلاثية (SYN، SYN-ACK، ACK) قبل إرسال أي بيانات؛ الطرفان يتفقان على الترقيم.", hot: ["you", "web"], packets: [{ from: "you", to: "web", label: "SYN" }, { from: "web", to: "you", label: "SYN-ACK", tone: "ok" }] },
    { caption: "كل رزمة مرقّمة ويُؤكَّد استلامها. إذا ضاعت واحدة أعيد إرسالها؛ لذلك الصفحة والملف يصلان كاملين دائماً، ولو ببطء.", hot: ["you", "mail"], packets: [{ from: "you", to: "mail", label: "#1 #2 #3" }, { from: "mail", to: "you", label: "ACK", tone: "ok" }] },
    { caption: "UDP يرمي الرزم بلا مصافحة ولا تأكيد. رزمة ضائعة في مكالمة فيديو = لحظة تشويش لا تستحق الانتظار. لذلك تستعمله المكالمات والألعاب والبث.", hot: ["you", "call"], packets: [{ from: "you", to: "call" }, { from: "you", to: "call", tone: "bad" }, { from: "call", to: "you" }] },
  ],
};

export const bandwidthLatency = {
  id: "bandwidth-latency", title: "عرض النطاق ليس الكمون", w: 100, h: 46,
  nodes: [
    { id: "you", kind: "laptop", x: 12, y: 50, label: "جهازك" }, { id: "near", kind: "server", x: 50, y: 22, label: "خادم قريب", sub: "10 ms" }, { id: "far", kind: "server", x: 88, y: 50, label: "خادم بعيد", sub: "180 ms" }, { id: "pipe", kind: "cable", x: 50, y: 78, label: "الأنبوب", sub: "100 Mbps" },
  ],
  links: [["you", "near"], ["you", "far"], ["you", "pipe"]],
  steps: [
    { caption: "عرض النطاق (Mbps) هو سعة الأنبوب: كم بتّاً يمرّ في الثانية. الكمون (ms) هو زمن الذهاب والعودة لرزمة واحدة مهما صغرت.", hot: ["pipe"] },
    { caption: "خادم قريب: الرزمة تعود في 10 ملّي ثانية. الموقع يشعر «فورياً» حتى على اتصال متوسط السرعة.", hot: ["you", "near"], packets: [{ from: "you", to: "near" }, { from: "near", to: "you", tone: "ok" }] },
    { caption: "خادم في قارة أخرى: 180 ملّي ثانية لكل ذهاب وعودة، والصفحة تحتاج عشرات الذهاب والعودة. اتصال «سريع» ما زال يبدو بطيئاً.", hot: ["you", "far"], packets: [{ from: "you", to: "far", tone: "bad" }, { from: "far", to: "you", tone: "bad" }] },
    { caption: "الخلاصة: التنزيلات والبث تحتاج عرض نطاق، أما الألعاب والمكالمات وتصفح الصفحات فتحتاج كموناً منخفضاً. قِس الاثنين لا واحداً.", hot: ["you", "pipe", "near"], packets: [{ from: "you", to: "pipe", tone: "ok" }, { from: "pipe", to: "you", tone: "ok" }] },
  ],
};
