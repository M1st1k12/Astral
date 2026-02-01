import api from "../api/http";

export async function searchAll(query) {
  const { data } = await api.get(`/search?query=${encodeURIComponent(query)}`);
  return data;
}

export async function fetchNotifications() {
  const { data } = await api.get("/notifications");
  return data.notifications;
}

export async function markNotificationsRead() {
  await api.post("/notifications/read");
}

export async function toggleBookmark(postId) {
  const { data } = await api.post(`/posts/${postId}/bookmark`);
  return data.bookmarks;
}

export async function repost(postId) {
  const { data } = await api.post(`/posts/${postId}/repost`);
  return data.post;
}

export async function hidePost(postId) {
  await api.post(`/posts/${postId}/hide`);
}

export async function pinPost(postId) {
  await api.post(`/posts/${postId}/pin`);
}

export async function unpinPost(postId) {
  await api.post(`/posts/${postId}/unpin`);
}

export async function deletePost(postId) {
  await api.delete(`/posts/${postId}`);
}

export async function editMessage(id, content) {
  const { data } = await api.patch(`/messages/${id}`, { content });
  return data.message;
}

export async function deleteMessage(id) {
  await api.delete(`/messages/${id}`);
}

export async function reactMessage(id, emoji) {
  const { data } = await api.post(`/messages/${id}/react`, { emoji });
  return data.reactions;
}

export async function getBookmarks() {
  const { data } = await api.get("/users/me/bookmarks");
  return data.posts;
}

export async function getHidden() {
  const { data } = await api.get("/users/me/hidden");
  return data.posts;
}

export async function getFollowRequests() {
  const { data } = await api.get("/users/me/follow-requests");
  return data.requests;
}

export async function approveFollow(userId) {
  await api.post(`/users/${userId}/approve`);
}

export async function denyFollow(userId) {
  await api.post(`/users/${userId}/deny`);
}

export async function getClan(name) {
  const { data } = await api.get(`/users/clan/${encodeURIComponent(name)}`);
  return data;
}

export async function updateClan(name, payload) {
  const { data } = await api.put(`/users/clan/${encodeURIComponent(name)}`, payload);
  return data;
}

export async function kickClanMember(name, userId) {
  const { data } = await api.delete(`/users/clan/${encodeURIComponent(name)}/members/${userId}`);
  return data;
}

export async function updateClanRole(name, userId, role) {
  const { data } = await api.put(`/users/clan/${encodeURIComponent(name)}/members/${userId}/role`, { role });
  return data;
}

export async function leaveClan() {
  const { data } = await api.post("/users/clan/leave");
  return data;
}

export async function inviteToClan(name, username) {
  const { data } = await api.post(`/users/clan/${encodeURIComponent(name)}/invite`, { username });
  return data;
}

export async function getClanInvites() {
  const { data } = await api.get("/users/me/clan-invites");
  return data.invites || [];
}

export async function acceptClanInvite(inviteId) {
  const { data } = await api.post(`/users/clan/invites/${inviteId}/accept`);
  return data;
}

export async function denyClanInvite(inviteId) {
  const { data } = await api.post(`/users/clan/invites/${inviteId}/deny`);
  return data;
}

export async function requestJoinClan(name) {
  const { data } = await api.post(`/users/clan/${encodeURIComponent(name)}/request`);
  return data;
}

export async function listJoinRequests(name) {
  const { data } = await api.get(`/users/clan/${encodeURIComponent(name)}/requests`);
  return data.requests || [];
}

export async function approveJoinRequest(name, id) {
  const { data } = await api.post(`/users/clan/${encodeURIComponent(name)}/requests/${id}/approve`);
  return data;
}

export async function denyJoinRequest(name, id) {
  const { data } = await api.post(`/users/clan/${encodeURIComponent(name)}/requests/${id}/deny`);
  return data;
}

export async function blockUser(userId) {
  const { data } = await api.post(`/users/${userId}/block`);
  return data;
}

export async function unblockUser(userId) {
  const { data } = await api.post(`/users/${userId}/unblock`);
  return data;
}

export async function deleteConversation(conversationId) {
  const { data } = await api.delete(`/conversations/${conversationId}`);
  return data;
}
