import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import * as friends from "./friends.service.js";

export const list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await friends.listFriends(req.user.id) });
});

export const request = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await friends.sendRequest(req.user.id, req.body.handle) });
});

export const accept = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await friends.acceptRequest(req.user.id, req.params.id) });
});

export const remove = asyncHandler(async (req, res) => {
  await friends.removeFriend(req.user.id, req.params.id);
  res.status(204).end();
});

export const league = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await friends.friendsLeague(req.user.id) });
});
