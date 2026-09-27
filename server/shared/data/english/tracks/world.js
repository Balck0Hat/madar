// رحلة القواعد: سبع محطات بترتيب ثابت من الأسفل إلى القمة. كل محطة مجموعة دروس (وسوم) مرتّبة،
// والأسهم داخلها «متطلبات»: العقدة تُفتح حين تُتقن العقدة التي تسبقها. المحطة التالية تُفتح
// باجتياز «زعيم» المحطة السابقة (امتحان من كل مواضيعها). الاسم ISLANDS باقٍ لأن الخدمة والاختبارات تعتمده.
const chain = (tags) => tags.slice(1).map((t, i) => [tags[i], t]);
const stage = (id, title, en, level, tone, nodes, edges = chain(nodes)) => ({ id, title, en, level, tone, nodes, edges });

export const ISLANDS = [
  stage("sentence", "ابنِ الجملة", "Build a Sentence", "A1–A2", "green", ["be-have", "pronouns", "questions", "articles"], [["be-have", "pronouns"], ["be-have", "questions"], ["pronouns", "articles"]]),
  stage("time", "آلة الزمن", "Time Machine", "A1–B1", "orange", ["present", "past", "future", "perfect"]),
  stage("verb", "مختبر الأفعال", "Verb Lab", "B1", "red", ["modals", "passive", "gerund-inf", "phrasal"]),
  stage("connect", "اربط الأفكار", "Connect Ideas", "B1", "blue", ["linking", "relative", "conditionals"]),
  stage("detail", "المعنى والتفاصيل", "Meaning & Detail", "A2", "violet", ["prepositions", "quantifiers", "comparatives"]),
  stage("natural", "الإنجليزية الطبيعية", "Natural English", "A1–B2", "teal", ["daily-vocab", "reported", "confusables", "collocation", "idiom"]),
  stage("mastery", "الإتقان", "Mastery", "B1–C1", "gold", ["word-form", "inversion", "academic-vocab"]),
];

export const MASTERY = 75; // نسبة إتقان العقدة (أفضل تمرين)
export const BOSS_ITEMS = 15;
export const BOSS_PASS = 70;

export const islandById = (id) => ISLANDS.find((i) => i.id === id) || null;
export const islandOfTag = (tag) => ISLANDS.find((i) => i.nodes.includes(tag)) || null;
