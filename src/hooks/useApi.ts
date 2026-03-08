import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
  userApi, stepsApi, currencyApi, friendsApi, chatApi, postsApi,
  missionsApi, citiesApi, badgesApi, authApi, setTokens, clearTokens,
  isAuthenticated,
  type UserProfile, type PostData, type CommentData, type ChatRoomData,
  type FriendData, type MissionData, type CityData, type BadgeData,
} from "@/lib/api";

// ─── Auth hooks ─────────────────────────────────────────────────────────────

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await authApi.login(email, password);
      setTokens(res.data.accessToken, res.data.refreshToken);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useSignup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password, name }: { email: string; password: string; name: string }) => {
      const res = await authApi.signup(email, password, name);
      setTokens(res.data.accessToken, res.data.refreshToken);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useKakaoLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (kakaoAccessToken: string) => {
      const res = await authApi.kakaoLogin(kakaoAccessToken);
      setTokens(res.data.accessToken, res.data.refreshToken);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useGoogleLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (idToken: string) => {
      const res = await authApi.googleLogin(idToken);
      setTokens(res.data.accessToken, res.data.refreshToken);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => { await authApi.logout(); },
    onSettled: () => {
      clearTokens();
      qc.clear();
    },
  });
}

// ─── User hooks ─────────────────────────────────────────────────────────────

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => (await userApi.getMe()).data,
    retry: false,
    staleTime: 30_000,
    enabled: isAuthenticated(),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name?: string; avatarUrl?: string }) => (await userApi.updateMe(data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

// ─── Steps hooks ────────────────────────────────────────────────────────────

export function useStepInfo() {
  return useQuery({
    queryKey: ["steps"],
    queryFn: async () => (await stepsApi.get()).data,
    staleTime: 60_000,
  });
}

export function useSyncSteps() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (steps: number) => (await stepsApi.sync(steps)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["steps"] });
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["missions"] });
    },
  });
}

// ─── Currency hooks ─────────────────────────────────────────────────────────

export function useCurrency() {
  return useQuery({
    queryKey: ["currency"],
    queryFn: async () => (await currencyApi.getBalance()).data,
    staleTime: 30_000,
  });
}

// ─── Friends hooks ──────────────────────────────────────────────────────────

export function useFriends() {
  return useQuery({
    queryKey: ["friends"],
    queryFn: async () => (await friendsApi.list()).data,
    staleTime: 30_000,
  });
}

export function useAddFriend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ friendId, method }: { friendId: number; method: string }) =>
      (await friendsApi.add(friendId, method)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friends"] });
      qc.invalidateQueries({ queryKey: ["currency"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

// ─── Chat hooks ─────────────────────────────────────────────────────────────

export function useChatRooms() {
  return useQuery({
    queryKey: ["chatRooms"],
    queryFn: async () => (await chatApi.getRooms()).data,
    staleTime: 10_000,
    enabled: isAuthenticated(),
  });
}

export function useChatMessages(roomId: number) {
  return useInfiniteQuery({
    queryKey: ["chatMessages", roomId],
    queryFn: async ({ pageParam }) => {
      const res = await chatApi.getMessages(roomId, pageParam as string | undefined);
      return { data: res.data, nextCursor: res.meta?.nextCursor };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ roomId, content }: { roomId: number; content: string }) =>
      (await chatApi.sendMessage(roomId, content)).data,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["chatMessages", vars.roomId] });
      qc.invalidateQueries({ queryKey: ["chatRooms"] });
    },
  });
}

// ─── Posts hooks ─────────────────────────────────────────────────────────────

export function usePosts(params?: { cityId?: string; filter?: string }) {
  return useInfiniteQuery({
    queryKey: ["posts", params],
    queryFn: async ({ pageParam }) => {
      const res = await postsApi.list({ ...params, cursor: pageParam as string | undefined });
      return { data: res.data, nextCursor: res.meta?.nextCursor };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useMyPosts() {
  return useInfiniteQuery({
    queryKey: ["myPosts"],
    queryFn: async ({ pageParam }) => {
      const res = await postsApi.myPosts(pageParam as string | undefined);
      return { data: res.data, nextCursor: res.meta?.nextCursor };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { content: string; cityId?: string; imageKey?: string }) =>
      (await postsApi.create(data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["myPosts"] });
    },
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: number) => (await postsApi.toggleLike(postId)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) =>
      (await postsApi.addComment(postId, content)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

// ─── Missions hooks ─────────────────────────────────────────────────────────

export function useMissions(params?: { cityId?: string; status?: string }) {
  return useQuery({
    queryKey: ["missions", params],
    queryFn: async () => (await missionsApi.list(params)).data,
    staleTime: 30_000,
  });
}

export function useCompleteMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ missionId, ...data }: { missionId: string; imageKey?: string; text?: string; autoPost?: boolean }) =>
      (await missionsApi.complete(missionId, data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["missions"] });
      qc.invalidateQueries({ queryKey: ["badges"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// ─── Cities hooks ───────────────────────────────────────────────────────────

export function useCities() {
  return useQuery({
    queryKey: ["cities"],
    queryFn: async () => (await citiesApi.list()).data,
    staleTime: 5 * 60_000, // cities rarely change
  });
}

export function useCityMembers(cityId: string) {
  return useQuery({
    queryKey: ["cityMembers", cityId],
    queryFn: async () => (await citiesApi.members(cityId)).data,
    staleTime: 30_000,
    enabled: !!cityId,
  });
}

// ─── Badges hooks ───────────────────────────────────────────────────────────

export function useBadges(params?: { cityId?: string; earned?: boolean }) {
  return useQuery({
    queryKey: ["badges", params],
    queryFn: async () => (await badgesApi.list(params)).data,
    staleTime: 30_000,
  });
}

export function useBadgeStats() {
  return useQuery({
    queryKey: ["badgeStats"],
    queryFn: async () => (await badgesApi.stats()).data,
    staleTime: 30_000,
  });
}

// Re-export types
export type {
  UserProfile, PostData, CommentData, ChatRoomData,
  FriendData, MissionData, CityData, BadgeData,
};
