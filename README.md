# مدار — افهم كل شيء. خطوة خطوة.

نموذج أولي لمنصة ثقافة عامة بالعربية: عجلة من 10 مجالات × 3 مدارات × 8 وحدات، مع نقاط خبرة وخيوط معرفة وأوسمة ودوري أسبوعي وشهادة.

## التشغيل

```bash
cd client
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest + React Testing Library
npm run build      # dist/
SINGLE_FILE=1 npm run build   # ملف HTML واحد مضمّن (للمعاينة/المشاركة)
```

## البنية (feature-based)

```
client/src/
├── app/            App.jsx (التنقل بين الشاشات) · useGame.js (حالة اللعبة والنقاط)
├── features/
│   ├── onboarding/ Landing · Onboarding
│   ├── map/        MapScreen · StatsRow · DomainGrid
│   ├── domain/     DomainScreen · UnitRow
│   ├── unit/       UnitScreen · UnitPages · ThreadPage · UnitPlaceholder
│   ├── quiz/       QuizScreen · OrderQuestion · ResultScreen · quiz.utils
│   ├── league/     LeagueScreen
│   └── profile/    ProfileScreen · Certificate · ShareCard · StudyCalendar · BadgeGrid
└── shared/
    ├── components/ ui/ (Btn, Card, Pill, Bar, TopBar, Toast, TabBar, Confetti, OrbitMark)
    │               wheel/ (Wheel, WheelBody, geometry) · art/ · icons/
    ├── data/       domains.js · curriculum.js · content/ (الوحدات المكتوبة)
    ├── utils/      units · progress · level · text
    ├── context/    NumContext (أرقام عربية/لاتينية)
    └── constants/  theme.js
```

## الحالة الحالية

- وحدتان مكتوبتان بالكامل: **النوم** (`human-1-3`) و**كيف يتعلم دماغك** (`center-1`). بقية الوحدات تُحاكى.
- الحالة في الذاكرة فقط (لا خادم ولا تخزين بعد). التسجيل بحسابات Google/Apple تجريبي.
- الخطوة التالية المنطقية: خادم Express + MongoDB لحفظ التقدم والحسابات، ومحرّر محتوى للوحدات.
