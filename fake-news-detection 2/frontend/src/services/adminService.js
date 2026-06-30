import api from "./api.js";

/** Fetch all registered users with their prediction counts (admin only). */
export async function getAllUsers() {
  const response = await api.get("/api/admin/users");
  return response.data;
}

/**
 * Update a user's active status or role (admin only).
 * @param {number} userId
 * @param {{is_active?: boolean, role?: "user"|"admin"}} updates
 */
export async function updateUser(userId, updates) {
  const response = await api.patch(`/api/admin/users/${userId}`, updates);
  return response.data;
}

/** Fetch platform-wide analytics across all users (admin only). */
export async function getPlatformAnalytics() {
  const response = await api.get("/api/admin/analytics");
  return response.data;
}

/** Fetch a specific user's prediction history (admin only). */
export async function getUserHistory(userId, params = {}) {
  const response = await api.get(`/api/admin/users/${userId}/history`, { params });
  return response.data;
}
