import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { randomCode } from "../../shared/utils/tokens.js";

const refreshTokenSchema = new mongoose.Schema(
  { jti: { type: String, required: true }, hash: { type: String, required: true }, expiresAt: { type: Date, required: true } },
  { _id: false },
);

const settingsSchema = new mongoose.Schema(
  {
    minutes: { type: Number, enum: [15, 30, 60], default: 30 },
    fav: { type: String, default: "human", trim: true },
    arabicNums: { type: Boolean, default: false },
    reminders: { type: Boolean, default: true },
    // تفضيلات العرض: تُقرأ عند الإقلاع قبل أول رسم لتفادي وميض الثيم
    theme: { type: String, enum: ["system", "dark", "light"], default: "system" },
    // مقياس الخط: يوسّع النص للقارئ المسنّ دون كسر التخطيط
    fontScale: { type: Number, default: 1, min: 0.9, max: 1.4 },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "الاسم مطلوب"], trim: true, maxlength: 40 },
    email: { type: String, required: [true, "البريد مطلوب"], unique: true, lowercase: true, trim: true, index: true },
    // معرّف عام للمشاركة: /u/:handle
    handle: { type: String, unique: true, index: true, trim: true },
    password: { type: String, select: false, required: [function needsPassword() { return !this.provider; }, "كلمة المرور مطلوبة"] },
    provider: { type: String, enum: ["google"], default: undefined },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    tier: { type: Number, default: 0, min: 0, max: 9, index: true },
    refreshTokens: { type: [refreshTokenSchema], select: false, default: [] },
    settings: { type: settingsSchema, default: () => ({}) },
    failedLogins: { type: Number, default: 0, select: false },
  },
  { timestamps: true },
);

userSchema.pre("save", async function prepare(next) {
  if (!this.handle) this.handle = `${this.name.replace(/\s+/g, "-").slice(0, 24)}-${randomCode(4).toLowerCase()}`;
  if (this.isModified("password") && this.password) this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return this.password ? bcrypt.compare(candidate, this.password) : Promise.resolve(false);
};

userSchema.methods.toPublic = function toPublic() {
  return { id: String(this._id), name: this.name, email: this.email, handle: this.handle, role: this.role, tier: this.tier, provider: this.provider, settings: this.settings, createdAt: this.createdAt };
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
