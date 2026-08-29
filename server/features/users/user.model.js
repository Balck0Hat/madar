import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const refreshTokenSchema = new mongoose.Schema(
  { jti: { type: String, required: true }, hash: { type: String, required: true }, expiresAt: { type: Date, required: true } },
  { _id: false },
);

const settingsSchema = new mongoose.Schema(
  {
    minutes: { type: Number, enum: [15, 30, 60], default: 30 },
    fav: { type: String, default: "human", trim: true },
    arabicNums: { type: Boolean, default: false },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "الاسم مطلوب"], trim: true, maxlength: 40 },
    email: { type: String, required: [true, "البريد مطلوب"], unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: [true, "كلمة المرور مطلوبة"], select: false },
    refreshTokens: { type: [refreshTokenSchema], select: false, default: [] },
    settings: { type: settingsSchema, default: () => ({}) },
    failedLogins: { type: Number, default: 0, select: false },
  },
  { timestamps: true },
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublic = function toPublic() {
  return { id: String(this._id), name: this.name, email: this.email, settings: this.settings, createdAt: this.createdAt };
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
