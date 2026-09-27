// شجرة خريطة القواعد: المركز «قواعد الإنجليزية»، ثمانية فروع، وفي كل فرع مجموعات
// من الموضوعات. محتوى كل موضوع في topics/<branch>.js بالمعرّف نفسه.
// tag: درس الإنجليزية العامة الأقرب (للتمرين)، level: أدنى مستوى يحتاجه.
export const BRANCHES = [
  { id: "tenses", title: "الأزمنة", en: "Tenses", hue: "violet", groups: [
    { id: "present", title: "المضارع", en: "Present", topics: ["present-simple", "present-continuous", "present-perfect", "present-perfect-continuous"] },
    { id: "past", title: "الماضي", en: "Past", topics: ["past-simple", "past-continuous", "past-perfect", "past-perfect-continuous", "used-to"] },
    { id: "future", title: "المستقبل", en: "Future", topics: ["future-will", "future-going-to", "future-present-forms", "future-continuous", "future-perfect"] },
    { id: "tense-links", title: "بين الأزمنة", en: "Across tenses", topics: ["time-expressions", "stative-verbs", "sequence-of-tenses"] },
  ] },
  { id: "verbs", title: "الأفعال", en: "Verbs", hue: "blue", groups: [
    { id: "modals", title: "الأفعال الناقصة", en: "Modals", topics: ["can-could", "may-might", "must-have-to", "should-ought-to", "will-would", "modals-deduction", "modals-past"] },
    { id: "verb-forms", title: "صيغ الفعل", en: "Verb forms", topics: ["infinitives", "gerunds", "participles", "irregular-verbs", "auxiliary-verbs", "imperatives"] },
    { id: "verb-patterns", title: "تراكيب الفعل", en: "Verb patterns", topics: ["phrasal-verbs", "passive-voice", "causative", "subjunctive", "verb-preposition"] },
  ] },
  { id: "nouns", title: "الأسماء والمحددات", en: "Nouns & determiners", hue: "lime", groups: [
    { id: "noun-types", title: "أنواع الأسماء", en: "Types of nouns", topics: ["common-proper", "concrete-abstract", "collective-nouns", "compound-nouns"] },
    { id: "number", title: "العدد والملكية", en: "Number & possession", topics: ["countable-uncountable", "singular-plural", "irregular-plurals", "possessives"] },
    { id: "determiners", title: "المحددات", en: "Determiners", topics: ["articles", "zero-article", "quantifiers", "some-any", "much-many-few-little", "each-every-all", "demonstratives"] },
  ] },
  { id: "pronouns", title: "الضمائر", en: "Pronouns", hue: "teal", groups: [
    { id: "pronoun-types", title: "أنواع الضمائر", en: "Types", topics: ["personal-pronouns", "possessive-pronouns", "reflexive-pronouns", "relative-pronouns", "indefinite-pronouns", "reciprocal-pronouns", "interrogative-pronouns", "dummy-it-there"] },
  ] },
  { id: "modifiers", title: "الصفات والظروف", en: "Adjectives & adverbs", hue: "yellow", groups: [
    { id: "adjectives", title: "الصفات", en: "Adjectives", topics: ["adjective-order", "comparatives", "superlatives", "ed-ing-adjectives", "adjective-preposition", "too-enough", "so-such"] },
    { id: "adverbs", title: "الظروف", en: "Adverbs", topics: ["adverbs-frequency", "adverbs-manner", "adverbs-degree", "adverbs-time-place", "adverb-position", "adjective-vs-adverb"] },
  ] },
  { id: "sentences", title: "الجملة", en: "Sentences", hue: "pink", groups: [
    { id: "structure", title: "بناء الجملة", en: "Structure", topics: ["sentence-structure", "sentence-types", "word-order", "subject-verb-agreement", "there-is-are"] },
    { id: "questions-negatives", title: "الأسئلة والنفي", en: "Questions & negatives", topics: ["yes-no-questions", "wh-questions", "question-tags", "indirect-questions", "negatives"] },
    { id: "emphasis", title: "التوكيد والأسلوب", en: "Emphasis & style", topics: ["inversion", "cleft-sentences", "ellipsis-substitution"] },
  ] },
  { id: "clauses", title: "الجمل الفرعية", en: "Clauses", hue: "orange", groups: [
    { id: "relative", title: "جمل الوصل", en: "Relative clauses", topics: ["defining-relative", "non-defining-relative", "reduced-relative"] },
    { id: "conditionals", title: "الجمل الشرطية", en: "Conditionals", topics: ["zero-conditional", "first-conditional", "second-conditional", "third-conditional", "mixed-conditionals", "unless-provided"] },
    { id: "reported", title: "الكلام المنقول", en: "Reported speech", topics: ["reported-statements", "reported-questions", "reported-commands", "reporting-verbs"] },
    { id: "other-clauses", title: "جمل أخرى", en: "Other clauses", topics: ["noun-clauses", "adverb-clauses", "participle-clauses", "wish-if-only"] },
  ] },
  { id: "connectors", title: "حروف الجر والروابط", en: "Prepositions & linking", hue: "slate", groups: [
    { id: "prepositions", title: "حروف الجر", en: "Prepositions", topics: ["prepositions-time", "prepositions-place", "prepositions-movement", "dependent-prepositions", "prepositions-end"] },
    { id: "linking", title: "الروابط", en: "Linking", topics: ["coordinating-conjunctions", "subordinating-conjunctions", "correlative-conjunctions", "linking-words", "punctuation-basics", "spelling-rules"] },
  ] },
];

export const TOPIC_IDS = BRANCHES.flatMap((b) => b.groups.flatMap((g) => g.topics));
export const LEVEL_BANDS = { basics: ["A1", "A2"], intermediate: ["B1", "B2"], advanced: ["C1", "C2"] };
