/* eslint-disable no-restricted-globals */
// Service Worker: قشرة التطبيق دون اتصال، محتوى الوحدات المقروءة، وإشعارات Push
const VERSION = "madar-v1";
const SHELL = ["/", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

const isContent = (url) => url.pathname.startsWith("/api/v1/content/units/") && !url.pathname.endsWith("/quiz");
const isAsset = (url) => url.pathname.startsWith("/assets/");

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  // الأصول المبنية: من الذاكرة أولاً (أسماؤها تحمل بصمة)
  if (isAsset(url)) {
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); return res; })));
    return;
  }
  // محتوى الوحدات: الشبكة أولاً ثم الذاكرة (للقراءة دون اتصال)
  if (isContent(url)) {
    e.respondWith(fetch(e.request).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); } return res; }).catch(() => caches.match(e.request)));
    return;
  }
  // التنقل: الشبكة ثم قشرة التطبيق
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => caches.match("/")));
  }
});

self.addEventListener("push", (e) => {
  let data = { title: "مدار", body: "لديك ما تراجعه اليوم.", url: "/" };
  try { data = { ...data, ...e.data.json() }; } catch (err) { /* حمولة نصية أو فارغة */ }
  e.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: "/icon.svg", badge: "/icon.svg", dir: "rtl", lang: "ar", tag: data.tag || "madar", data: { url: data.url } }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    const open = list.find((c) => "focus" in c);
    if (open) { open.navigate(url); return open.focus(); }
    return self.clients.openWindow(url);
  }));
});
