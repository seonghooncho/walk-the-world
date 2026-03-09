import { create } from "zustand";
import { posts as initialPosts, currentUser as initialUser, cityUsers, cities } from "@/mocks/mockData";
import { cityMissions as rawMissions, computeCityMissions } from "@/mocks/missionData";
import type { Post, UserProfile } from "@/mocks/mockData";
import type { Mission } from "@/mocks/missionData";
import { isAuthenticated } from "@/lib/api";

// ─── Shared types ───────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  read?: boolean;
}

export interface ChatRoom {
  id: string;
  friendId: string;
  messages: ChatMessage[];
  unread: number;
}

// ─── User lookup ────────────────────────────────────────────────────────────

const buildUserMap = (): Record<string, UserProfile> => ({
  [initialUser.id]: initialUser,
  ...Object.fromEntries(cityUsers.map((u) => [u.id, u])),
});

// ─── Initial completed missions (서울/부산은 이미 완료한 것으로 설정) ─────

const initialCompletedMissions = new Set<string>([
  "s1", "s2", "s3", "s4", "s5", "s6",
  "b1", "b2", "b3", "b4", "b5", "b6",
  "t1", "t2",
]);

// ─── Compute missions dynamically ──────────────────────────────────────────

function buildMissions(totalSteps: number, completed: Set<string>): Record<string, Mission[]> {
  const result: Record<string, Mission[]> = {};
  for (const cityId of Object.keys(rawMissions)) {
    const city = cities.find((c) => c.id === cityId);
    const isCityUnlocked = city ? totalSteps >= city.stepsRequired : false;
    result[cityId] = computeCityMissions(cityId, totalSteps, isCityUnlocked, completed);
  }
  return result;
}

// ─── Initial chat data ──────────────────────────────────────────────────────

/** unread는 messages로부터 동적으로 계산 */
function computeUnread(room: Omit<ChatRoom, "unread">, myId: string): number {
  return room.messages.filter((m) => m.senderId !== myId && m.read === false).length;
}

const initialChatMessages: Omit<ChatRoom, "unread">[] = [
  {
    id: "chat1",
    friendId: "user2",
    messages: [
      { id: "m1", senderId: "user2", content: "오늘 도쿄타워 갈 건데 같이 갈래요?", createdAt: "2026-03-08T13:00:00", read: true },
      { id: "m2", senderId: "user1", content: "오 좋아요! 몇 시에 만날까요?", createdAt: "2026-03-08T13:15:00", read: true },
      { id: "m3", senderId: "user2", content: "3시쯤 어때요? 하마마츠초역에서 만나요", createdAt: "2026-03-08T13:20:00", read: true },
      { id: "m4", senderId: "user1", content: "좋아요 거기서 봐요! 😊", createdAt: "2026-03-08T13:25:00", read: true },
      { id: "m5", senderId: "user2", content: "도쿄타워 근처에서 만날까요? 🗼", createdAt: "2026-03-08T14:30:00", read: false },
    ],
  },
  {
    id: "chat2",
    friendId: "user3",
    messages: [
      { id: "m6", senderId: "user1", content: "아사쿠사 맛집 추천 좀 해주세요!", createdAt: "2026-03-08T10:00:00", read: true },
      { id: "m7", senderId: "user3", content: "센소지 옆에 라멘집 진짜 맛있어요", createdAt: "2026-03-08T10:30:00", read: true },
      { id: "m8", senderId: "user1", content: "오 감사합니다! 가볼게요", createdAt: "2026-03-08T10:30:00", read: true },
    ],
  },
  {
    id: "chat3",
    friendId: "user5",
    messages: [
      { id: "m9", senderId: "user5", content: "오늘 몇 보 걸었어요?", createdAt: "2026-03-07T21:00:00", read: true },
      { id: "m10", senderId: "user1", content: "15,000보요! 신기록이에요 ㅋㅋ", createdAt: "2026-03-07T21:30:00", read: true },
      { id: "m11", senderId: "user5", content: "대박! 저는 10,000보 밖에 못 걸었어요 😅", createdAt: "2026-03-07T21:35:00", read: false },
    ],
  },
];

const initialChatRooms: ChatRoom[] = initialChatMessages.map((r) => ({
  ...r,
  unread: computeUnread(r, initialUser.id),
}));

// ─── Store ──────────────────────────────────────────────────────────────────
// This store serves as local fallback when API is not available (demo mode).
// When API is connected, React Query hooks in useApi.ts are the primary data source.

interface AppState {
  user: UserProfile;
  coupons: number;
  hearts: number;
  userMap: Record<string, UserProfile>;
  posts: Post[];
  comments: Comment[];
  chatRooms: ChatRoom[];

  /** 완료한 미션 ID Set */
  completedMissions: Set<string>;
  /** 동적으로 계산된 미션 (status 포함) */
  missions: Record<string, Mission[]>;

  /** Whether we're using API or mock data */
  usingApi: boolean;

  // Actions — Posts
  addPost: (content: string, image?: string, cityId?: string) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  getPostComments: (postId: string) => Comment[];

  // Actions — Friends
  addFriend: (userId: string, sameCityCost: boolean) => { success: boolean; message: string };
  addFriendFree: (userId: string) => { success: boolean; message: string };

  // Actions — Chat
  getChatRoomByFriendId: (friendId: string) => ChatRoom | undefined;
  sendMessage: (chatId: string, content: string) => void;
  markChatAsRead: (chatId: string) => void;

  // Actions — Missions
  completeMission: (missionId: string, cityId: string) => void;
  getMission: (missionId: string, cityId: string) => Mission | undefined;

  // Actions — Sync from API
  syncUserFromApi: (apiUser: { name: string; totalSteps: number; currentCityId: string; coupons: number; hearts: number }) => void;
}

const mockComments: Comment[] = [
  { id: "c1", postId: "p1", userId: "user3", userName: "이탐험", content: "시부야 진짜 대박이죠! 🤩", createdAt: "2026-03-08T11:00:00" },
  { id: "c2", postId: "p1", userId: "user1", userName: "김여행", content: "다음에 같이 가요!", createdAt: "2026-03-08T11:30:00" },
  { id: "c3", postId: "p4", userId: "user2", userName: "박모험", content: "벚꽃 사진 공유해주세요! 🌸", createdAt: "2026-03-06T15:00:00" },
  { id: "c4", postId: "p3", userId: "user5", userName: "정걸음", content: "대단해요! 화이팅 💪", createdAt: "2026-03-07T21:00:00" },
];

export const useAppStore = create<AppState>((set, get) => ({
  user: { ...initialUser },
  coupons: 2,
  hearts: 5,
  userMap: buildUserMap(),
  posts: [...initialPosts],
  comments: [...mockComments],
  chatRooms: initialChatRooms.map((r) => ({ ...r, messages: [...r.messages] })),
  completedMissions: new Set(initialCompletedMissions),
  missions: buildMissions(initialUser.totalSteps, initialCompletedMissions),
  usingApi: isAuthenticated(),

  // ── Posts ──────────────────────────────────────────────────────────────────

  addPost: (content, image, cityId) => {
    const { user, posts } = get();
    const newPost: Post = {
      id: `p${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      cityId: cityId || user.currentCityId,
      content,
      image,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
      isLiked: false,
    };
    set({ posts: [newPost, ...posts] });
  },

  toggleLike: (postId) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      ),
    }));
  },

  addComment: (postId, content) => {
    const { user, comments } = get();
    const newComment: Comment = {
      id: `c${Date.now()}`,
      postId,
      userId: user.id,
      userName: user.name,
      content,
      createdAt: new Date().toISOString(),
    };
    set({
      comments: [...comments, newComment],
      posts: get().posts.map((p) =>
        p.id === postId ? { ...p, comments: p.comments + 1 } : p
      ),
    });
  },

  getPostComments: (postId) => {
    return get().comments.filter((c) => c.postId === postId);
  },

  // ── Friends ───────────────────────────────────────────────────────────────

  addFriend: (userId, sameCityCost) => {
    const { user, coupons, hearts } = get();
    if (user.friends.includes(userId)) return { success: false, message: "이미 친구입니다" };

    if (sameCityCost) {
      if (coupons < 1) return { success: false, message: "친추 쿠폰이 부족합니다" };
      set({
        coupons: coupons - 1,
        user: { ...user, friends: [...user.friends, userId] },
      });
    } else {
      if (hearts < 2) return { success: false, message: "하트가 부족합니다 (2개 필요)" };
      set({
        hearts: hearts - 2,
        user: { ...user, friends: [...user.friends, userId] },
      });
    }
    return { success: true, message: "친구가 되었습니다! 🎉" };
  },

  addFriendFree: (userId) => {
    const { user } = get();
    if (user.friends.includes(userId)) return { success: false, message: "이미 친구입니다" };
    set({ user: { ...user, friends: [...user.friends, userId] } });
    return { success: true, message: "친구가 되었습니다! 🎉" };
  },

  // ── Chat ───────────────────────────────────────────────────────────────────

  getChatRoomByFriendId: (friendId) => {
    return get().chatRooms.find((r) => r.friendId === friendId);
  },

  sendMessage: (chatId, content) => {
    const { user } = get();
    set((state) => ({
      chatRooms: state.chatRooms.map((r) =>
        r.id === chatId
          ? (() => {
              const newMessages = [
                ...r.messages,
                {
                  id: `m${Date.now()}`,
                  senderId: user.id,
                  content,
                  createdAt: new Date().toISOString(),
                  read: false,
                },
              ];
              return {
                ...r,
                messages: newMessages,
                unread: computeUnread({ ...r, messages: newMessages }, user.id),
              };
            })()
          : r
      ),
    }));
  },

  markChatAsRead: (chatId) => {
    const { user } = get();
    set((state) => ({
      chatRooms: state.chatRooms.map((r) =>
        r.id === chatId
          ? {
              ...r,
              messages: r.messages.map((m) =>
                m.senderId !== user.id && !m.read ? { ...m, read: true } : m
              ),
              unread: 0,
            }
          : r
      ),
    }));
  },

  // ── Missions ──────────────────────────────────────────────────────────────

  completeMission: (missionId, cityId) => {
    const { user, completedMissions } = get();
    const newCompleted = new Set(completedMissions);
    newCompleted.add(missionId);
    set({
      completedMissions: newCompleted,
      missions: buildMissions(user.totalSteps, newCompleted),
    });
  },

  getMission: (missionId, cityId) => {
    return get().missions[cityId]?.find((m) => m.id === missionId);
  },

  // ── API sync ──────────────────────────────────────────────────────────────

  syncUserFromApi: (apiUser) => {
    set((state) => ({
      user: {
        ...state.user,
        name: apiUser.name,
        totalSteps: apiUser.totalSteps,
        currentCityId: apiUser.currentCityId,
      },
      coupons: apiUser.coupons,
      hearts: apiUser.hearts,
      usingApi: true,
      missions: buildMissions(apiUser.totalSteps, state.completedMissions),
    }));
  },
}));
