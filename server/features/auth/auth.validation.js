import { z } from "zod";

const email = z.string().trim().toLowerCase().email("بريد غير صالح").max(120);
const password = z
  .string()
  .min(8, "كلمة المرور 8 أحرف على الأقل")
  .max(72)
  .regex(/[A-Za-z]/, "يجب أن تحتوي حرفاً")
  .regex(/\d/, "يجب أن تحتوي رقماً");

export const registerSchema = {
  body: z.object({ name: z.string().trim().min(1, "الاسم مطلوب").max(40), email, password }).strict(),
};

export const loginSchema = {
  body: z.object({ email, password: z.string().min(1).max(72) }).strict(),
};
