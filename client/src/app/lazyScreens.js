import { lazy } from "react";

// شاشات تُحمَّل عند الحاجة: لوحة المشرف ومحرّرها والرسوم البيانية وصفحات نادرة الاستخدام.
// لا داعي لأن يحمل كل متعلّم شيفرة المحرّر التي لن يفتحها أبداً.
export const AdminScreen = lazy(() => import("../features/admin").then((m) => ({ default: m.AdminScreen })));
export const StatsScreen = lazy(() => import("../features/stats").then((m) => ({ default: m.StatsScreen })));
export const FriendsScreen = lazy(() => import("../features/friends").then((m) => ({ default: m.FriendsScreen })));
export const SearchScreen = lazy(() => import("../features/search").then((m) => ({ default: m.SearchScreen })));
export const LibraryScreen = lazy(() => import("../features/library").then((m) => ({ default: m.LibraryScreen })));
export const ExamScreen = lazy(() => import("../features/exam").then((m) => ({ default: m.ExamScreen })));
export const VerifyPage = lazy(() => import("../features/exam").then((m) => ({ default: m.VerifyPage })));
export const PublicProfile = lazy(() => import("../features/public").then((m) => ({ default: m.PublicProfile })));
export const ReviewScreen = lazy(() => import("../features/review").then((m) => ({ default: m.ReviewScreen })));
export const SectorCelebration = lazy(() => import("../features/celebrate").then((m) => ({ default: m.SectorCelebration })));
