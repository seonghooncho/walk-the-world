import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatApi, friendsApi, isAuthenticated, postsApi } from "@/lib/api";

export function useFriends() {
  return useQuery({
    queryKey: ["friends"],
    queryFn: async () => (await friendsApi.list()).data,
    staleTime: 30_000,
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

export function useChatMessages(roomId: number) {
  return useInfiniteQuery({
    queryKey: ["chatMessages", roomId],
    queryFn: async ({ pageParam }) => {
      const response = await chatApi.getMessages(roomId, pageParam as string | undefined);
      return { data: response.data, nextCursor: response.meta?.nextCursor };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, content }: { roomId: number; content: string }) =>
      (await chatApi.sendMessage(roomId, content)).data,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chatMessages", variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
    },
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
  });
}

export function useMyPosts() {
  return useInfiniteQuery({
    queryKey: ["myPosts"],
    queryFn: async ({ pageParam }) => {
      const response = await postsApi.myPosts(pageParam as string | undefined);
      return { data: response.data, nextCursor: response.meta?.nextCursor };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
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
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => (await postsApi.toggleLike(postId)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) =>
      (await postsApi.addComment(postId, content)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });
}
