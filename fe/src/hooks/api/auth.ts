import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, clearTokens, getRefreshToken, setTokens } from "@/lib/api";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await authApi.login(email, password);
      setTokens(response.data.accessToken, response.data.refreshToken);
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
      setTokens(response.data.accessToken, response.data.refreshToken);
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
      setTokens(response.data.accessToken, response.data.refreshToken);
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
      setTokens(response.data.accessToken, response.data.refreshToken);
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
    onSettled: () => {
      clearTokens();
      queryClient.clear();
    },
  });
}
