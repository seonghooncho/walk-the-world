import { apiFetch } from "@/lib/api/client";

export interface FriendData {
  id: number;
  name: string;
  avatarUrl: string | null;
  totalSteps: number;
  currentCityId: string;
  method: string;
  friendSince: string;
}

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

export interface PostData {
  id: number;
  userId: number;
  userName: string;
  userAvatarUrl: string | null;
  cityId: string;
  missionId?: string;
  missionTitle?: string;
  proofType?: string;
  content: string;
  image: { url: string; key: string } | null;
  likes: number;
  comments: number;
  stampReactions?: number;
  postcardReactions?: number;
  cheerReactions?: number;
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

export const chatApi = {
  getRooms: () => apiFetch<ChatRoomData[]>("/api/chat/v1/rooms"),
  getOrCreateRoom: (friendId: number) =>
    apiFetch<ChatRoomData>("/api/chat/v1/rooms", {
      method: "POST",
      body: JSON.stringify({ friendId }),
    }),
  getMessages: (roomId: number, cursor?: string, limit = 50) => {
    const qs = new URLSearchParams({ limit: String(limit) });
    if (cursor) {
      qs.set("cursor", cursor);
    }
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

export const postsApi = {
  list: (params?: { cityId?: string; filter?: string; cursor?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.cityId) {
      qs.set("cityId", params.cityId);
    }
    if (params?.filter) {
      qs.set("filter", params.filter);
    }
    if (params?.cursor) {
      qs.set("cursor", params.cursor);
    }
    if (params?.limit) {
      qs.set("limit", String(params.limit));
    }

    return apiFetch<PostData[]>(`/api/posts/v1?${qs}`);
  },
  myPosts: (cursor?: string, limit = 20) => {
    const qs = new URLSearchParams({ limit: String(limit) });
    if (cursor) {
      qs.set("cursor", cursor);
    }
    return apiFetch<PostData[]>(`/api/posts/v1/me?${qs}`);
  },
  get: (postId: number) => apiFetch<PostData>(`/api/posts/v1/${postId}`),
  create: (data: { content: string; cityId?: string; imageKey?: string }) =>
    apiFetch<PostData>("/api/posts/v1", { method: "POST", body: JSON.stringify(data) }),
  delete: (postId: number) => apiFetch<null>(`/api/posts/v1/${postId}`, { method: "DELETE" }),
  getComments: (postId: number, cursor?: string, limit = 50) => {
    const qs = new URLSearchParams({ limit: String(limit) });
    if (cursor) {
      qs.set("cursor", cursor);
    }
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
