const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// ─── Token management ───────────────────────────────────────────────────────

let accessToken: string | null = localStorage.getItem("ww_access_token");
let refreshToken: string | null = localStorage.getItem("ww_refresh_token");

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem("ww_access_token", access);
  localStorage.setItem("ww_refresh_token", refresh);
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem("ww_access_token");
  localStorage.removeItem("ww_refresh_token");
}

export function getAccessToken() {
  return accessToken;
}

export function isAuthenticated() {
  return !!accessToken;
}

// ─── Core fetch wrapper ─────────────────────────────────────────────────────

interface ApiResponseBody<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasNext?: boolean;
    nextCursor?: string;
  };
}

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/v1/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const body: ApiResponseBody<{ accessToken: string; refreshToken: string }> = await res.json();
    if (body.success && body.data) {
      setTokens(body.data.accessToken, body.data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<ApiResponseBody<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Token expired → try refresh once
  if (res.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch<T>(path, options, false);
    }
    clearTokens();
    window.dispatchEvent(new CustomEvent("ww:auth:expired"));
    throw new ApiError("TOKEN_EXPIRED", "인증이 만료되었습니다", 401);
  }

  const body: ApiResponseBody<T> = await res.json();

  if (!body.success && body.error) {
    throw new ApiError(body.error.code, body.error.message, res.status);
  }

  return body;
}

// ─── Auth API ───────────────────────────────────────────────────────────────

export const authApi = {
  signup: (email: string, password: string, name: string) =>
    apiFetch<{ accessToken: string; refreshToken: string; expiresIn: number }>("/api/auth/v1/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    apiFetch<{ accessToken: string; refreshToken: string; expiresIn: number }>("/api/auth/v1/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  kakaoLogin: (kakaoAccessToken: string) =>
    apiFetch<{ accessToken: string; refreshToken: string; expiresIn: number }>("/api/auth/v1/kakao", {
      method: "POST",
      body: JSON.stringify({ accessToken: kakaoAccessToken }),
    }),

  googleLogin: (idToken: string) =>
    apiFetch<{ accessToken: string; refreshToken: string; expiresIn: number }>("/api/auth/v1/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }),

  logout: () => {
    if (!refreshToken) return Promise.resolve();
    return apiFetch<null>("/api/auth/v1/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }).finally(clearTokens);
  },

  resetPassword: (email: string) =>
    apiFetch<null>("/api/auth/v1/password/reset", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch<null>("/api/auth/v1/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// ─── User API ───────────────────────────────────────────────────────────────

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  avatarUrl: string | null;
  totalSteps: number;
  currentCityId: string;
  coupons: number;
  hearts: number;
  friendCount: number;
  createdAt: string;
}

export interface PublicProfile {
  id: number;
  name: string;
  avatarUrl: string | null;
  totalSteps: number;
  currentCityId: string;
  isFriend: boolean;
  joinedAt: string;
}

export const userApi = {
  getMe: () => apiFetch<UserProfile>("/api/users/v1/me"),
  updateMe: (data: { name?: string; avatarUrl?: string }) =>
    apiFetch<UserProfile>("/api/users/v1/me", { method: "PATCH", body: JSON.stringify(data) }),
  getUser: (userId: number) => apiFetch<PublicProfile>(`/api/users/v1/${userId}`),
  uploadAvatar: (imageKey: string) =>
    apiFetch<{ avatarUrl: string }>(`/api/users/v1/me/avatar?imageKey=${encodeURIComponent(imageKey)}`, { method: "POST" }),
};

// ─── Steps API ──────────────────────────────────────────────────────────────

export interface StepInfo {
  totalSteps: number;
  currentCityId: string;
  currentCityName: string;
  nextCityId: string | null;
  nextCityName: string | null;
  stepsToNextCity: number;
  progressPercent: number;
  newlyUnlockedCities: string[];
}

export interface StepHistory {
  records: { date: string; steps: number }[];
  totalSteps: number;
  averageDaily: number;
}

export const stepsApi = {
  sync: (steps: number) =>
    apiFetch<StepInfo>("/api/steps/v1/sync", { method: "POST", body: JSON.stringify({ steps }) }),
  get: () => apiFetch<StepInfo>("/api/steps/v1"),
  history: (from: string, to: string) =>
    apiFetch<StepHistory>(`/api/steps/v1/history?from=${from}&to=${to}`),
};

// ─── Currency API ───────────────────────────────────────────────────────────

export const currencyApi = {
  getBalance: () => apiFetch<{ coupons: number; hearts: number }>("/api/currency/v1"),
  getTransactions: (params?: { type?: string; cursor?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.type) qs.set("type", params.type);
    if (params?.cursor) qs.set("cursor", params.cursor);
    if (params?.limit) qs.set("limit", String(params.limit));
    return apiFetch<Array<{ id: number; currencyType: string; amount: number; reason: string; createdAt: string }>>(
      `/api/currency/v1/transactions?${qs}`
    );
  },
};

// ─── Friends API ────────────────────────────────────────────────────────────

export interface FriendData {
  id: number;
  name: string;
  avatarUrl: string | null;
  totalSteps: number;
  currentCityId: string;
  method: string;
  friendSince: string;
}

export const friendsApi = {
  list: () => apiFetch<FriendData[]>("/api/friends/v1"),
  add: (friendId: number, method: string) =>
    apiFetch<FriendData>("/api/friends/v1", {
      method: "POST",
      body: JSON.stringify({ friendId, method }),
    }),
  remove: (friendId: number) =>
    apiFetch<null>(`/api/friends/v1/${friendId}`, { method: "DELETE" }),
};

// ─── Chat API ───────────────────────────────────────────────────────────────

export interface ChatRoomData {
  id: number;
  friendId: number;
  friendName: string;
  friendAvatar: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface ChatMessageData {
  id: number;
  senderId: number;
  content: string;
  read: boolean;
  createdAt: string;
}

export const chatApi = {
  getRooms: () => apiFetch<ChatRoomData[]>("/api/chat/v1/rooms"),
  getMessages: (roomId: number, cursor?: string, limit = 50) => {
    const qs = new URLSearchParams({ limit: String(limit) });
    if (cursor) qs.set("cursor", cursor);
    return apiFetch<ChatMessageData[]>(`/api/chat/v1/rooms/${roomId}/messages?${qs}`);
  },
  sendMessage: (roomId: number, content: string) =>
    apiFetch<ChatMessageData>(`/api/chat/v1/rooms/${roomId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  markAsRead: (roomId: number) =>
    apiFetch<null>(`/api/chat/v1/rooms/${roomId}/read`, { method: "POST" }),
};

// ─── Posts API ───────────────────────────────────────────────────────────────

export interface PostData {
  id: number;
  userId: number;
  userName: string;
  userAvatarUrl: string | null;
  cityId: string;
  content: string;
  image: { url: string; key: string } | null;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
}

export interface CommentData {
  id: number;
  postId: number;
  userId: number;
  userName: string;
  userAvatarUrl: string | null;
  content: string;
  createdAt: string;
}

export const postsApi = {
  list: (params?: { cityId?: string; filter?: string; cursor?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.cityId) qs.set("cityId", params.cityId);
    if (params?.filter) qs.set("filter", params.filter);
    if (params?.cursor) qs.set("cursor", params.cursor);
    if (params?.limit) qs.set("limit", String(params.limit));
    return apiFetch<PostData[]>(`/api/posts/v1?${qs}`);
  },
  myPosts: (cursor?: string, limit = 20) => {
    const qs = new URLSearchParams({ limit: String(limit) });
    if (cursor) qs.set("cursor", cursor);
    return apiFetch<PostData[]>(`/api/posts/v1/me?${qs}`);
  },
  get: (postId: number) => apiFetch<PostData>(`/api/posts/v1/${postId}`),
  create: (data: { content: string; cityId?: string; imageKey?: string }) =>
    apiFetch<PostData>("/api/posts/v1", { method: "POST", body: JSON.stringify(data) }),
  delete: (postId: number) => apiFetch<null>(`/api/posts/v1/${postId}`, { method: "DELETE" }),
  getComments: (postId: number, cursor?: string, limit = 50) => {
    const qs = new URLSearchParams({ limit: String(limit) });
    if (cursor) qs.set("cursor", cursor);
    return apiFetch<CommentData[]>(`/api/posts/v1/${postId}/comments?${qs}`);
  },
  addComment: (postId: number, content: string) =>
    apiFetch<CommentData>(`/api/posts/v1/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  deleteComment: (postId: number, commentId: number) =>
    apiFetch<null>(`/api/posts/v1/${postId}/comments/${commentId}`, { method: "DELETE" }),
  toggleLike: (postId: number) =>
    apiFetch<{ isLiked: boolean; likesCount: number }>(`/api/posts/v1/${postId}/likes`, { method: "POST" }),
};

// ─── Missions API ───────────────────────────────────────────────────────────

export interface MissionData {
  id: string;
  cityId: string;
  type: string;
  title: string;
  description: string;
  image: string | null;
  stepsRequired: number;
  reward: string | null;
  status: string;
  completedAt: string | null;
  aiComposite: boolean;
  aiPrompt: string | null;
  emoji: string;
}

export const missionsApi = {
  list: (params?: { cityId?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.cityId) qs.set("cityId", params.cityId);
    if (params?.status) qs.set("status", params.status);
    return apiFetch<Record<string, MissionData[]>>(`/api/missions/v1?${qs}`);
  },
  complete: (missionId: string, data: { imageKey?: string; text?: string; autoPost?: boolean }) =>
    apiFetch<{ missionId: string; status: string; completedAt: string; reward: string | null; autoPostedId: number | null }>(
      `/api/missions/v1/${missionId}/complete`,
      { method: "POST", body: JSON.stringify(data) }
    ),
  composite: (missionId: string, imageKey: string) =>
    apiFetch<{ missionId: string; compositeImage: { url: string; thumbnailUrl: string } }>(
      `/api/missions/v1/${missionId}/composite`,
      { method: "POST", body: JSON.stringify({ imageKey }) }
    ),
  stats: () =>
    apiFetch<{ totalCompleted: number; totalMissions: number; cities: Record<string, { completed: number; total: number }> }>(
      "/api/missions/v1/stats"
    ),
};

// ─── Cities API ─────────────────────────────────────────────────────────────

export interface CityData {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  stepsRequired: number;
  lat: number;
  lng: number;
  description: string;
  famousFood: string[];
  landmarks: string[];
}

export interface CityMember {
  id: number;
  name: string;
  avatarUrl: string | null;
  totalSteps: number;
  isFriend: boolean;
}

export const citiesApi = {
  list: () => apiFetch<CityData[]>("/api/cities/v1"),
  get: (cityId: string) => apiFetch<CityData>(`/api/cities/v1/${cityId}`),
  members: (cityId: string) => apiFetch<CityMember[]>(`/api/cities/v1/${cityId}/members`),
};

// ─── Badges API ─────────────────────────────────────────────────────────────

export interface BadgeData {
  id: string;
  missionId: string;
  cityId: string;
  cityName: string;
  countryFlag: string;
  title: string;
  emoji: string;
  description: string;
  earned: boolean;
  earnedAt: string | null;
}

export const badgesApi = {
  list: (params?: { cityId?: string; earned?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.cityId) qs.set("cityId", params.cityId);
    if (params?.earned !== undefined) qs.set("earned", String(params.earned));
    return apiFetch<{ totalEarned: number; totalPossible: number; badges: BadgeData[] }>(`/api/badges/v1?${qs}`);
  },
  stats: () =>
    apiFetch<{ totalEarned: number; totalPossible: number; cities: Record<string, { earned: number; total: number }> }>(
      "/api/badges/v1/stats"
    ),
};

// ─── Uploads API ────────────────────────────────────────────────────────────

export const uploadsApi = {
  getPresignedUrl: (domain: string, filename: string, contentType = "image/jpeg") => {
    const qs = new URLSearchParams({ domain, filename, contentType });
    return apiFetch<{ key: string; uploadUrl: string }>(`/api/uploads/v1/presigned-url?${qs}`, { method: "POST" });
  },
};
