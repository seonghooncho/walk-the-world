import type { ImageSourcePropType } from "react-native";
import { cityFoodImages, cityLandmarkImages } from "@/src/mocks/spotImages";
import { cityMissions, computeCityMissions, type Mission as StaticMission } from "@/src/mocks/missionData";
import { cities as staticCities, currentUser as guestPreviewUser, type City as StaticCity } from "@/src/mocks/mockData";
import type { BadgeData, CityMember, CommentData, FriendData, MissionData, PostData, PublicProfile, StepInfo, UserProfile, ChatMessageData } from "@/src/lib/api";

export type UiMissionType = "photo" | "food" | "writing" | "explore" | "social";
export type UiMissionStatus = "locked" | "available" | "completed";

export interface UiCity {
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
  image?: ImageSourcePropType;
}

export interface UiMission {
  id: string;
  cityId: string;
  type: UiMissionType;
  title: string;
  description: string;
  image: ImageSourcePropType;
  stepsRequired: number;
  reward: string | null;
  status: UiMissionStatus;
  completedAt: string | null;
  aiComposite: boolean;
  aiPrompt: string | null;
  emoji: string;
}

export interface UiProfile {
  id: number;
  name: string;
  avatarUrl: string | null;
  totalSteps: number;
  currentCityId: string;
  isFriend: boolean;
  joinedAt: string | null;
  coupons?: number;
  hearts?: number;
  friendCount?: number;
}

export interface UiPost {
  id: number;
  userId: number;
  userName: string;
  userAvatarUrl: string | null;
  cityId: string;
  content: string;
  imageUrl: string | null;
  imageKey: string | null;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
}

export interface UiComment {
  id: number;
  postId: number;
  userId: number;
  userName: string;
  userAvatarUrl: string | null;
  content: string;
  createdAt: string;
}

export interface UiChatMessage {
  id: number;
  senderId: number;
  content: string;
  read: boolean;
  createdAt: string;
}

type MissionLike = (MissionData & { image?: ImageSourcePropType | null }) | (StaticMission & { completedAt?: string | null });

const hasRemoteImageUrl = (mission: MissionLike): mission is MissionData & { image?: ImageSourcePropType | null } =>
  "imageUrl" in mission;

const missionImageFallback = new Map<string, ImageSourcePropType>();

for (const missions of Object.values(cityMissions)) {
  for (const mission of missions) {
    missionImageFallback.set(mission.id, mission.image);
  }
}

const fallbackMissionImage = (missionId: string) => missionImageFallback.get(missionId);

const coerceMissionType = (type: string): UiMissionType => {
  if (type === "photo" || type === "food" || type === "writing" || type === "explore" || type === "social") {
    return type;
  }
  return "explore";
};

const coerceMissionStatus = (status: string): UiMissionStatus => {
  if (status === "locked" || status === "available" || status === "completed") {
    return status;
  }
  return "locked";
};

export const toUiCity = (city: StaticCity): UiCity => ({
  id: city.id,
  name: city.name,
  country: city.country,
  countryFlag: city.countryFlag,
  stepsRequired: city.stepsRequired,
  lat: city.lat,
  lng: city.lng,
  description: city.description,
  famousFood: city.famousFood,
  landmarks: city.landmarks,
  image: city.image,
});

export function toUiMission(mission: MissionLike): UiMission {
  const remoteImageUrl = hasRemoteImageUrl(mission) ? mission.imageUrl : null;
  const remoteImage = typeof remoteImageUrl === "string" ? { uri: remoteImageUrl } : undefined;

  return {
    id: mission.id,
    cityId: mission.cityId,
    type: coerceMissionType(mission.type),
    title: mission.title,
    description: mission.description,
    image: remoteImage ?? mission.image ?? fallbackMissionImage(mission.id)!,
    stepsRequired: mission.stepsRequired,
    reward: mission.reward ?? null,
    status: coerceMissionStatus(mission.status),
    completedAt: mission.completedAt ?? null,
    aiComposite: Boolean(mission.aiComposite),
    aiPrompt: mission.aiPrompt ?? null,
    emoji: mission.emoji,
  };
}

export const getStaticCities = () => staticCities.map(toUiCity);
export const GUEST_PREVIEW_TOTAL_STEPS = guestPreviewUser.totalSteps;
export const GUEST_PREVIEW_CITY_ID = guestPreviewUser.currentCityId;

export const buildStaticMissionMap = (totalSteps: number, completedMissionIds: Iterable<string> = []) => {
  const completedSet = completedMissionIds instanceof Set ? completedMissionIds : new Set(completedMissionIds);
  return Object.fromEntries(
    staticCities.map((city) => [
      city.id,
      computeCityMissions(city.id, totalSteps, totalSteps >= city.stepsRequired, completedSet).map(toUiMission),
    ]),
  ) as Record<string, UiMission[]>;
};

export const findCityById = (cities: UiCity[], cityId: string | null) => cities.find((city) => city.id === cityId) ?? null;
export const findNextCity = (cities: UiCity[], totalSteps: number) => cities.find((city) => city.stepsRequired > totalSteps) ?? null;

export const getProgressPercent = (cities: UiCity[], totalSteps: number, currentCityId: string) => {
  const currentCity = findCityById(cities, currentCityId);
  const nextCity = findNextCity(cities, totalSteps);

  if (!currentCity) return 0;
  if (!nextCity) return 100;

  const segmentStart = currentCity.stepsRequired;
  const segmentEnd = nextCity.stepsRequired;
  if (segmentEnd === segmentStart) return 100;

  return Math.max(0, Math.min(100, ((totalSteps - segmentStart) / (segmentEnd - segmentStart)) * 100));
};

export const buildGuestPreviewStepInfo = (cities: UiCity[]): StepInfo => {
  const currentCity = findCityById(cities, GUEST_PREVIEW_CITY_ID);
  const nextCity = findNextCity(cities, GUEST_PREVIEW_TOTAL_STEPS);

  return {
    totalSteps: GUEST_PREVIEW_TOTAL_STEPS,
    currentCityId: currentCity?.id ?? GUEST_PREVIEW_CITY_ID,
    currentCityName: currentCity?.name ?? "도쿄",
    nextCityId: nextCity?.id ?? null,
    nextCityName: nextCity?.name ?? null,
    stepsToNextCity: nextCity ? Math.max(nextCity.stepsRequired - GUEST_PREVIEW_TOTAL_STEPS, 0) : 0,
    progressPercent: getProgressPercent(cities, GUEST_PREVIEW_TOTAL_STEPS, currentCity?.id ?? GUEST_PREVIEW_CITY_ID),
    newlyUnlockedCities: cities.filter((city) => city.stepsRequired <= GUEST_PREVIEW_TOTAL_STEPS).map((city) => city.id),
  };
};

export const toUiProfile = (
  user: UserProfile | PublicProfile | CityMember | FriendData,
  fallback?: Partial<UiProfile>,
): UiProfile => ({
  id: user.id,
  name: user.name,
  avatarUrl: "avatarUrl" in user ? user.avatarUrl : fallback?.avatarUrl ?? null,
  totalSteps: user.totalSteps,
  currentCityId: "currentCityId" in user ? user.currentCityId : fallback?.currentCityId ?? "",
  isFriend: "isFriend" in user ? user.isFriend : fallback?.isFriend ?? true,
  joinedAt:
    "joinedAt" in user
      ? user.joinedAt
      : "friendSince" in user
        ? user.friendSince
        : fallback?.joinedAt ?? null,
  coupons: "coupons" in user ? user.coupons : fallback?.coupons,
  hearts: "hearts" in user ? user.hearts : fallback?.hearts,
  friendCount: "friendCount" in user ? user.friendCount : fallback?.friendCount,
});

export const toUiPost = (post: PostData): UiPost => ({
  id: post.id,
  userId: post.userId,
  userName: post.userName,
  userAvatarUrl: post.userAvatarUrl,
  cityId: post.cityId,
  content: post.content,
  imageUrl: post.image?.url ?? null,
  imageKey: post.image?.key ?? null,
  likes: post.likes,
  comments: post.comments,
  isLiked: post.isLiked,
  createdAt: post.createdAt,
});

export const toUiComment = (comment: CommentData): UiComment => ({
  id: comment.id,
  postId: comment.postId,
  userId: comment.userId,
  userName: comment.userName,
  userAvatarUrl: comment.userAvatarUrl,
  content: comment.content,
  createdAt: comment.createdAt,
});

export const toUiChatMessage = (message: ChatMessageData): UiChatMessage => ({
  id: message.id,
  senderId: message.senderId,
  content: message.content,
  read: message.read,
  createdAt: message.createdAt,
});

export const sortPostsNewestFirst = (posts: UiPost[]) =>
  [...posts].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

export const formatSteps = (steps: number) => new Intl.NumberFormat("ko-KR").format(steps);
export const getCityLandmarkItems = (city: UiCity) => cityLandmarkImages[city.id] ?? [];
export const getCityFoodItems = (city: UiCity) => cityFoodImages[city.id] ?? [];

export const groupMessagesByDate = (messages: UiChatMessage[]) => {
  const groups = new Map<string, UiChatMessage[]>();
  for (const message of messages) {
    const dateKey = message.createdAt.slice(0, 10);
    groups.set(dateKey, [...(groups.get(dateKey) ?? []), message]);
  }
  return Array.from(groups.entries()).map(([date, groupedMessages]) => ({
    date,
    messages: groupedMessages.sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()),
  }));
};

export const getCompletedMissionIds = (badges: BadgeData[] | undefined) =>
  new Set((badges ?? []).filter((badge) => badge.earned).map((badge) => badge.missionId));
