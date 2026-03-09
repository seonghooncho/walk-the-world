import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { badgesApi, citiesApi, missionsApi } from "@/lib/api";

export function useMissions(params?: { cityId?: string; status?: string }) {
  return useQuery({
    queryKey: ["missions", params],
    queryFn: async () => (await missionsApi.list(params)).data,
    staleTime: 30_000,
  });
}

export function useCompleteMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ missionId, ...data }: { missionId: string; imageKey?: string; text?: string; autoPost?: boolean }) =>
      (await missionsApi.complete(missionId, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useCities() {
  return useQuery({
    queryKey: ["cities"],
    queryFn: async () => (await citiesApi.list()).data,
    staleTime: 5 * 60_000,
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
