import { cityFoodImages, cityLandmarkImages } from "@/mocks/spotImages";
import {
  cityMissions,
  computeCityMissions,
  estimateStampCount,
  estimateTravelTickets,
  type Mission as StaticMission,
  type ProofType,
} from "@/mocks/missionData";
import {
  cities as staticCities,
  currentUser as guestPreviewUser,
  passportProgress,
  posts as mockPosts,
  type City as StaticCity,
} from "@/mocks/mockData";
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
  StepInfo,
  UserProfile,
} from "@/lib/api";

export type UiMissionType = ProofType;
export type UiMissionStatus = "locked" | "available" | "completed";

export interface UiCity {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  stepsRequired: number;
  ticketsRequired: number;
  stampsRequired: number;
  missionsRequired: number;
  cityTheme: string;
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
  proofType: ProofType;
  title: string;
  description: string;
  image: string;
  stepsRequired: number;
  ticketsRequired: number;
  stampsRequired: number;
  reward: string | null;
  stampReward: string;
  ticketReward: number;
  sessionHint: string;
  verificationLabel: string;
  proofExamples: string[];
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
  missionId: string | null;
  missionTitle: string;
  proofType: ProofType;
  stampReactions: number;
  postcardReactions: number;
  cheerReactions: number;
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

const cityRequirementDefaults = [
  { ticketsRequired: 0, stampsRequired: 0, missionsRequired: 0, cityTheme: "첫 여행 준비" },
  { ticketsRequired: 3, stampsRequired: 1, missionsRequired: 1, cityTheme: "바다빛 산책" },
  { ticketsRequired: 5, stampsRequired: 2, missionsRequired: 2, cityTheme: "네온 시티 워크" },
  { ticketsRequired: 8, stampsRequired: 4, missionsRequired: 3, cityTheme: "간식 골목 산책" },
  { ticketsRequired: 10, stampsRequired: 6, missionsRequired: 4, cityTheme: "스카이라인 산책" },
  { ticketsRequired: 12, stampsRequired: 7, missionsRequired: 5, cityTheme: "골든 루트" },
  { ticketsRequired: 14, stampsRequired: 8, missionsRequired: 6, cityTheme: "가든 시티" },
  { ticketsRequired: 16, stampsRequired: 9, missionsRequired: 7, cityTheme: "컬러 스트리트" },
  { ticketsRequired: 18, stampsRequired: 10, missionsRequired: 8, cityTheme: "선라이트 루트" },
  { ticketsRequired: 20, stampsRequired: 11, missionsRequired: 9, cityTheme: "패턴 헌터" },
  { ticketsRequired: 22, stampsRequired: 12, missionsRequired: 10, cityTheme: "포스트카드 워크" },
  { ticketsRequired: 24, stampsRequired: 13, missionsRequired: 11, cityTheme: "레인 워크" },
  { ticketsRequired: 28, stampsRequired: 15, missionsRequired: 12, cityTheme: "업템포 런" },
  { ticketsRequired: 32, stampsRequired: 17, missionsRequired: 14, cityTheme: "월드 루프" },
];

const getStaticCityRequirement = (cityId: string) => {
  const index = Math.max(0, staticCities.findIndex((city) => city.id === cityId));
  return cityRequirementDefaults[index] ?? cityRequirementDefaults[cityRequirementDefaults.length - 1];
};

const coerceMissionType = (type: string): UiMissionType => {
  if (type === "photo" || type === "text" || type === "session" || type === "screenshot" || type === "social") {
    return type;
  }
  if (type === "writing") return "text";
  if (type === "food") return "photo";
  return "session";
};

const coerceMissionStatus = (status: string): UiMissionStatus => {
  if (status === "locked" || status === "available" || status === "completed") {
    return status;
  }
  return "locked";
};

export const toUiCity = (city: CityLike): UiCity => ({
  ...(() => {
    const requirement = getStaticCityRequirement(city.id);
    return {
      id: city.id,
      name: city.name,
      country: city.country,
      countryFlag: city.countryFlag,
      stepsRequired: city.stepsRequired,
      ticketsRequired: "ticketsRequired" in city && city.ticketsRequired !== undefined ? city.ticketsRequired : requirement.ticketsRequired,
      stampsRequired: "stampsRequired" in city && city.stampsRequired !== undefined ? city.stampsRequired : requirement.stampsRequired,
      missionsRequired: "missionsRequired" in city && city.missionsRequired !== undefined ? city.missionsRequired : requirement.missionsRequired,
      cityTheme: "cityTheme" in city && city.cityTheme ? city.cityTheme : requirement.cityTheme,
      lat: city.lat,
      lng: city.lng,
      description: city.description,
      famousFood: city.famousFood,
      landmarks: city.landmarks,
      isUnlocked: "isUnlocked" in city ? city.isUnlocked : undefined,
      onlineUsers: "onlineUsers" in city ? city.onlineUsers : undefined,
    };
  })(),
});

export const toUiMission = (mission: MissionLike): UiMission => ({
  id: mission.id,
  cityId: mission.cityId,
  type: coerceMissionType(mission.type),
  proofType: "proofType" in mission && typeof mission.proofType === "string" ? coerceMissionType(mission.proofType) : coerceMissionType(mission.type),
  title: mission.title,
  description: mission.description,
  image: mission.imageUrl ?? mission.image ?? fallbackMissionImage(mission.id),
  stepsRequired: mission.stepsRequired,
  ticketsRequired:
    "ticketsRequired" in mission && typeof mission.ticketsRequired === "number"
      ? mission.ticketsRequired
      : Math.max(0, Math.floor(mission.stepsRequired / 75_000)),
  stampsRequired:
    "stampsRequired" in mission && typeof mission.stampsRequired === "number"
      ? mission.stampsRequired
      : Math.max(0, Math.floor(mission.stepsRequired / 150_000)),
  reward: mission.reward ?? null,
  stampReward: "stampReward" in mission && mission.stampReward ? mission.stampReward : mission.reward ?? "City Stamp",
  ticketReward: "ticketReward" in mission && typeof mission.ticketReward === "number" ? mission.ticketReward : 1,
  sessionHint: "sessionHint" in mission && mission.sessionHint ? mission.sessionHint : "walk/run 세션 후 인증",
  verificationLabel:
    "verificationLabel" in mission && mission.verificationLabel
      ? mission.verificationLabel
      : coerceMissionType(mission.type) === "photo"
        ? "사진 증명"
        : coerceMissionType(mission.type) === "text"
          ? "텍스트 증명"
          : "세션 증명",
  proofExamples: "proofExamples" in mission && mission.proofExamples ? mission.proofExamples : ["미션 조건이 보이는 증명", "짧은 기록"],
  status: coerceMissionStatus(mission.status),
  completedAt: mission.completedAt ?? null,
  aiComposite: Boolean(mission.aiComposite),
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

export const GUEST_PREVIEW_TOTAL_STEPS = guestPreviewUser.totalSteps;
export const GUEST_PREVIEW_CITY_ID = guestPreviewUser.currentCityId;

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
        isCityUnlockedByPassport(toUiCity(city), totalSteps, completedSet),
        completedSet,
      ).map((mission) => toUiMission(mission)),
    ]),
  ) as Record<string, UiMission[]>;
};

export interface PassportSnapshot {
  travelTickets: number;
  stampsEarned: number;
  sessionsCompleted: number;
  visitedCityIds: string[];
  completedMissionCount: number;
  nextCity: UiCity | null;
  nextUnlockLabel: string;
}

export const buildPassportSnapshot = (
  cities: UiCity[],
  totalSteps: number,
  completedMissionIds: Iterable<string> = [],
): PassportSnapshot => {
  const completedSet = completedMissionIds instanceof Set ? completedMissionIds : new Set(completedMissionIds);
  const travelTickets = Math.max(passportProgress.travelTickets, estimateTravelTickets(totalSteps));
  const stampsEarned = Math.max(passportProgress.stampsEarned, estimateStampCount(totalSteps, completedSet.size));
  const sessionsCompleted = Math.max(passportProgress.sessionsCompleted, Math.floor(travelTickets * 1.4));
  const completedMissionCount = Math.max(completedSet.size, stampsEarned);
  const visitedCityIds = cities
    .filter((city) => isCityUnlockedByPassport(city, totalSteps, completedSet))
    .map((city) => city.id);
  const nextCity = cities.find((city) => !visitedCityIds.includes(city.id)) ?? null;
  const nextUnlockLabel = nextCity
    ? `티켓 ${Math.max(0, nextCity.ticketsRequired - travelTickets)}장, 스탬프 ${Math.max(0, nextCity.stampsRequired - stampsEarned)}개, 미션 ${Math.max(0, nextCity.missionsRequired - completedMissionCount)}개 더`
    : "모든 도시 스탬프 여권 완성";

  return {
    travelTickets,
    stampsEarned,
    sessionsCompleted,
    visitedCityIds,
    completedMissionCount,
    nextCity,
    nextUnlockLabel,
  };
};

export const isCityUnlockedByPassport = (
  city: UiCity,
  totalSteps: number,
  completedMissionIds: Iterable<string> = [],
) => {
  const completedSet = completedMissionIds instanceof Set ? completedMissionIds : new Set(completedMissionIds);
  const tickets = Math.max(passportProgress.travelTickets, estimateTravelTickets(totalSteps));
  const stamps = Math.max(passportProgress.stampsEarned, estimateStampCount(totalSteps, completedSet.size));
  const completedMissionCount = Math.max(completedSet.size, stamps);

  return (
    tickets >= city.ticketsRequired &&
    stamps >= city.stampsRequired &&
    completedMissionCount >= city.missionsRequired
  );
};

export const getCityUnlockLabel = (city: UiCity) =>
  `티켓 ${city.ticketsRequired}장 · 스탬프 ${city.stampsRequired}개 · 미션 ${city.missionsRequired}개`;

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
  missionId: "missionId" in post && typeof post.missionId === "string" ? post.missionId : null,
  missionTitle: "missionTitle" in post && typeof post.missionTitle === "string" ? post.missionTitle : "도시 미션 인증",
  proofType: "proofType" in post && typeof post.proofType === "string" ? coerceMissionType(post.proofType) : post.image ? "photo" : "text",
  stampReactions: "stampReactions" in post && typeof post.stampReactions === "number" ? post.stampReactions : post.likes,
  postcardReactions: "postcardReactions" in post && typeof post.postcardReactions === "number" ? post.postcardReactions : Math.floor(post.likes / 2),
  cheerReactions: "cheerReactions" in post && typeof post.cheerReactions === "number" ? post.cheerReactions : Math.max(0, post.comments),
});

export const mockProofPosts: UiPost[] = mockPosts.map((post, index) => ({
  id: Number(post.id.replace(/\D/g, "")) || index + 1,
  userId: Number(post.userId.replace(/\D/g, "")) || index + 1,
  userName: post.userName,
  userAvatarUrl: post.userAvatar || null,
  cityId: post.cityId,
  content: post.content,
  imageUrl: post.image ?? null,
  imageKey: null,
  likes: post.likes,
  comments: post.comments,
  isLiked: post.isLiked,
  createdAt: post.createdAt,
  missionId: post.missionId ?? null,
  missionTitle: post.missionTitle ?? "도시 미션 인증",
  proofType: post.proofType ?? "photo",
  stampReactions: post.stampReactions ?? post.likes,
  postcardReactions: post.postcardReactions ?? Math.floor(post.likes / 2),
  cheerReactions: post.cheerReactions ?? post.comments,
}));

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
