import User from "./user.model.js";
import { notFound } from "../../shared/utils/AppError.js";

export async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) throw notFound("المستخدم غير موجود", "USER_NOT_FOUND");
  return user.toPublic();
}

export async function updateMe(userId, { name, minutes, fav, arabicNums }) {
  const $set = {};
  if (name !== undefined) $set.name = name;
  if (minutes !== undefined) $set["settings.minutes"] = minutes;
  if (fav !== undefined) $set["settings.fav"] = fav;
  if (arabicNums !== undefined) $set["settings.arabicNums"] = arabicNums;
  const user = await User.findByIdAndUpdate(userId, { $set }, { new: true, runValidators: true });
  if (!user) throw notFound("المستخدم غير موجود", "USER_NOT_FOUND");
  return user.toPublic();
}
