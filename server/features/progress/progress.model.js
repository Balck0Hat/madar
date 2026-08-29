import mongoose from "mongoose";

const unitResultSchema = new mongoose.Schema(
  {
    score: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 1 },
    perfect: { type: Boolean, default: false },
    sim: { type: Boolean, default: false },
  },
  { _id: false },
);

const lastLeagueSchema = new mongoose.Schema(
  { week: String, outcome: { type: String, enum: ["up", "down", "stay"] }, rank: Number, tier: Number },
  { _id: false },
);

// وثيقة واحدة لكل مستخدم تحمل حالة اللعبة كاملة
const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    progress: { type: Map, of: unitResultSchema, default: () => new Map() },
    attempts: { type: Map, of: Number, default: () => new Map() },
    xp: { type: Number, default: 0, min: 0 },
    weeklyXp: { type: Number, default: 0, min: 0 },
    weekKey: { type: String, default: "" },
    badges: { type: [String], default: [] },
    studied: { type: [String], default: [] },
    // أيام أُنقذت بتجميد السلسلة
    frozenDays: { type: [String], default: [] },
    freezes: { type: Number, default: 0, min: 0, max: 2 },
    streak: { type: Number, default: 0 },
    lastLeague: { type: lastLeagueSchema, default: undefined },
  },
  { timestamps: true },
);

progressSchema.index({ weeklyXp: -1 });

// حالة نقية (كائنات عادية) للمنطق والواجهة
progressSchema.methods.toState = function toState() {
  return {
    progress: Object.fromEntries(this.progress || []),
    attempts: Object.fromEntries(this.attempts || []),
    xp: this.xp,
    weeklyXp: this.weeklyXp,
    badges: [...this.badges],
    studied: [...this.studied],
    frozenDays: [...this.frozenDays],
    freezes: this.freezes,
    streak: this.streak,
    lastLeague: this.lastLeague ? { ...this.lastLeague.toObject() } : null,
  };
};

const Progress = mongoose.models.Progress || mongoose.model("Progress", progressSchema);
export default Progress;
