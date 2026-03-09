import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { currencyApi, isAuthenticated, stepsApi, userApi } from "@/lib/api";

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name?: string; avatarUrl?: string }) => (await userApi.updateMe(data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useStepInfo() {
  return useQuery({
    queryKey: ["steps"],
    queryFn: async () => (await stepsApi.get()).data,
    staleTime: 60_000,
  });
}

export function useSyncSteps() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (steps: number) => (await stepsApi.sync(steps)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["steps"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["missions"] });
    },
  });
}

export function useCurrency() {
  return useQuery({
    queryKey: ["currency"],
    queryFn: async () => (await currencyApi.getBalance()).data,
    staleTime: 30_000,
  });
}
