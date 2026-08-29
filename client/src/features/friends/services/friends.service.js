import { get, post, del } from "../../../shared/utils/api";

// كل نداءات الأصدقاء في مكان واحد؛ المكوّنات لا تعرف شكل المسارات
export const getFriends = () => get("/friends");

export const getFriendsLeague = () => get("/friends/league");

export const sendRequest = (handle) => post("/friends/requests", { handle });

export const acceptRequest = (id) => post(`/friends/requests/${encodeURIComponent(id)}/accept`);

// رفض طلب وارد وإلغاء طلب صادر يستخدمان المسار نفسه (حذف الطلب)
export const dropRequest = (id) => del(`/friends/requests/${encodeURIComponent(id)}`);

export const removeFriend = (id) => del(`/friends/${encodeURIComponent(id)}`);
