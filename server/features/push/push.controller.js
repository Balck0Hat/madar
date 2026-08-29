import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as push from "./push.service.js";

export const key = asyncHandler(async (req, res) => {
  const subscribed = req.user ? await push.hasSubscription(req.user.id) : false;
  res.json({ success: true, data: { publicKey: push.publicKey(), subscribed } });
});

export const subscribe = asyncHandler(async (req, res) => {
  await push.subscribe(req.user.id, req.body, req.get("user-agent"));
  res.status(201).json({ success: true, data: { subscribed: true } });
});

export const unsubscribe = asyncHandler(async (req, res) => {
  await push.unsubscribe(req.user.id, req.body.endpoint);
  res.status(204).end();
});

export const test = asyncHandler(async (req, res) => {
  const sent = await push.sendToUser(req.user.id, { title: "مدار", body: "التذكيرات تعمل. نراك غداً صباحاً.", url: "/" });
  res.json({ success: true, data: { sent } });
});
