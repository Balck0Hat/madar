// عالم القواعد: خمس جزر، كل جزيرة مجموعة دروس (وسوم) مرتّبة، والأسهم داخلها «متطلبات»:
// العقدة تُفتح حين تُتقن العقد التي تسبقها. جزيرة الكلمات جانبية مفتوحة دائماً. الجزر
// الأخرى تُفتح بالترتيب باجتياز «زعيم» الجزيرة السابقة (امتحان من كل مواضيعها).
export const ISLANDS = [
  { id: "base", title: "أساس الجملة", level: "A1", tone: "green", nodes: ["be-have", "pronouns", "questions", "articles", "quantifiers"],
    edges: [["be-have", "pronouns"], ["be-have", "questions"], ["pronouns", "articles"], ["questions", "quantifiers"]] },
  { id: "time", title: "الزمن", level: "A1–B1", tone: "gold", nodes: ["present", "past", "future", "perfect"],
    edges: [["present", "past"], ["past", "future"], ["future", "perfect"]] },
  { id: "verb", title: "حول الفعل", level: "A2–B2", tone: "red", nodes: ["modals", "passive", "gerund-inf", "conditionals", "reported"],
    edges: [["modals", "passive"], ["passive", "gerund-inf"], ["gerund-inf", "conditionals"], ["conditionals", "reported"]] },
  { id: "link", title: "ربط الجمل", level: "B1–C1", tone: "ink", nodes: ["prepositions", "comparatives", "relative", "linking", "inversion"],
    edges: [["prepositions", "comparatives"], ["comparatives", "relative"], ["relative", "linking"], ["linking", "inversion"]] },
  { id: "words", title: "الكلمات", level: "A1–C1", tone: "muted", side: true, nodes: ["daily-vocab", "word-form", "collocation", "phrasal", "confusables", "idiom", "academic-vocab"],
    edges: [["daily-vocab", "word-form"], ["word-form", "collocation"], ["collocation", "phrasal"], ["phrasal", "confusables"], ["confusables", "idiom"], ["idiom", "academic-vocab"]] },
];

export const MASTERY = 75; // نسبة إتقان العقدة (أفضل تمرين)
export const BOSS_ITEMS = 15;
export const BOSS_PASS = 70;

export const islandById = (id) => ISLANDS.find((i) => i.id === id) || null;
export const islandOfTag = (tag) => ISLANDS.find((i) => i.nodes.includes(tag)) || null;
