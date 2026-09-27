// مشاهد الذكاء الاصطناعي: حلقة التدريب، الشبكة العصبية، توقّع الكلمة التالية، والتوصيات.
export const machineLearning = {
  id: "machine-learning", title: "حلقة التعلّم: خمّن، أخطئ، صحّح، كرّر", w: 100, h: 50,
  nodes: [
    { id: "data", kind: "json", x: 10, y: 50, label: "أمثلة", sub: "صور مع تسمياتها" }, { id: "model", kind: "brain", x: 42, y: 50, label: "النموذج", sub: "ملايين الأوزان", big: true }, { id: "guess", kind: "sparkles", x: 74, y: 24, label: "التخمين", sub: "«قطة 60٪»" },
    { id: "err", kind: "hash", x: 74, y: 78, label: "الخطأ", sub: "كم بعد عن الصواب" },
  ],
  links: [["data", "model"], ["model", "guess"], ["guess", "err"], ["err", "model"]],
  steps: [
    { caption: "لا أحد يكتب قواعد «القطة لها أذنان مدببتان». نعطي النموذج آلاف الصور المسمّاة ونتركه يستنتج.", hot: ["data"] },
    { caption: "في البداية أوزان النموذج عشوائية فتخميناته عشوائية: يقول «كلب» لصورة قطة.", hot: ["data", "model", "guess"], packets: [{ from: "data", to: "model" }, { from: "model", to: "guess", tone: "bad" }] },
    { caption: "نقيس الخطأ (البعد بين التخمين والجواب الصحيح) ونعدّل كل وزن قليلاً في الاتجاه الذي يقلّله. هذه هي «الانتشار الخلفي».", hot: ["guess", "err", "model"], packets: [{ from: "guess", to: "err", tone: "bad" }, { from: "err", to: "model", label: "عدّل" }] },
    { caption: "نكرّر ملايين المرات على كل الأمثلة. الخطأ ينخفض تدريجياً حتى يصيب النموذج صوراً لم يرها قط.", hot: ["model", "guess"], packets: [{ from: "data", to: "model" }, { from: "model", to: "guess", tone: "ok" }] },
    { caption: "الخطر: لو حفظ الأمثلة بدل فهمها (إفراط في التوافق) يفشل على الجديد. ولو كانت الأمثلة منحازة، تعلّم الانحياز نفسه.", hot: ["data", "err"] },
  ],
};

export const neuralNet = {
  id: "neural-networks", title: "طبقات تمرّر إشارة وتصقلها", w: 100, h: 60,
  nodes: [
    { id: "i1", kind: "binary", x: 12, y: 24, label: "بكسل" }, { id: "i2", kind: "binary", x: 12, y: 50, label: "بكسل" }, { id: "i3", kind: "binary", x: 12, y: 76, label: "بكسل" },
    { id: "h1", kind: "brain", x: 42, y: 20, label: "حافة" }, { id: "h2", kind: "brain", x: 42, y: 50, label: "منحنى" }, { id: "h3", kind: "brain", x: 42, y: 80, label: "زاوية" },
    { id: "h4", kind: "brain", x: 68, y: 34, label: "أذن" }, { id: "h5", kind: "brain", x: 68, y: 66, label: "شارب" }, { id: "o", kind: "sparkles", x: 90, y: 50, label: "«قطة»", big: true },
  ],
  links: [["i1", "h1"], ["i1", "h2"], ["i2", "h2"], ["i2", "h3"], ["i3", "h3"], ["i3", "h1"], ["h1", "h4"], ["h2", "h4"], ["h2", "h5"], ["h3", "h5"], ["h4", "o"], ["h5", "o"]],
  steps: [
    { caption: "المدخل أرقام فقط: سطوع كل بكسل. الصورة الصغيرة = آلاف الأرقام.", hot: ["i1", "i2", "i3"] },
    { caption: "كل «عصبون» يضرب مدخلاته بأوزانه ويجمع، ويمرّر الناتج إن تجاوز عتبة. الطبقة الأولى تتعلّم اكتشاف حواف ومنحنيات بسيطة.", hot: ["h1", "h2", "h3"], packets: [{ from: "i1", to: "h1" }, { from: "i2", to: "h2" }, { from: "i3", to: "h3" }] },
    { caption: "الطبقة التالية تركّب البسيط في أعقد: حواف بترتيب معين = أذن، منحنيات = شارب. كلما عمقت الشبكة صارت المفاهيم أكثر تجريداً.", hot: ["h4", "h5"], packets: [{ from: "h1", to: "h4" }, { from: "h2", to: "h4" }, { from: "h2", to: "h5" }, { from: "h3", to: "h5" }] },
    { caption: "الطبقة الأخيرة تعطي احتمالاً لكل صنف. الأوزان (المليارات في النماذج الكبيرة) هي كل ما «يعرفه» النموذج، وقد ضُبطت بالتدريب لا باليد.", hot: ["o"], packets: [{ from: "h4", to: "o", tone: "ok" }, { from: "h5", to: "o", tone: "ok" }] },
  ],
};

export const llm = {
  id: "llms-chatgpt", title: "المساعد لا «يعرف»، بل يتوقّع الكلمة التالية", w: 100, h: 50,
  nodes: [
    { id: "you", kind: "user", x: 10, y: 50, label: "أنت" }, { id: "tok", kind: "binary", x: 34, y: 50, label: "رموز", sub: "tokens" }, { id: "model", kind: "brain", x: 60, y: 50, label: "النموذج", sub: "مليارات الأوزان", big: true },
    { id: "next", kind: "sparkles", x: 86, y: 24, label: "الكلمة التالية", sub: "الأرجح" }, { id: "out", kind: "chat", x: 86, y: 78, label: "الجواب" },
  ],
  links: [["you", "tok"], ["tok", "model"], ["model", "next"], ["next", "out"], ["next", "tok"]],
  steps: [
    { caption: "تكتب سؤالاً. يُقطَّع إلى رموز (أجزاء كلمات) ويتحول كل رمز إلى أرقام.", hot: ["you", "tok"], packets: [{ from: "you", to: "tok" }] },
    { caption: "النموذج، وقد قرأ في تدريبه تريليونات الكلمات، يحسب احتمال كل كلمة ممكنة أن تأتي بعد نصك.", hot: ["tok", "model", "next"], packets: [{ from: "tok", to: "model" }, { from: "model", to: "next", label: "«عاصمة» 41٪" }] },
    { caption: "يختار واحدة (ليس دائماً الأرجح، لذلك تختلف الأجوبة)، يلحقها بالنص، ويعيد الحساب للكلمة التي بعدها. كلمة كلمة حتى الجواب كاملاً.", hot: ["next", "tok", "out"], packets: [{ from: "next", to: "tok" }, { from: "next", to: "out", tone: "ok" }] },
    { caption: "لهذا قد «يهلوس»: يكتب جملة سلسة ومحتملة لغوياً لكنها غير صحيحة. النموذج لا يبحث في مصدر ولا يتحقق، إلا إذا أُعطي أدوات بحث. تحقق من الأرقام والمراجع دائماً.", hot: ["model", "out"] },
  ],
};

export const recommend = {
  id: "recommendation-systems", title: "لماذا يقترح عليك التطبيق هذا الفيديو بالذات", w: 100, h: 56,
  nodes: [
    { id: "you", kind: "user", x: 12, y: 30, label: "أنت", sub: "شاهدت أ، ب" }, { id: "sim", kind: "users", x: 12, y: 76, label: "أشباهك", sub: "شاهدوا أ، ب، ج" }, { id: "eng", kind: "brain", x: 50, y: 50, label: "محرك التوصية", big: true },
    { id: "c", kind: "image", x: 88, y: 30, label: "الفيديو ج", sub: "مرشّح" }, { id: "d", kind: "image", x: 88, y: 76, label: "الفيديو د" },
  ],
  links: [["you", "eng"], ["sim", "eng"], ["eng", "c"], ["eng", "d"], ["c", "you"]],
  steps: [
    { caption: "كل مشاهدة، إعجاب، توقّف، أو تخطٍّ يُسجَّل. أنت صف من الأرقام: ماذا فعلت مع كل عنصر.", hot: ["you", "eng"], packets: [{ from: "you", to: "eng", label: "أ ✓ ب ✓" }] },
    { caption: "المحرك يجد أشخاصاً سلوكهم يشبه سلوكك: شاهدوا أ وب مثلك… وشاهدوا ج أيضاً.", hot: ["sim", "eng"], packets: [{ from: "sim", to: "eng", label: "أ ب ج" }] },
    { caption: "الاستنتاج: ج مرشّح قوي لك. يُرتّب المرشّحون بنموذج يتوقع احتمال أن تشاهد حتى النهاية.", hot: ["eng", "c"], packets: [{ from: "eng", to: "c", tone: "ok" }, { from: "eng", to: "d", tone: "bad" }] },
    { caption: "ردّ فعلك على ج يعود إلى المحرك ويحسّن التوقع التالي. الهدف المُحسَّن هو وقت المشاهدة، لا فائدتك؛ لذلك تنشأ «فقاعة» تُريك المزيد من نفس الشيء.", hot: ["c", "you", "eng"], packets: [{ from: "c", to: "you", tone: "ok" }, { from: "you", to: "eng" }] },
  ],
};
