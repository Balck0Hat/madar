import { sleepUnit } from "./sleep";
import { learningUnit } from "./learning";

// المحتوى المكتوب فعلاً، مفهرس بمعرّف الوحدة
export const CONTENT = {
  "human-1-3": sleepUnit,
  "center-1": learningUnit,
};

export const hasContent = (unitId) => Boolean(CONTENT[unitId]);
