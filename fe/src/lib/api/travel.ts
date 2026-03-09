import { apiFetch } from "@/lib/api/client";

export interface MissionData {
  id: string;
  cityId: string;
  type: string;
  title: string;
  description: string;
  imageUrl: string | null;
  stepsRequired: number;
  reward: string | null;
  status: string;
  completedAt: string | null;
  aiComposite: boolean;
  aiPrompt: string | null;
  emoji: string;
}

export interface CityData {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  stepsRequired: number;
  lat: number;
  lng: number;
  description: string;
  famousFood: string[];
  landmarks: string[];
  isUnlocked?: boolean;
  onlineUsers?: number;
}

export interface CityMember {
  id: number;
  name: string;
  avatarUrl: string | null;
  totalSteps: number;
  isFriend: boolean;
}

export interface BadgeData {
  id: string;
  missionId: string;
  cityId: string;
  cityName: string;
  countryFlag: string;
  title: string;
  emoji: string;
  description: string;
  earned: boolean;
  earnedAt: string | null;
}

export const missionsApi = {
  list: (params?: { cityId?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.cityId) {
      qs.set("cityId", params.cityId);
    }
    if (params?.status) {
      qs.set("status", params.status);
    }
    return apiFetch<Record<string, MissionData[]>>(`/api/missions/v1?${qs}`);
  },
  complete: (missionId: string, data: { imageKey?: string; text?: string; autoPost?: boolean }) =>
    apiFetch<{ missionId: string; status: string; completedAt: string; reward: string | null; autoPostedId: number | null }>(
      `/api/missions/v1/${missionId}/complete`,
      { method: "POST", body: JSON.stringify(data) },
    ),
  composite: (missionId: string, imageKey: string) =>
    apiFetch<{ missionId: string; compositeImage: { key: string; url: string; thumbnailUrl: string } }>(
      `/api/missions/v1/${missionId}/composite`,
      { method: "POST", body: JSON.stringify({ imageKey }) },
    ),
  stats: () =>
    apiFetch<{ totalCompleted: number; totalMissions: number; cities: Record<string, { completed: number; total: number }> }>(
      "/api/missions/v1/stats",
    ),
};

export const citiesApi = {
  list: () => apiFetch<CityData[]>("/api/cities/v1"),
  get: (cityId: string) => apiFetch<CityData>(`/api/cities/v1/${cityId}`),
  members: (cityId: string) => apiFetch<CityMember[]>(`/api/cities/v1/${cityId}/members`),
};

export const badgesApi = {
  list: (params?: { cityId?: string; earned?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.cityId) {
      qs.set("cityId", params.cityId);
    }
    if (params?.earned !== undefined) {
      qs.set("earned", String(params.earned));
    }
    return apiFetch<{ totalEarned: number; totalPossible: number; badges: BadgeData[] }>(`/api/badges/v1?${qs}`);
  },
  stats: () =>
    apiFetch<{ totalEarned: number; totalPossible: number; cities: Record<string, { earned: number; total: number }> }>(
      "/api/badges/v1/stats",
    ),
};
