import { cityFoodImages, cityLandmarkImages } from "@/mocks/spotImages";
import { cityMissions, computeCityMissions, type Mission as StaticMission } from "@/mocks/missionData";
import { cities as staticCities, type City as StaticCity } from "@/mocks/mockData";
import type {
  BadgeData,
  CityData,
  ChatMessageData,
  CityMember,
  CommentData,
  FriendData,
  MissionData,
  PostData,
  PublicProfile,
  UserProfile,
} from "@/lib/api";

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
  isUnlocked?: boolean;
  onlineUsers?: number;
}

export interface UiMission {
  id: string;
  cityId: string;
  type: UiMissionType;
  title: string;
  description: string;
  image: string;
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

type CityLike = CityData | StaticCity;
type MissionLike =
  | (MissionData & { image?: string | null })
  | (StaticMission & { imageUrl?: string | null; completedAt?: string | null });

const missionImageFallback = new Map<string, string>();

for (const missions of Object.values(cityMissions)) {
  for (const mission of missions) {
    missionImageFallback.set(mission.id, mission.image);
  }
}

const fallbackMissionImage = (missionId: string) =>
  missionImageFallback.get(missionId) ?? cityLandmarkImages.seoul?.[0]?.image ?? "";

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

export const toUiCity = (city: CityLike): UiCity => ({
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
  isUnlocked: "isUnlocked" in city ? city.isUnlocked : undefined,
  onlineUsers: "onlineUsers" in city ? city.onlineUsers : undefined,
});

export const toUiMission = (mission: MissionLike): UiMission => ({
  id: mission.id,
  cityId: mission.cityId,
  type: coerceMissionType(mission.type),
  title: mission.title,
  description: mission.description,
  image: mission.imageUrl ?? mission.image ?? fallbackMissionImage(mission.id),
  stepsRequired: mission.stepsRequired,
  reward: mission.reward ?? null,
  status: coerceMissionStatus(mission.status),
  completedAt: mission.completedAt ?? null,
  aiComposite: mission.aiComposite,
  aiPrompt: mission.aiPrompt ?? null,
  emoji: mission.emoji,
});

export const toUiMissionMap = (missions: Record<string, MissionData[]>) =>
  Object.fromEntries(
    Object.entries(missions).map(([cityId, cityMissionsForCity]) => [
      cityId,
      cityMissionsForCity.map((mission) => toUiMission(mission)),
    ]),
  ) as Record<string, UiMission[]>;

export const getStaticCities = () => staticCities.map((city) => toUiCity(city));

export const buildStaticMissionMap = (
  totalSteps: number,
  completedMissionIds: Iterable<string> = [],
) => {
  const completedSet =
    completedMissionIds instanceof Set
      ? completedMissionIds
      : new Set(completedMissionIds);

  return Object.fromEntries(
    staticCities.map((city) => [
      city.id,
      computeCityMissions(
        city.id,
        totalSteps,
        totalSteps >= city.stepsRequired,
        completedSet,
      ).map((mission) => toUiMission(mission)),
    ]),
  ) as Record<string, UiMission[]>;
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

export const findCityById = (cities: UiCity[], cityId?: string | null) =>
  cities.find((city) => city.id === cityId) ?? cities[0] ?? null;

export const findNextCity = (cities: UiCity[], totalSteps: number) =>
  cities.find((city) => totalSteps < city.stepsRequired) ?? null;

export const getProgressPercent = (cities: UiCity[], totalSteps: number, currentCityId?: string | null) => {
  const currentCity = findCityById(cities, currentCityId) ?? cities[0];
  const nextCity = findNextCity(cities, totalSteps);

  if (!currentCity || !nextCity) {
    return 100;
  }

  const range = nextCity.stepsRequired - currentCity.stepsRequired;
  if (range <= 0) {
    return 100;
  }

  const progressedSteps = totalSteps - currentCity.stepsRequired;
  return Math.min((progressedSteps / range) * 100, 100);
};

export const formatSteps = (steps: number) => {
  if (steps >= 1_000_000) {
    return `${(steps / 1_000_000).toFixed(1)}M`;
  }
  if (steps >= 1_000) {
    return `${Math.round(steps / 1_000)}K`;
  }
  return steps.toString();
};

export const getCityFoodItems = (city: UiCity | null) => {
  if (!city) {
    return [];
  }
  return cityFoodImages[city.id] ?? city.famousFood.map((food) => ({ name: food, image: cityFoodImages.seoul?.[0]?.image ?? "" }));
};

export const getCityLandmarkItems = (city: UiCity | null) => {
  if (!city) {
    return [];
  }
  return cityLandmarkImages[city.id] ?? city.landmarks.map((landmark) => ({ name: landmark, image: cityLandmarkImages.seoul?.[0]?.image ?? "" }));
};

export const groupMessagesByDate = (messages: UiChatMessage[]) => {
  const ordered = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const groups: Array<{ date: string; messages: UiChatMessage[] }> = [];

  for (const message of ordered) {
    const date = message.createdAt.slice(0, 10);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.date === date) {
      lastGroup.messages.push(message);
    } else {
      groups.push({ date, messages: [message] });
    }
  }

  return groups;
};

export const sortPostsNewestFirst = (posts: UiPost[]) =>
  [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const toBadgeGroups = (badges: BadgeData[], cities: UiCity[]) =>
  cities
    .map((city) => ({
      city,
      badges: badges.filter((badge) => badge.cityId === city.id),
    }))
    .filter((group) => group.badges.length > 0);
