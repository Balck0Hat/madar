import mongoose from "mongoose";

const { Schema } = mongoose;

// تقدّم القارئ في الكتب: الفصول التي أنهاها، وآخر فصل وصل إليه في كل كتاب.
// مفتاح الفصل «كتاب:رقم». وثيقة واحدة لكل مستخدم.
const bookProgressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    read: { type: Map, of: Date, default: () => new Map() },
    last: { type: Map, of: Number, default: () => new Map() },
  },
  { timestamps: true },
);

const BookProgress = mongoose.models.BookProgress || mongoose.model("BookProgress", bookProgressSchema);
export default BookProgress;
