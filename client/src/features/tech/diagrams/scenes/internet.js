// مشاهد «كيف يعمل الإنترنت» والشبكة المنزلية: العقد بنسب مئوية على لوحة 100×100، والخطوات تضيء عقداً وتحرّك رزماً.
const home = [
  { id: "phone", kind: "phone", x: 14, y: 22, label: "هاتفك", sub: "192.168.1.12" },
  { id: "laptop", kind: "laptop", x: 14, y: 74, label: "حاسوبك", sub: "192.168.1.15" },
  { id: "router", kind: "router", x: 36, y: 46, label: "الراوتر", sub: "192.168.1.1", big: true },
  { id: "modem", kind: "modem", x: 55, y: 74, label: "المودم" },
  { id: "isp", kind: "isp", x: 70, y: 28, label: "المزوّد", sub: "203.0.113.9" },
  { id: "cloud", kind: "cloud", x: 87, y: 66, label: "الإنترنت", big: true },
];
const homeLinks = [["phone", "router"], ["laptop", "router"], ["router", "modem"], ["modem", "isp"], ["isp", "cloud"]];

export const routerModem = {
  id: "router-modem", title: "الشبكة المنزلية: من جهازك إلى الإنترنت", w: 100, h: 52, nodes: home, links: homeLinks,
  steps: [
    { caption: "كل جهاز في بيتك يتصل بالراوتر (بالواي فاي أو بكابل) ويأخذ منه عنواناً داخلياً.", hot: ["phone", "laptop", "router"] },
    { caption: "الراوتر يوزّع الاتصال ويحفظ من طلب ماذا؛ هو «مدير المرور» داخل البيت.", hot: ["router"], packets: [{ from: "phone", to: "router" }, { from: "laptop", to: "router" }] },
    { caption: "المودم يترجم إشارة الراوتر إلى ما يفهمه خط المزوّد (ألياف، كابل، أو DSL). في كثير من البيوت الجهازان في علبة واحدة.", hot: ["router", "modem"], packets: [{ from: "router", to: "modem" }] },
    { caption: "المزوّد يعطي بيتك عنواناً عاماً واحداً يراه العالم، ويمرّر طلباتك إلى الإنترنت.", hot: ["modem", "isp", "cloud"], packets: [{ from: "modem", to: "isp" }, { from: "isp", to: "cloud" }] },
    { caption: "الرد يعود بالطريق نفسه، والراوتر يعرف أن هذا الرد لهاتفك لا لحاسوبك.", hot: ["cloud", "router", "phone"], packets: [{ from: "cloud", to: "isp", tone: "ok" }, { from: "isp", to: "modem", tone: "ok" }, { from: "modem", to: "router", tone: "ok" }, { from: "router", to: "phone", tone: "ok" }] },
  ],
};

export const ipAddresses = {
  id: "ip-addresses", title: "العناوين الداخلية والعنوان العام (NAT)", w: 100, h: 52, nodes: home, links: homeLinks,
  steps: [
    { caption: "داخل البيت لكل جهاز عنوان خاص يبدأ غالباً بـ192.168 أو 10. هذه العناوين لا تظهر خارج البيت.", hot: ["phone", "laptop"] },
    { caption: "الراوتر نفسه له عنوان داخلي (192.168.1.1) وعنوان عام واحد أعطاه المزوّد (203.0.113.9).", hot: ["router", "isp"] },
    { caption: "حين يطلب هاتفك موقعاً، يستبدل الراوتر عنوانه الداخلي بالعنوان العام ويسجّل في جدوله: هذا الطلب من الهاتف.", hot: ["phone", "router"], packets: [{ from: "phone", to: "router", label: "192.168.1.12" }, { from: "router", to: "modem", label: "203.0.113.9" }] },
    { caption: "الموقع يرى عنوان بيتك العام فقط؛ كل أجهزتك تظهر له عنواناً واحداً. هذا هو NAT.", hot: ["cloud"], packets: [{ from: "modem", to: "isp" }, { from: "isp", to: "cloud" }] },
    { caption: "الرد يصل للعنوان العام، فيرجع الراوتر إلى جدوله ويسلّمه للهاتف لا للحاسوب.", hot: ["router", "phone"], packets: [{ from: "cloud", to: "isp", tone: "ok" }, { from: "isp", to: "modem", tone: "ok" }, { from: "modem", to: "router", tone: "ok" }, { from: "router", to: "phone", tone: "ok", label: "192.168.1.12" }] },
  ],
};

export const ispBackbone = {
  id: "isp-and-backbone", title: "من بيتك إلى قارة أخرى", w: 100, h: 52,
  nodes: [
    { id: "you", kind: "laptop", x: 9, y: 50, label: "أنت" }, { id: "isp", kind: "isp", x: 25, y: 64, label: "مزوّدك" }, { id: "ix", kind: "cloud", x: 41, y: 26, label: "نقطة تبادل", sub: "IXP" },
    { id: "sea", kind: "sea", x: 57, y: 60, label: "كابل بحري", big: true }, { id: "isp2", kind: "isp", x: 74, y: 30, label: "مزوّد بعيد" }, { id: "site", kind: "server", x: 90, y: 60, label: "الموقع" },
  ],
  links: [["you", "isp"], ["isp", "ix"], ["ix", "sea"], ["isp", "sea"], ["sea", "isp2"], ["isp2", "site"]],
  steps: [
    { caption: "طلبك يخرج من بيتك إلى شبكة مزوّدك في مدينتك.", hot: ["you", "isp"], packets: [{ from: "you", to: "isp" }] },
    { caption: "المزوّدون يتبادلون الحركة في نقاط تبادل (IXP) أو عبر اتفاقيات عبور؛ لا توجد شركة واحدة تملك الإنترنت.", hot: ["isp", "ix"], packets: [{ from: "isp", to: "ix" }] },
    { caption: "بين القارات تمرّ رزمتك في كابلات ألياف على قاع البحر؛ نحو 99٪ من الحركة بين القارات تمرّ فيها لا في الأقمار.", hot: ["sea"], packets: [{ from: "ix", to: "sea" }, { from: "sea", to: "isp2" }] },
    { caption: "تصل إلى مزوّد الموقع ثم إلى خادمه، وتعود بالطريق نفسه أو بغيره. الرحلة كلها نحو 150 إلى 250 ملّي ثانية عبر المحيط.", hot: ["isp2", "site"], packets: [{ from: "isp2", to: "site" }, { from: "site", to: "isp2", tone: "ok" }] },
  ],
};

export const wifi = {
  id: "wifi", title: "الواي فاي: النطاقان والجدران", w: 100, h: 52,
  nodes: [
    { id: "router", kind: "router", x: 50, y: 50, label: "الراوتر", big: true }, { id: "near", kind: "phone", x: 30, y: 25, label: "قريب" }, { id: "far", kind: "laptop", x: 88, y: 30, label: "خلف جدارين" },
    { id: "tv", kind: "pc", x: 30, y: 78, label: "التلفاز" }, { id: "wall", kind: "cable", x: 70, y: 40, label: "جدار خرساني" },
  ],
  links: [["router", "near"], ["router", "far"], ["router", "tv"]],
  steps: [
    { caption: "الراوتر يبثّ على نطاقين: 2.4 غيغاهرتز أبعد مدىً لكن أبطأ وأكثر ازدحاماً، و5 غيغاهرتز أسرع لكن أقصر مدىً.", hot: ["router"] },
    { caption: "الجهاز القريب على 5 غيغاهرتز يحصل على سرعة عالية (مئات الميغابت).", hot: ["near"], packets: [{ from: "router", to: "near", tone: "ok" }, { from: "near", to: "router", tone: "ok" }] },
    { caption: "الجهاز خلف الجدران يفقد جزءاً كبيراً من الإشارة، خاصة على 5 غيغاهرتز؛ فيتحول إلى 2.4 أو تنخفض سرعته كثيراً.", hot: ["far", "wall"], packets: [{ from: "router", to: "far", tone: "bad" }] },
    { caption: "الحل العملي: ضع الراوتر في وسط البيت ومرتفعاً، أو أضف نقطة وصول (mesh)، وصِل الأجهزة الثابتة بكابل.", hot: ["router", "tv"], packets: [{ from: "router", to: "tv", tone: "ok" }] },
  ],
};
