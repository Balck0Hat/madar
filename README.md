# مدار — افهم كل شيء. خطوة خطوة.

منصة ثقافة عامة بالعربية: عجلة من 10 مجالات × 3 مدارات × 8 وحدات، مع نقاط خبرة وخيوط معرفة وأوسمة ودوري أسبوعي وشهادة. MERN: React (Vite) + Express + MongoDB.

## التشغيل

```bash
# الخادم (يقدّم الـ API وواجهة React المبنية معاً)
cd server && cp .env.example .env   # عدّل الأسرار
npm install && npm start            # http://localhost:3105

# الواجهة في التطوير (مع proxy لـ /api → 3105)
cd client && npm install && npm run dev   # http://localhost:5173

# الاختبارات
cd server && npm test   # Vitest + Supertest على قاعدة madar_test الحقيقية
cd client && npm test   # Vitest + React Testing Library

# نشر
cd client && npm run build
cd server && pm2 start server.js --name madar && pm2 save
```

## API (`/api/v1`)

| المسار | الوصف |
|---|---|
| `POST /auth/register` `{name,email,password}` | حساب جديد، يضبط كوكيز httpOnly (وصول 15د + تحديث 7أيام) |
| `POST /auth/login` · `POST /auth/refresh` · `POST /auth/logout` | دخول · تدوير رمز التحديث (إعادة استخدام رمز قديم تُنهي كل الجلسات) · خروج |
| `GET /users/me` · `PATCH /users/me` `{name,minutes,fav,arabicNums}` | الملف والإعدادات |
| `GET /progress` | حالة اللعبة كاملة |
| `POST /progress/units/:unitId/finish` `{correct,total,sim}` | الخادم يحسب النقاط والخيوط والأوسمة والسلسلة ويعيد `{state,result}` |

الاستجابة دائماً `{ success, data }` أو `{ success:false, error:{message,code} }`. تحديد المعدل: 100/15د عام، 5/15د على التسجيل والدخول.

## البنية (feature-based)

```
client/src/
├── app/            App.jsx (الشاشات) · useGame.js (حالة اللعبة من الخادم)
├── features/       onboarding · auth · map · domain · unit · quiz · league · profile · progress
└── shared/         components (ui, wheel, art, icons) · data (المنهج والمحتوى) · utils · context · constants
server/
├── features/       auth · users · progress   (routes · controller · service · model · validation · __tests__)
├── shared/         config · database · middleware (auth, validate, rateLimiter, errorHandler) · utils (game, tokens, cookies)
├── app.js          helmet → cors → json(10kb) → mongoSanitize → cookies → rateLimiter → اكتشاف المسارات تلقائياً → static
└── server.js
```

## الحالة الحالية

- وحدتان مكتوبتان بالكامل: **النوم** (`human-1-3`) و**كيف يتعلم دماغك** (`center-1`). بقية الوحدات تُحاكى من الواجهة (`sim:true`).
- الحسابات والتقدم محفوظة في MongoDB. لا OAuth بعد.
- `COOKIE_SECURE=false` مطلوب عند التقديم عبر HTTP مباشر؛ اجعلها `true` خلف TLS.
- التالي المنطقي: نطاق + HTTPS (Caddy/Nginx)، محرّر محتوى للوحدات، مراجعة متباعدة حقيقية، دوري حقيقي بين المستخدمين.
