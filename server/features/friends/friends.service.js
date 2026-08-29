import Friendship from "./friendship.model.js";
import { models } from "../../shared/utils/models.js";
import { weekKey } from "../../shared/utils/week.js";
import { badRequest, conflict, notFound } from "../../shared/utils/AppError.js";

const eq = (a, b) => String(a) === String(b);

// يجمع اسم/معرّف كل مستخدم ونقاطه؛ البريد لا يخرج من هنا أبداً
async function profilesOf(ids) {
  if (!ids.length) return new Map();
  const users = await models.User().find({ _id: { $in: ids } }).select("name handle tier").lean();
  const progs = await models.Progress().find({ user: { $in: ids } }).select("user xp weeklyXp weekKey streak").lean();
  const wk = weekKey();
  const byUser = new Map(progs.map((p) => [String(p.user), p]));
  return new Map(
    users.map((u) => {
      const p = byUser.get(String(u._id));
      return [
        String(u._id),
        // نقاط الأسبوع تُقرأ فقط إن كانت من الأسبوع الجاري، وإلا فهي بقايا أسبوع منقضٍ
        { id: String(u._id), name: u.name, handle: u.handle, tier: u.tier, xp: p?.xp || 0, streak: p?.streak || 0, weeklyXp: p && p.weekKey === wk ? p.weeklyXp : 0 },
      ];
    }),
  );
}

const blank = (id) => ({ id: String(id), name: "مستخدم محذوف", handle: "", tier: 0, xp: 0, streak: 0, weeklyXp: 0 });

async function edgesOf(userId) {
  return Friendship.find({ $or: [{ from: userId }, { to: userId }] }).sort("-createdAt").lean();
}

export async function listFriends(userId) {
  const edges = await edgesOf(userId);
  const otherOf = (e) => (eq(e.from, userId) ? e.to : e.from);
  const profiles = await profilesOf(edges.map(otherOf));
  const pick = (e) => ({ friendshipId: String(e._id), ...(profiles.get(String(otherOf(e))) || blank(otherOf(e))) });
  return {
    friends: edges.filter((e) => e.status === "accepted").map(pick),
    incoming: edges.filter((e) => e.status === "pending" && eq(e.to, userId)).map(pick),
    outgoing: edges.filter((e) => e.status === "pending" && eq(e.from, userId)).map(pick),
  };
}

export async function sendRequest(userId, handle) {
  const target = await models.User().findOne({ handle }).select("_id name handle").lean();
  if (!target) throw notFound("لا يوجد مستخدم بهذا المعرّف", "USER_NOT_FOUND");
  if (eq(target._id, userId)) throw badRequest("لا يمكنك إضافة نفسك", "SELF_REQUEST");
  // الاتجاهان يُفحصان معاً: طلب معاكس قائم يعني أن العلاقة موجودة فعلاً
  const existing = await Friendship.findOne({ $or: [{ from: userId, to: target._id }, { from: target._id, to: userId }] }).lean();
  if (existing) throw conflict(existing.status === "accepted" ? "أنتما صديقان بالفعل" : "هناك طلب معلّق بينكما", "ALREADY_LINKED");
  const doc = await Friendship.create({ from: userId, to: target._id, status: "pending" });
  return { friendshipId: String(doc._id), status: doc.status, to: { id: String(target._id), name: target.name, handle: target.handle } };
}

export async function acceptRequest(userId, id) {
  // المستقبِل وحده يقبل، والطلب المعلّق وحده يُقبل
  const doc = await Friendship.findOneAndUpdate({ _id: id, to: userId, status: "pending" }, { $set: { status: "accepted" } }, { new: true }).lean();
  if (!doc) throw notFound("لا يوجد طلب صداقة بهذا المعرّف", "REQUEST_NOT_FOUND");
  return { friendshipId: String(doc._id), status: doc.status };
}

// حذف واحد يخدم الثلاثة: إزالة صديق، وسحب طلب مُرسَل، ورفض طلب وارد
export async function removeFriend(userId, id) {
  const res = await Friendship.deleteOne({ _id: id, $or: [{ from: userId }, { to: userId }] });
  if (!res.deletedCount) throw notFound("لا توجد علاقة بهذا المعرّف", "FRIENDSHIP_NOT_FOUND");
  return { friendshipId: String(id), removed: true };
}

// دوري خاص: أنا وأصدقائي المقبولون فقط، مرتبين بنقاط هذا الأسبوع
export async function friendsLeague(userId) {
  const edges = await edgesOf(userId);
  const ids = edges.filter((e) => e.status === "accepted").map((e) => (eq(e.from, userId) ? e.to : e.from));
  const profiles = await profilesOf([...ids, userId]);
  const rows = [...ids, userId]
    .map((id) => ({ ...(profiles.get(String(id)) || blank(id)), me: eq(id, userId) }))
    .sort((a, b) => b.weeklyXp - a.weeklyXp || a.name.localeCompare(b.name, "ar"));
  return { week: weekKey(), rows, total: rows.length, myRank: rows.findIndex((r) => r.me) + 1 };
}
