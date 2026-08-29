# مدار — افهم كل شيء. خطوة خطوة.

منصة ثقافة عامة بالعربية: عجلة من 10 مجالات × 3 مدارات × 8 وحدات، مع نقاط خبرة وخيوط معرفة وأوسمة ومراجعة متباعدة ودوري أسبوعي وشهادة موثقة. MERN: React (Vite, PWA) + Express + MongoDB.

## التشغيل

```bash
cd server && cp .env.example .env         # عدّل الأسرار ثم:
npm install && npm start                  # يزرع الوحدات المكتوبة تلقائياً ويقدّم الواجهة والـ API على 3105
cd client && npm install && npm run dev   # واجهة التطوير على 5173 (proxy لـ /api)
npm test                                  # في server/ (Supertest على قاعدة madar_test) وفي client/ (RTL)
cd client && npm run build && cd ../server && pm2 start server.js --name madar && pm2 save
```

## الميزات

| المجال | ما يعمل |
|---|---|
| **المحتوى** | **المدار الأول مكتوب بالكامل: 83 وحدة** (المركز + 10 مجالات × 8) في `server/shared/data/seed/units/` — 825 بطاقة و2,248 سؤالاً؛ تُزرع عند الإقلاع، و`node scripts/seed.js --force` يستبدل ما في القاعدة بنسخة الملفات، و`node scripts/validate-seed.js` يدقق أي وحدة (القواعد في `seed/CONTENT_GUIDE.md`) · محرّر أدمن كامل (بطاقات، خيط، بنك أسئلة حتى 60) · الاختبار 10 أسئلة عشوائية من البنك، والتصحيح على الخادم · الأسئلة المفتوحة: Claude API إن وُضع `ANTHROPIC_API_KEY`، وإلا تصحيح تقريبي بالكلمات المفتاحية |
| **التعلّم** | مراجعة متباعدة (1 → 3 → 7 → 30 → 90 يوماً) مع «مراجعة الصباح» · مكتبة الخلاصات · امتحان المدار (30 سؤالاً، 80%) يمنح شهادة برمز تحقق عام `/verify/:code` |
| **التحفيز** | دوري حقيقي بين المستخدمين بطبقات (صعود 7 / هبوط 5 عند 12 متعلماً) يتدوّر كل اثنين · تجميد السلسلة (يُكسب كل 7 أيام، حد 2) · تذكيرات Web Push (8:00 مراجعة، 20:00 سلسلة) · صفحة عامة `/u/:handle` |
| **الحساب** | بريد + كلمة مرور، أو Google (عند ضبط `GOOGLE_CLIENT_ID/SECRET`) · JWT في كوكيز httpOnly مع تدوير رمز التحديث · أدوار (`ADMIN_EMAILS`) |
| **التطبيق** | PWA قابل للتثبيت، يقرأ الوحدات المفتوحة دون اتصال · لوحة مشرف: إحصاءات، تكاملات، أكثر الأسئلة خطأً |

## API (`/api/v1`) — أهم المسارات

`auth/{register,login,refresh,logout,providers,google}` · `users/me` · `progress` · `progress/units/:id/finish` `{answers}` أو `{correct,total,sim}` · `content/units[/:id[/quiz]]` · `content/summaries` · `reviews/due` · `reviews/:id/answer` · `exam/{status,start,submit}` · `exam/verify/:code` · `league` · `push/{key,subscribe,unsubscribe}` · `public/users/:handle` · `admin/{overview,users,units}`.

الاستجابة دائماً `{ success, data }` أو `{ success:false, error:{message,code} }`.

## البنية (feature-based، كل ملف تحت 150 سطراً)

```
client/src/app         App.jsx · useGame.js (الحالة من الخادم) · routes.js (المسارات العامة)
client/src/features    onboarding · auth · map · domain · unit · quiz · review · exam · library · league · public · admin · profile · progress · content · push
client/src/shared      components (ui, wheel, art, icons) · hooks (useAsync, useTilt) · data · utils · context · constants
client/public          manifest.webmanifest · sw.js · icon.svg
server/features        auth · users · content · progress · reviews · exam · league · push · public · admin
server/shared          config · database · middleware · utils (game, grading, ai, events, models, week) · jobs/scheduler.js · data/seed
```

الميزات لا تستورد بعضها: التواصل عبر `shared/utils/events.js` (مثل `unit.passed` → جدولة مراجعة، `xp.grant`) و`shared/utils/models.js` للوصول الكسول إلى النماذج من المهام المشتركة.

## الإعداد الاختياري

- `ANTHROPIC_API_KEY` — تصحيح ذكي للأسئلة المفتوحة (فوترة مستقلة عن اشتراك Claude.ai). معطّل افتراضياً.
- `GOOGLE_CLIENT_ID/SECRET` — زر Google يظهر تلقائياً. Redirect URI: `{APP_URL}/api/v1/auth/google/callback`.
- `VAPID_*` — `npx web-push generate-vapid-keys`. الإشعارات تحتاج HTTPS على الأجهزة الفعلية (تعمل على localhost).
- `COOKIE_SECURE=true` خلف TLS.
