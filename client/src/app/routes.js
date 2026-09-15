// مسارات التطبيق في مكان واحد: تُبنى منها الروابط ويُقرأ منها التنقّل
export const paths = {
  home: "/",
  auth: (mode = "register") => `/auth/${mode}`,
  onboarding: "/welcome",
  domain: (id, ring = 0) => `/d/${id}/${ring + 1}`,
  unit: (id) => `/u/${id}`,
  quiz: (id) => `/u/${id}/quiz`,
  result: "/result",
  review: "/review",
  exam: "/exam",
  library: "/library",
  figures: "/figures",
  figure: (id) => `/figures/${encodeURIComponent(id)}`,
  publicFigure: (id) => `/f/${encodeURIComponent(id)}`,
  search: "/search",
  stats: "/stats",
  friends: "/friends",
  league: "/league",
  me: "/me",
  admin: "/admin",
  publicProfile: (handle) => `/p/${encodeURIComponent(handle)}`,
  verify: (code) => `/verify/${encodeURIComponent(code)}`,
};

// أقسام التنقّل الرئيسية (شريط سفلي/جانبي)
export const NAV_PATHS = [paths.home, paths.league, paths.me, paths.search, paths.stats, paths.friends, paths.figures];

// شاشات تملأ العرض بلا شريط جانبي: القراءة والاختبار والصفحات العامة
const FOCUS = [/^\/auth/, /^\/welcome$/, /^\/u\//, /^\/figures\/./, /^\/f\//, /^\/result$/, /^\/review$/, /^\/exam$/, /^\/p\//, /^\/verify\//];
export const isFocus = (pathname) => FOCUS.some((re) => re.test(pathname));

// إشارات تصل مع رابط العودة من Google
export const readFlags = () => {
  const p = new URLSearchParams(window.location.search);
  return { isNew: p.get("new") === "1", authFailed: p.get("auth") === "failed" };
};
export const cleanUrl = () => {
  if (window.location.search) window.history.replaceState(null, "", window.location.pathname);
};
