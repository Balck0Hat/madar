// مشاهد الأمن: التشفير بالمفتاح العام، التحقق بخطوتين، التصيّد، والجدار الناري.
export const encryption = {
  id: "encryption", title: "كيف تتفقان على سرّ والجميع يسمع", w: 100, h: 56,
  nodes: [
    { id: "a", kind: "user", x: 12, y: 50, label: "أنت" }, { id: "eye", kind: "eye", x: 50, y: 14, label: "متلصّص", sub: "يرى كل ما يمرّ" }, { id: "b", kind: "site", x: 88, y: 50, label: "البنك" },
    { id: "pub", kind: "key", x: 56, y: 84, label: "مفتاح عام", sub: "قفل مفتوح للجميع" }, { id: "priv", kind: "lock", x: 82, y: 84, label: "مفتاح خاص", sub: "عند البنك فقط" },
  ],
  links: [["a", "b"], ["b", "pub"], ["b", "priv"]],
  steps: [
    { caption: "المشكلة: لو أرسلت كلمة سرّ التشفير نفسها عبر الشبكة، لقرأها المتلصّص أيضاً.", hot: ["a", "eye", "b"], packets: [{ from: "a", to: "b", label: "السرّ؟", tone: "bad" }] },
    { caption: "الحل: للبنك مفتاحان مرتبطان. العام كقفل مفتوح يوزّعه على الجميع؛ الخاص وحده يفتح ما أُغلق بالعام.", hot: ["pub", "priv"], packets: [{ from: "b", to: "a", label: "مفتاح عام", tone: "ok" }] },
    { caption: "تختار سرّاً عشوائياً وتقفله بالمفتاح العام. المتلصّص يرى الصندوق المقفول ولا يملك ما يفتحه.", hot: ["a", "eye"], packets: [{ from: "a", to: "b", label: "🔒 السرّ" }] },
    { caption: "البنك يفتحه بمفتاحه الخاص. الآن تملكان سرّاً مشتركاً لم يمرّ مكشوفاً أبداً، وبه يُشفَّر كل ما بعده بسرعة (تشفير متماثل).", hot: ["b", "priv"], packets: [{ from: "a", to: "b", tone: "ok" }, { from: "b", to: "a", tone: "ok" }] },
    { caption: "هذا بالضبط ما يحدث في مصافحة HTTPS، وفي الرسائل المشفّرة طرفاً لطرف: المفتاح الخاص لا يغادر جهازك، فلا الشركة ولا الحكومة تقرأ.", hot: ["a", "b"] },
  ],
};

export const twoFactor = {
  id: "two-factor", title: "كلمة السرّ سُرقت… ومع ذلك لم يدخل", w: 100, h: 50,
  nodes: [
    { id: "you", kind: "user", x: 12, y: 30, label: "أنت" }, { id: "bad", kind: "attacker", x: 12, y: 78, label: "مهاجم", sub: "يعرف كلمة سرّك" }, { id: "site", kind: "site", x: 52, y: 50, label: "الحساب", big: true },
    { id: "phone", kind: "phone", x: 88, y: 50, label: "هاتفك", sub: "رمز يتغير كل 30 ث" },
  ],
  links: [["you", "site"], ["bad", "site"], ["site", "phone"], ["phone", "you"]],
  steps: [
    { caption: "الخطوة الأولى: كلمة السرّ (شيء تعرفه). تسرّبت من موقع آخر استعملتها فيه، والمهاجم يملكها الآن.", hot: ["you", "bad"], packets: [{ from: "you", to: "site", label: "كلمة السرّ" }, { from: "bad", to: "site", label: "كلمة السرّ", tone: "bad" }] },
    { caption: "الخطوة الثانية: الموقع يطلب رمزاً من شيء تملكه: تطبيق مصادقة أو مفتاح عتادي أو رسالة على هاتفك.", hot: ["site", "phone"], packets: [{ from: "site", to: "phone", label: "رمز؟" }] },
    { caption: "أنت تقرأ الرمز من هاتفك وتدخل. المهاجم لا يملك هاتفك، فيتوقف عند الباب رغم كلمة السرّ الصحيحة.", hot: ["you", "phone", "site"], packets: [{ from: "phone", to: "you", tone: "ok" }, { from: "you", to: "site", label: "482 913", tone: "ok" }, { from: "bad", to: "site", tone: "bad" }] },
    { caption: "الأقوى: مفتاح عتادي أو مفتاح مرور (passkey) مرتبط بالموقع نفسه، فلا ينفع حتى موقع مزيّف. الأضعف: رسائل SMS لأنها تُسرق بنقل الشريحة، لكنها أفضل من لا شيء.", hot: ["phone"] },
  ],
};

export const phishing = {
  id: "phishing", title: "تشريح رسالة تصيّد", w: 100, h: 50,
  nodes: [
    { id: "bad", kind: "attacker", x: 10, y: 50, label: "المحتال" }, { id: "mail", kind: "mail", x: 34, y: 50, label: "رسالة مستعجلة", sub: "«حسابك سيُغلق!»" }, { id: "you", kind: "user", x: 58, y: 50, label: "أنت", big: true },
    { id: "fake", kind: "site", x: 84, y: 20, label: "موقع مزيّف", sub: "bank-secure-login.com" }, { id: "real", kind: "shield", x: 84, y: 80, label: "الموقع الحقيقي", sub: "bank.com" },
  ],
  links: [["bad", "mail"], ["mail", "you"], ["you", "fake"], ["you", "real"], ["fake", "bad"]],
  steps: [
    { caption: "الرسالة تنتحل شعار البنك وتضغط بالخوف والاستعجال: «تحقق خلال 24 ساعة». الاستعجال هو العلامة الأولى.", hot: ["bad", "mail"], packets: [{ from: "bad", to: "mail", tone: "bad" }] },
    { caption: "الرابط يبدو صحيحاً، لكن النطاق الحقيقي في العنوان مختلف. مرّر المؤشر فوقه قبل الضغط، أو انظر إلى ما قبل أول «/».", hot: ["mail", "you", "fake"], packets: [{ from: "mail", to: "you", tone: "bad" }, { from: "you", to: "fake", label: "ضغط", tone: "bad" }] },
    { caption: "الصفحة نسخة طبق الأصل. تكتب كلمة السرّ فتذهب مباشرة إلى المحتال، الذي يجرّبها فوراً على الموقع الحقيقي.", hot: ["fake", "bad"], packets: [{ from: "you", to: "fake", label: "كلمة السرّ", tone: "bad" }, { from: "fake", to: "bad", tone: "bad" }] },
    { caption: "الدفاع: لا تضغط روابط الرسائل؛ افتح الموقع من إشارتك المرجعية. مدير كلمات السرّ لا يملأ الحقول في النطاق الخطأ، والتحقق بخطوتين يوقف ما تبقى.", hot: ["you", "real"], packets: [{ from: "you", to: "real", tone: "ok" }, { from: "real", to: "you", tone: "ok" }] },
  ],
};

export const firewall = {
  id: "firewalls", title: "الحارس على الباب: من يدخل ومن يُرَدّ", w: 100, h: 50,
  nodes: [
    { id: "web", kind: "cloud", x: 12, y: 24, label: "زائر موقع", sub: "منفذ 443" }, { id: "scan", kind: "attacker", x: 12, y: 76, label: "ماسح آلي", sub: "منفذ 3389" }, { id: "fw", kind: "shield", x: 50, y: 50, label: "الجدار الناري", sub: "قواعد", big: true },
    { id: "srv", kind: "server", x: 88, y: 30, label: "خادم الويب" }, { id: "pc", kind: "pc", x: 88, y: 76, label: "حاسوب داخلي" },
  ],
  links: [["web", "fw"], ["scan", "fw"], ["fw", "srv"], ["fw", "pc"]],
  steps: [
    { caption: "الجدار يفحص كل رزمة: من أين؟ إلى أي منفذ؟ هل بدأ الاتصال من الداخل؟ ثم يطبّق قواعده بالترتيب.", hot: ["fw"] },
    { caption: "طلب إلى المنفذ 443 (HTTPS) على خادم الويب: القاعدة تسمح. يمرّ.", hot: ["web", "fw", "srv"], packets: [{ from: "web", to: "fw", tone: "ok" }, { from: "fw", to: "srv", tone: "ok" }] },
    { caption: "ماسح آلي يطرق المنفذ 3389 (سطح المكتب البعيد) على حاسوب داخلي: لا قاعدة تسمح، فيُسقَط بصمت. لا يعرف حتى أن الجهاز موجود.", hot: ["scan", "fw"], packets: [{ from: "scan", to: "fw", tone: "bad" }] },
    { caption: "الاتجاه مهم: ما يبدأ من الداخل (متصفحك يطلب موقعاً) يُسمح لردّه بالعودة تلقائياً. الراوتر في بيتك جدار ناري بسيط من هذا النوع، والنظام فيه جدار آخر.", hot: ["pc", "fw", "web"], packets: [{ from: "pc", to: "fw", tone: "ok" }, { from: "fw", to: "web", tone: "ok" }, { from: "web", to: "fw", tone: "ok" }, { from: "fw", to: "pc", tone: "ok" }] },
  ],
};
