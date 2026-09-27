// مشاهد الخدمات: VPN، شبكات توزيع المحتوى، والحوسبة السحابية.
export const vpn = {
  id: "vpn", title: "ماذا يغيّر الـVPN فعلاً", w: 100, h: 52,
  nodes: [
    { id: "you", kind: "laptop", x: 10, y: 50, label: "جهازك" }, { id: "isp", kind: "isp", x: 34, y: 50, label: "مزوّدك / مقهى" }, { id: "vpn", kind: "vpn", x: 62, y: 20, label: "خادم VPN", sub: "دولة أخرى", big: true }, { id: "site", kind: "site", x: 88, y: 60, label: "الموقع" },
  ],
  links: [["you", "isp"], ["isp", "site"], ["isp", "vpn"], ["vpn", "site"]],
  steps: [
    { caption: "بلا VPN: المزوّد (أو شبكة المقهى) يرى أي مواقع تزور، والموقع يرى عنوانك الحقيقي وبلدك.", hot: ["you", "isp", "site"], packets: [{ from: "you", to: "isp", label: "example.com" }, { from: "isp", to: "site" }] },
    { caption: "مع VPN: جهازك يفتح نفقاً مشفّراً إلى خادم الـVPN. المزوّد يرى أنك متصل بذلك الخادم فقط، ولا يرى ما بداخل النفق.", hot: ["you", "vpn"], packets: [{ from: "you", to: "isp", label: "مشفّر" }, { from: "isp", to: "vpn", label: "مشفّر" }] },
    { caption: "خادم الـVPN يفك التشفير ويرسل طلبك إلى الموقع باسمه هو. الموقع يرى عنوان الـVPN وبلده، لا عنوانك.", hot: ["vpn", "site"], packets: [{ from: "vpn", to: "site" }, { from: "site", to: "vpn", tone: "ok" }] },
    { caption: "الحدود: شركة الـVPN نفسها ترى كل حركتك (انتقلت الثقة من المزوّد إليها)، والموقع ما زال يعرفك إن سجّلت دخولك. وHTTPS يشفّر المحتوى أصلاً، الـVPN يخفي «مع من تتكلم» فقط.", hot: ["vpn"], packets: [{ from: "vpn", to: "isp", tone: "ok" }, { from: "isp", to: "you", tone: "ok" }] },
  ],
};

export const cdn = {
  id: "cdn-and-servers", title: "لماذا يصلك الفيديو من مدينتك لا من أمريكا", w: 100, h: 56,
  nodes: [
    { id: "origin", kind: "server", x: 88, y: 22, label: "الخادم الأصلي", sub: "أمريكا" }, { id: "edge", kind: "cdn", x: 50, y: 50, label: "نسخة قريبة", sub: "في بلدك", big: true },
    { id: "you", kind: "phone", x: 12, y: 30, label: "أنت" }, { id: "other", kind: "laptop", x: 12, y: 74, label: "جارك" },
  ],
  links: [["you", "edge"], ["other", "edge"], ["edge", "origin"]],
  steps: [
    { caption: "الموقع الكبير يضع نسخاً من محتواه الثابت (صور، فيديو، ملفات) على مئات الخوادم الموزّعة حول العالم: شبكة توزيع المحتوى.", hot: ["origin", "edge"] },
    { caption: "أول طالب في مدينتك: النسخة القريبة لا تملك الملف، فتجلبه من الأصل مرة واحدة وتحتفظ به.", hot: ["you", "edge", "origin"], packets: [{ from: "you", to: "edge" }, { from: "edge", to: "origin" }, { from: "origin", to: "edge", tone: "ok" }] },
    { caption: "الملف يصلك من النسخة القريبة، وكل من بعدك في مدينتك يأخذه منها مباشرة في ملّي ثوانٍ قليلة.", hot: ["edge", "you", "other"], packets: [{ from: "edge", to: "you", tone: "ok" }, { from: "other", to: "edge" }, { from: "edge", to: "other", tone: "ok" }] },
    { caption: "الفائدة الثانية: الحماية. هجوم إغراق يتوزع على مئات النسخ بدل أن يسقط الخادم الأصلي. لذلك تختبئ معظم المواقع الكبيرة خلف Cloudflare أو Akamai.", hot: ["edge"], packets: [{ from: "other", to: "edge", tone: "bad" }, { from: "you", to: "edge", tone: "bad" }] },
  ],
};

export const cloud = {
  id: "cloud-computing", title: "السحابة: حاسوب شخص آخر تستأجره بالدقيقة", w: 100, h: 56,
  nodes: [
    { id: "dev", kind: "laptop", x: 12, y: 50, label: "شركة صغيرة" }, { id: "dc", kind: "cloud", x: 50, y: 50, label: "مركز بيانات", sub: "AWS / Azure / GCP", big: true },
    { id: "vm1", kind: "server", x: 84, y: 18, label: "خادم 1" }, { id: "vm2", kind: "server", x: 84, y: 50, label: "خادم 2" }, { id: "vm3", kind: "server", x: 84, y: 82, label: "خادم 3", sub: "يُضاف عند الذروة" },
    { id: "users", kind: "phone", x: 50, y: 88, label: "المستخدمون" },
  ],
  links: [["dev", "dc"], ["dc", "vm1"], ["dc", "vm2"], ["dc", "vm3"], ["users", "dc"]],
  steps: [
    { caption: "بدل شراء خوادم ووضعها في غرفة مكيّفة، تطلب الشركة خادماً افتراضياً من مركز بيانات ضخم وتدفع بالساعة.", hot: ["dev", "dc"], packets: [{ from: "dev", to: "dc", label: "أريد خادمين" }] },
    { caption: "في دقائق: خادمان يعملان، بنسخ احتياطية وكهرباء واتصال يديرها المزوّد. الشركة ترفع تطبيقها فقط.", hot: ["dc", "vm1", "vm2"], packets: [{ from: "dc", to: "vm1", tone: "ok" }, { from: "dc", to: "vm2", tone: "ok" }] },
    { caption: "المستخدمون يتدفقون على التطبيق. عند الذروة (عرض، موسم) يُضاف خادم ثالث تلقائياً، ويُطفأ حين تهدأ الحركة. هذا هو «التوسّع المرن».", hot: ["users", "dc", "vm3"], packets: [{ from: "users", to: "dc" }, { from: "users", to: "dc" }, { from: "dc", to: "vm3", label: "توسّع" }] },
    { caption: "المستويات: IaaS خوادم خام، PaaS منصة جاهزة ترفع عليها الكود، SaaS تطبيق كامل تستعمله (مثل Gmail). كلما صعدت قلّ ما تديره وقلّ تحكمك.", hot: ["vm1", "vm2", "vm3"] },
  ],
};
