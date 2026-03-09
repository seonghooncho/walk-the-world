import { apiFetch } from "@/lib/api/client";

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  avatarUrl: string | null;
  totalSteps: number;
  currentCityId: string;
  coupons: number;
  hearts: number;
  friendCount: number;
  createdAt: string;
}

export interface PublicProfile {
  id: number;
  name: string;
  avatarUrl: string | null;
  totalSteps: number;
  currentCityId: string;
  isFriend: boolean;
  joinedAt: string;
}

export interface StepInfo {
  totalSteps: number;
  currentCityId: string;
  currentCityName: string;
  nextCityId: string | null;
  nextCityName: string | null;
  stepsToNextCity: number;
  progressPercent: number;
  newlyUnlockedCities: string[];
}

export interface StepHistory {
  records: { date: string; steps: number }[];
  totalSteps: number;
  averageDaily: number;
}

export const userApi = {
  getMe: () => apiFetch<UserProfile>("/api/users/v1/me"),
  updateMe: (data: { name?: string; avatarUrl?: string }) =>
    apiFetch<UserProfile>("/api/users/v1/me", { method: "PATCH", body: JSON.stringify(data) }),
  getUser: (userId: number) => apiFetch<PublicProfile>(`/api/users/v1/${userId}`),
  uploadAvatar: (imageKey: string) =>
    apiFetch<{ avatarUrl: string }>(`/api/users/v1/me/avatar?imageKey=${encodeURIComponent(imageKey)}`, { method: "POST" }),
};

export const stepsApi = {
  sync: (steps: number) =>
    apiFetch<StepInfo>("/api/steps/v1/sync", { method: "POST", body: JSON.stringify({ steps }) }),
  get: () => apiFetch<StepInfo>("/api/steps/v1"),
  history: (from: string, to: string) =>
    apiFetch<StepHistory>(`/api/steps/v1/history?from=${from}&to=${to}`),
};

export const currencyApi = {
  getBalance: () => apiFetch<{ coupons: number; hearts: number }>("/api/currency/v1"),
  getTransactions: (params?: { type?: string; cursor?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.type) {
      qs.set("type", params.type);
    }
    if (params?.cursor) {
      qs.set("cursor", params.cursor);
    }
    if (params?.limit) {
      qs.set("limit", String(params.limit));
    }

    return apiFetch<Array<{ id: number; currencyType: string; amount: number; reason: string; createdAt: string }>>(
      `/api/currency/v1/transactions?${qs}`,
    );
  },
};
