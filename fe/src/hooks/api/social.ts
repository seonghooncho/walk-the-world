import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatApi, friendsApi, isAuthenticated, postsApi, type ChatMessageData, type ChatRoomData, type CommentData } from "@/lib/api";

export function useFriends() {
  return useQuery({
    queryKey: ["friends"],
    queryFn: async () => (await friendsApi.list()).data,
    staleTime: 30_000,
    enabled: isAuthenticated(),
  });
}

export function useAddFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ friendId, method }: { friendId: number; method: string }) =>
      (await friendsApi.add(friendId, method)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["currency"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["cityMembers"] });
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
    },
  });
}

export function useChatRooms() {
  return useQuery({
    queryKey: ["chatRooms"],
    queryFn: async () => (await chatApi.getRooms()).data,
    staleTime: 10_000,
    enabled: isAuthenticated(),
  });
}

export function useChatRoom(roomId: number, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["chatRoom", roomId],
    queryFn: async () => (await chatApi.getRoom(roomId)).data,
    staleTime: 10_000,
    enabled: (options.enabled ?? true) && isAuthenticated() && Number.isFinite(roomId) && roomId > 0,
  });
}

export function useEnsureChatRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendId: number) => (await chatApi.getOrCreateRoom(friendId)).data,
    onSuccess: (room) => {
      queryClient.setQueryData<ChatRoomData[]>(["chatRooms"], (rooms = []) => {
        if (rooms.some((candidate) => candidate.id === room.id)) {
          return rooms.map((candidate) => (candidate.id === room.id ? room : candidate));
        }
        return [room, ...rooms];
      });
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      queryClient.invalidateQueries({ queryKey: ["chatMessages", room.id] });
    },
  });
}

export function useMarkChatAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: number) => (await chatApi.markAsRead(roomId)).data,
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      queryClient.invalidateQueries({ queryKey: ["chatRoom", roomId] });
      queryClient.invalidateQueries({ queryKey: ["chatMessages", roomId] });
    },
  });
}

export function useChatMessages(roomId: number) {
  return useInfiniteQuery({
    queryKey: ["chatMessages", roomId],
    queryFn: async ({ pageParam }) => {
      const response = await chatApi.getMessages(roomId, pageParam as string | undefined);
      return { data: response.data, nextCursor: response.meta?.nextCursor };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: isAuthenticated() && Number.isFinite(roomId) && roomId > 0,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, content }: { roomId: number; content: string }) =>
      (await chatApi.sendMessage(roomId, content)).data,
    onSuccess: (message, variables) => {
      queryClient.setQueryData<{ pages: Array<{ data: ChatMessageData[]; nextCursor?: string }>; pageParams: unknown[] }>(
        ["chatMessages", variables.roomId],
        (existing) => {
          if (!existing) {
            return {
              pages: [{ data: [message], nextCursor: undefined }],
              pageParams: [undefined],
            };
          }

          if (existing.pages.some((page) => page.data.some((candidate) => candidate.id === message.id))) {
            return existing;
          }

          const pages = existing.pages.length > 0 ? [...existing.pages] : [{ data: [], nextCursor: undefined }];
          pages[0] = { ...pages[0], data: [...pages[0].data, message] };
          return { ...existing, pages };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["chatMessages", variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      queryClient.invalidateQueries({ queryKey: ["chatRoom", variables.roomId] });
    },
  });
}

export function usePost(postId: number) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => (await postsApi.get(postId)).data,
    enabled: isAuthenticated() && Number.isFinite(postId) && postId > 0,
  });
}

export function usePostComments(postId: number) {
  return useInfiniteQuery({
    queryKey: ["postComments", postId],
    queryFn: async ({ pageParam }) => {
      const response = await postsApi.getComments(postId, pageParam as string | undefined);
      return { data: response.data, nextCursor: response.meta?.nextCursor };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: isAuthenticated() && Number.isFinite(postId) && postId > 0,
  });
}

export function usePosts(params?: { cityId?: string; filter?: string }) {
  return useInfiniteQuery({
    queryKey: ["posts", params],
    queryFn: async ({ pageParam }) => {
      const response = await postsApi.list({ ...params, cursor: pageParam as string | undefined });
      return { data: response.data, nextCursor: response.meta?.nextCursor };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: isAuthenticated(),
  });
}

export function useMyPosts(options: { enabled?: boolean } = {}) {
  return useInfiniteQuery({
    queryKey: ["myPosts"],
    queryFn: async ({ pageParam }) => {
      const response = await postsApi.myPosts(pageParam as string | undefined);
      return { data: response.data, nextCursor: response.meta?.nextCursor };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: (options.enabled ?? true) && isAuthenticated(),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { content: string; cityId?: string; imageKey?: string }) =>
      (await postsApi.create(data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
      queryClient.invalidateQueries({ queryKey: ["post"] });
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => (await postsApi.toggleLike(postId)).data,
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) =>
      (await postsApi.addComment(postId, content)).data,
    onSuccess: (comment, variables) => {
      queryClient.setQueryData<{ pages: Array<{ data: CommentData[]; nextCursor?: string }>; pageParams: unknown[] }>(
        ["postComments", variables.postId],
        (existing) => {
          if (!existing) {
            return {
              pages: [{ data: [comment], nextCursor: undefined }],
              pageParams: [undefined],
            };
          }

          if (existing.pages.some((page) => page.data.some((candidate) => candidate.id === comment.id))) {
            return existing;
          }

          const pages = existing.pages.length > 0 ? [...existing.pages] : [{ data: [], nextCursor: undefined }];
          pages[0] = { ...pages[0], data: [...pages[0].data, comment] };
          return { ...existing, pages };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
      queryClient.invalidateQueries({ queryKey: ["post", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["postComments", variables.postId] });
    },
  });
}
