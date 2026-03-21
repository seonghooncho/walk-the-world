import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, clearTokens, getRefreshToken, setTokens } from "@/src/lib/api";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await authApi.login(email, password);
      await setTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password, name }: { email: string; password: string; name: string }) => {
      const response = await authApi.signup(email, password, name);
      await setTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useKakaoLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kakaoAccessToken: string) => {
      const response = await authApi.kakaoLogin(kakaoAccessToken);
      await setTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useGoogleLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (idToken: string) => {
      const response = await authApi.googleLogin(idToken);
      await setTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authApi.logout(getRefreshToken());
    },
    onSettled: async () => {
      await clearTokens();
      queryClient.clear();
    },
  });
}
