import User from "./user.model.js";
import { notFound } from "../../shared/utils/AppError.js";

export async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) throw notFound("المستخدم غير موجود", "USER_NOT_FOUND");
  return user.toPublic();
}

// مفاتيح تعيش تحت settings؛ ما عداها (name) حقل جذر
const SETTING_KEYS = ["minutes", "fav", "arabicNums", "reminders", "theme", "fontScale"];

export async function updateMe(userId, body) {
  const $set = {};
  if (body.name !== undefined) $set.name = body.name;
  for (const key of SETTING_KEYS) if (body[key] !== undefined) $set[`settings.${key}`] = body[key];
  const user = await User.findByIdAndUpdate(userId, { $set }, { new: true, runValidators: true });
  if (!user) throw notFound("المستخدم غير موجود", "USER_NOT_FOUND");
  return user.toPublic();
}
