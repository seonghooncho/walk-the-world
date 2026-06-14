import { apiFetch } from "@/lib/api/client";

export interface GeoPointPayload {
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  recordedAt?: string;
}

export interface SessionMissionData {
  id: number | null;
  missionKey: string;
  title: string;
  description: string;
  proofType: "photo" | "text" | "session" | "screenshot" | "social";
  emoji: string;
  bonusMeters: number;
  stampReward: string;
  status: "available" | "completed";
  verificationStatus: "pending" | "verified" | "rejected" | "fallback_accepted";
  imageUrl: string | null;
  completedAt: string | null;
}

export interface TodaySessionData {
  sessionId: number | null;
  sessionDate: string;
  status: "ready" | "active" | "completed" | "abandoned";
  activityType: "walk" | "run";
  cityId: string;
  cityName: string;
  countryFlag: string;
  dailyGoalMeters: number;
  distanceMeters: number;
  bonusMeters: number;
  progressMeters: number;
  progressPercent: number;
  durationSeconds: number;
  ticketsEarned: number;
  stampsEarned: number;
  environmentHint: string | null;
  playlistTitle: string;
  playlistUrl: string;
  startedAt: string | null;
  endedAt: string | null;
  missions: SessionMissionData[];
}

export interface LocationPointResponse {
  sessionId: number;
  distanceMeters: number;
  bonusMeters: number;
  progressMeters: number;
  progressPercent: number;
  distanceAddedMeters: number;
}

export interface MissionProofResponse {
  missionId: number;
  status: string;
  verificationStatus: string;
  bonusMeters: number;
  progressMeters: number;
  progressPercent: number;
  storyId: number | null;
}

export interface FinishSessionResponse {
  sessionId: number;
  status: "completed" | "abandoned";
  distanceMeters: number;
  bonusMeters: number;
  progressMeters: number;
  progressPercent: number;
  durationSeconds: number;
  ticketsEarned: number;
  stampsEarned: number;
  couponExchangeAvailable: boolean;
}

export interface StoryData {
  id: number;
  userId: number;
  userName: string;
  userAvatarUrl: string | null;
  cityId: string;
  missionTitle: string;
  content: string;
  imageUrl: string | null;
  imageKey: string | null;
  createdAt: string;
}

export const sessionsApi = {
  today: () => apiFetch<TodaySessionData>("/api/sessions/v1/today"),
  start: (data: { activityType: "walk" | "run"; startLocation?: GeoPointPayload; environmentHint?: string; playlistId?: string }) =>
    apiFetch<TodaySessionData>("/api/sessions/v1", { method: "POST", body: JSON.stringify(data) }),
  recordLocation: (sessionId: number, data: GeoPointPayload) =>
    apiFetch<LocationPointResponse>(`/api/sessions/v1/${sessionId}/locations`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  submitProof: (sessionId: number, missionId: number, data: { proofType: string; imageKey?: string; text?: string }) =>
    apiFetch<MissionProofResponse>(`/api/sessions/v1/${sessionId}/missions/${missionId}/proof`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  finish: (sessionId: number) =>
    apiFetch<FinishSessionResponse>(`/api/sessions/v1/${sessionId}/finish`, { method: "POST" }),
};

export const storiesApi = {
  friends: (limit = 20) => apiFetch<StoryData[]>(`/api/stories/v1/friends?limit=${limit}`),
};
