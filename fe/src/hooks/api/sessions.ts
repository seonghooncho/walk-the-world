import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAuthenticated, sessionsApi, storiesApi, type GeoPointPayload } from "@/lib/api";

export function useTodaySession() {
  return useQuery({
    queryKey: ["todaySession"],
    queryFn: async () => (await sessionsApi.today()).data,
    staleTime: 10_000,
    enabled: isAuthenticated(),
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { activityType: "walk" | "run"; startLocation?: GeoPointPayload; environmentHint?: string; playlistId?: string }) =>
      (await sessionsApi.start(data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todaySession"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useRecordSessionLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, point }: { sessionId: number; point: GeoPointPayload }) =>
      (await sessionsApi.recordLocation(sessionId, point)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todaySession"] });
    },
  });
}

export function useSubmitSessionMissionProof() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      missionId,
      proofType,
      imageKey,
      text,
    }: {
      sessionId: number;
      missionId: number;
      proofType: string;
      imageKey?: string;
      text?: string;
    }) => (await sessionsApi.submitProof(sessionId, missionId, { proofType, imageKey, text })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todaySession"] });
      queryClient.invalidateQueries({ queryKey: ["friendStories"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useFinishSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: number) => (await sessionsApi.finish(sessionId)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todaySession"] });
      queryClient.invalidateQueries({ queryKey: ["currency"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useFriendStories(limit = 12) {
  return useQuery({
    queryKey: ["friendStories", limit],
    queryFn: async () => (await storiesApi.friends(limit)).data,
    staleTime: 20_000,
    enabled: isAuthenticated(),
  });
}
