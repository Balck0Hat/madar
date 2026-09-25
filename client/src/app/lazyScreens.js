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
export const FiguresScreen = lazy(() => import("../features/figures").then((m) => ({ default: m.FiguresScreen })));
export const EnglishScreen = lazy(() => import("../features/english").then((m) => ({ default: m.EnglishScreen })));
export const PlacementScreen = lazy(() => import("../features/english").then((m) => ({ default: m.PlacementScreen })));
export const BooksScreen = lazy(() => import("../features/books").then((m) => ({ default: m.BooksScreen })));
export const BookScreen = lazy(() => import("../features/books").then((m) => ({ default: m.BookScreen })));
export const ChapterScreen = lazy(() => import("../features/books").then((m) => ({ default: m.ChapterScreen })));
export const QuranScreen = lazy(() => import("../features/quran").then((m) => ({ default: m.QuranScreen })));
export const SuraScreen = lazy(() => import("../features/quran").then((m) => ({ default: m.SuraScreen })));
export const ListenScreen = lazy(() => import("../features/quran").then((m) => ({ default: m.ListenScreen })));
export const ReciteScreen = lazy(() => import("../features/quran").then((m) => ({ default: m.ReciteScreen })));
export const PoliticsScreen = lazy(() => import("../features/politics").then((m) => ({ default: m.PoliticsScreen })));
export const CountryScreen = lazy(() => import("../features/politics").then((m) => ({ default: m.CountryScreen })));
export const FigureScreen = lazy(() => import("../features/figures").then((m) => ({ default: m.FigureScreen })));
