import { apiFetch } from "@/src/lib/api/client";

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
};

export const citiesApi = {
  members: (cityId: string) => apiFetch<CityMember[]>(`/api/cities/v1/${cityId}/members`),
};

export const badgesApi = {
  list: (params?: { cityId?: string; earned?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.cityId) qs.set("cityId", params.cityId);
    if (params?.earned !== undefined) qs.set("earned", String(params.earned));
    return apiFetch<{ totalEarned: number; totalPossible: number; badges: BadgeData[] }>(`/api/badges/v1?${qs}`);
  },
};
