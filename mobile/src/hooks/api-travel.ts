import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { badgesApi, citiesApi, isAuthenticated, missionsApi } from "@/src/lib/api";

export function useCompleteMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ missionId, ...data }: { missionId: string; imageKey?: string; text?: string; autoPost?: boolean }) =>
      (await missionsApi.complete(missionId, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useCityMembers(cityId: string) {
  return useQuery({
    queryKey: ["cityMembers", cityId],
    queryFn: async () => (await citiesApi.members(cityId)).data,
    staleTime: 30_000,
    enabled: isAuthenticated() && !!cityId,
  });
}

export function useBadges(params?: { cityId?: string; earned?: boolean }) {
  return useQuery({
    queryKey: ["badges", params],
    queryFn: async () => (await badgesApi.list(params)).data,
    staleTime: 30_000,
    enabled: isAuthenticated(),
  });
}
