import express from "express";
import { badRequest } from "../../shared/utils/AppError.js";

// حدّ الجسم العام في app.js عشرة كيلوبايت، وملف مئة وحدة يتجاوز الميغابايت.
// نستقبل الاستيراد كـ text/plain: المحلّل العام لا يلمسه (لا يطابق نوعه)،
// فنقرأه هنا بحدّ أوسع ثم نحوّله بأنفسنا. الأجسام الصغيرة بـ application/json
// يكون المحلّل العام قد فكّها، فنمرّرها كما هي.
const readText = express.text({ type: ["text/plain", "application/json"], limit: "8mb" });

const toJson = (req, res, next) => {
  if (typeof req.body !== "string") return next();
  if (!req.body.trim()) return next(badRequest("لا محتوى في الطلب", "EMPTY_BODY"));
  try {
    req.body = JSON.parse(req.body);
  } catch {
    return next(badRequest("JSON غير صالح: تحقّق من الأقواس والفواصل", "BAD_JSON"));
  }
  next();
};

export const parseImportBody = [readText, toJson];
