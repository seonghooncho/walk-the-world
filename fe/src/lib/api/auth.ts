import { apiFetch } from "@/lib/api/client";

export interface TokenPayload {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const authApi = {
  signup: (email: string, password: string, name: string) =>
    apiFetch<TokenPayload>("/api/auth/v1/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    apiFetch<TokenPayload>("/api/auth/v1/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  kakaoLogin: (kakaoAccessToken: string) =>
    apiFetch<TokenPayload>("/api/auth/v1/kakao", {
      method: "POST",
      body: JSON.stringify({ accessToken: kakaoAccessToken }),
    }),

  googleLogin: (idToken: string) =>
    apiFetch<TokenPayload>("/api/auth/v1/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }),

  logout: (refreshToken: string | null) => {
    if (!refreshToken) {
      return Promise.resolve();
    }

    return apiFetch<null>("/api/auth/v1/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },

  resetPassword: (email: string) =>
    apiFetch<null>("/api/auth/v1/password/reset", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch<null>("/api/auth/v1/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};
