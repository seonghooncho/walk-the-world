import cityTokyoImg from "@/assets/city-tokyo.jpg";
import citySeoulImg from "@/assets/city-seoul.jpg";
import cityParisImg from "@/assets/city-paris.jpg";
import heroMapImg from "@/assets/hero-map.jpg";
import spotTokyoTower from "@/assets/spot-tokyo-tower.jpg";
import spotShibuya from "@/assets/spot-shibuya.jpg";
import spotAsakusa from "@/assets/spot-asakusa.jpg";
import foodRamen from "@/assets/food-ramen.jpg";
import foodTakoyaki from "@/assets/food-takoyaki.jpg";

export interface City {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  stepsRequired: number; // cumulative steps to reach this city
  ticketsRequired?: number;
  stampsRequired?: number;
  missionsRequired?: number;
  cityTheme?: string;
  lat: number;
  lng: number;
  image?: string;
  description: string;
  famousFood: string[];
  landmarks: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  totalSteps: number;
  todaySteps?: number;
  streakDays?: number;
  travelTickets?: number;
  stampsEarned?: number;
  sessionsCompleted?: number;
  visitedCityIds?: string[];
  currentCityId: string;
  friends: string[];
  joinedAt: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  cityId: string;
  missionId?: string;
  missionTitle?: string;
  proofType?: ProofType;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  stampReactions?: number;
  postcardReactions?: number;
  cheerReactions?: number;
  createdAt: string;
  isLiked: boolean;
}

export type ActivityType = "walk" | "run";
export type ProofType = "photo" | "text" | "session" | "screenshot" | "social";
export type SessionStatus = "suggested" | "active" | "completed";

export interface SessionMission {
  id: string;
  title: string;
  proofType: ProofType;
  optional: boolean;
}

export interface WalkRunSession {
  id: string;
  title: string;
  subtitle: string;
  activityType: ActivityType;
  targetLabel: string;
  durationMinutes?: number;
  distanceKm?: number;
  cityId: string;
  cityTheme: string;
  coverImage: string;
  difficulty: "easy" | "steady" | "challenge";
  ticketReward: number;
  stampRewardIds: string[];
  missions: SessionMission[];
  fallbackProofs: ProofType[];
  status: SessionStatus;
}

export interface PassportProgress {
  travelTickets: number;
  stampsEarned: number;
  sessionsCompleted: number;
  visitedCityIds: string[];
  nextCityId: string;
  nextUnlockLabel: string;
  representativePhotos: Array<{
    id: string;
    cityId: string;
    missionTitle: string;
    image: string;
  }>;
}

export const cities: City[] = [
  {
    id: "seoul",
    name: "서울",
    country: "대한민국",
    countryFlag: "🇰🇷",
    stepsRequired: 0,
    lat: 37.5665,
    lng: 126.978,
    description: "한류의 중심지, 전통과 현대가 공존하는 도시",
    famousFood: ["비빔밥", "김치찌개", "떡볶이", "삼겹살"],
    landmarks: ["경복궁", "남산타워", "명동", "홍대"],
  },
  {
    id: "busan",
    name: "부산",
    country: "대한민국",
    countryFlag: "🇰🇷",
    stepsRequired: 200000,
    lat: 35.1796,
    lng: 129.0756,
    description: "해운대와 감천문화마을의 항구 도시",
    famousFood: ["밀면", "돼지국밥", "씨앗호떡", "회"],
    landmarks: ["해운대", "감천문화마을", "태종대", "자갈치시장"],
  },
  {
    id: "tokyo",
    name: "도쿄",
    country: "일본",
    countryFlag: "🇯🇵",
    stepsRequired: 400000,
    lat: 35.6762,
    lng: 139.6503,
    description: "전통과 미래가 만나는 세계 최대 도시",
    famousFood: ["라멘", "스시", "타코야키", "텐푸라"],
    landmarks: ["도쿄타워", "시부야 교차로", "아사쿠사", "아키하바라"],
  },
  {
    id: "osaka",
    name: "오사카",
    country: "일본",
    countryFlag: "🇯🇵",
    stepsRequired: 600000,
    lat: 34.6937,
    lng: 135.5023,
    description: "먹거리의 천국, 활기 넘치는 도시",
    famousFood: ["오코노미야키", "타코야키", "쿠시카츠"],
    landmarks: ["오사카성", "도톤보리", "유니버설 스튜디오"],
  },
  {
    id: "shanghai",
    name: "상하이",
    country: "중국",
    countryFlag: "🇨🇳",
    stepsRequired: 800000,
    lat: 31.2304,
    lng: 121.4737,
    description: "동양의 파리, 현대 중국의 경제 중심지",
    famousFood: ["샤오롱바오", "마라탕", "볶음면"],
    landmarks: ["와이탄", "동방명주", "예원"],
  },
  {
    id: "bangkok",
    name: "방콕",
    country: "태국",
    countryFlag: "🇹🇭",
    stepsRequired: 1000000,
    lat: 13.7563,
    lng: 100.5018,
    description: "미소의 나라, 황금 사원의 도시",
    famousFood: ["팟타이", "똠양꿍", "망고 스티키라이스"],
    landmarks: ["왓 아룬", "왕궁", "카오산 로드"],
  },
  {
    id: "singapore",
    name: "싱가포르",
    country: "싱가포르",
    countryFlag: "🇸🇬",
    stepsRequired: 1200000,
    lat: 1.3521,
    lng: 103.8198,
    description: "가든시티, 아시아의 보석",
    famousFood: ["칠리크랩", "하이난 치킨라이스", "락사"],
    landmarks: ["마리나 베이 샌즈", "가든스 바이 더 베이", "센토사"],
  },
  {
    id: "mumbai",
    name: "뭄바이",
    country: "인도",
    countryFlag: "🇮🇳",
    stepsRequired: 1400000,
    lat: 19.076,
    lng: 72.8777,
    description: "볼리우드의 도시, 인도의 경제 수도",
    famousFood: ["버터 치킨", "비리야니", "도사"],
    landmarks: ["타지마할 호텔", "게이트웨이 오브 인디아"],
  },
  {
    id: "dubai",
    name: "두바이",
    country: "아랍에미리트",
    countryFlag: "🇦🇪",
    stepsRequired: 1600000,
    lat: 25.2048,
    lng: 55.2708,
    description: "사막 위의 미래도시",
    famousFood: ["샤와르마", "후무스", "마크부스"],
    landmarks: ["부르즈 할리파", "팜 주메이라", "두바이 몰"],
  },
  {
    id: "istanbul",
    name: "이스탄불",
    country: "튀르키예",
    countryFlag: "🇹🇷",
    stepsRequired: 1800000,
    lat: 41.0082,
    lng: 28.9784,
    description: "동서양의 교차점, 천년의 역사",
    famousFood: ["케밥", "바클라바", "터키쉬 딜라이트"],
    landmarks: ["아야 소피아", "블루 모스크", "그랜드 바자르"],
  },
  {
    id: "paris",
    name: "파리",
    country: "프랑스",
    countryFlag: "🇫🇷",
    stepsRequired: 2000000,
    lat: 48.8566,
    lng: 2.3522,
    description: "사랑과 예술의 도시",
    famousFood: ["크루아상", "에스카르고", "마카롱"],
    landmarks: ["에펠탑", "루브르 박물관", "개선문"],
  },
  {
    id: "london",
    name: "런던",
    country: "영국",
    countryFlag: "🇬🇧",
    stepsRequired: 2200000,
    lat: 51.5074,
    lng: -0.1278,
    description: "역사와 현대가 공존하는 세계적 도시",
    famousFood: ["피쉬 앤 칩스", "애프터눈 티", "선데이 로스트"],
    landmarks: ["빅 벤", "버킹엄 궁전", "타워 브릿지"],
  },
  {
    id: "newyork",
    name: "뉴욕",
    country: "미국",
    countryFlag: "🇺🇸",
    stepsRequired: 2600000,
    lat: 40.7128,
    lng: -74.006,
    description: "세계의 수도, 꿈의 도시",
    famousFood: ["뉴욕 피자", "베이글", "핫도그"],
    landmarks: ["자유의 여신상", "타임스 스퀘어", "센트럴 파크"],
  },
  {
    id: "rio",
    name: "리우데자네이루",
    country: "브라질",
    countryFlag: "🇧🇷",
    stepsRequired: 3000000,
    lat: -22.9068,
    lng: -43.1729,
    description: "삼바와 카니발의 도시",
    famousFood: ["슈하스코", "아사이 보울", "페이조아다"],
    landmarks: ["코르코바도 산", "코파카바나", "이과수 폭포"],
  },
];

export const currentUser: UserProfile = {
  id: "user1",
  name: "김여행",
  avatar: "",
  totalSteps: 523847,
  travelTickets: 8,
  stampsEarned: 5,
  sessionsCompleted: 12,
  visitedCityIds: ["seoul", "busan", "tokyo"],
  currentCityId: "tokyo",
  friends: ["user2", "user3", "user5"],
  joinedAt: "2025-12-01",
};

export const cityUsers: UserProfile[] = [
  {
    id: "user2",
    name: "박모험",
    avatar: "",
    totalSteps: 510000,
    travelTickets: 7,
    stampsEarned: 6,
    sessionsCompleted: 10,
    visitedCityIds: ["seoul", "busan", "tokyo"],
    currentCityId: "tokyo",
    friends: ["user1"],
    joinedAt: "2025-11-15",
  },
  {
    id: "user3",
    name: "이탐험",
    avatar: "",
    totalSteps: 498000,
    travelTickets: 6,
    stampsEarned: 4,
    sessionsCompleted: 8,
    visitedCityIds: ["seoul", "tokyo"],
    currentCityId: "tokyo",
    friends: ["user1"],
    joinedAt: "2025-10-20",
  },
  {
    id: "user4",
    name: "최산책",
    avatar: "",
    totalSteps: 480000,
    travelTickets: 5,
    stampsEarned: 3,
    sessionsCompleted: 7,
    visitedCityIds: ["seoul", "tokyo"],
    currentCityId: "tokyo",
    friends: [],
    joinedAt: "2026-01-05",
  },
  {
    id: "user5",
    name: "정걸음",
    avatar: "",
    totalSteps: 520000,
    travelTickets: 8,
    stampsEarned: 5,
    sessionsCompleted: 11,
    visitedCityIds: ["seoul", "busan", "tokyo"],
    currentCityId: "tokyo",
    friends: ["user1"],
    joinedAt: "2025-09-10",
  },
];

export const posts: Post[] = [
  {
    id: "p1",
    userId: "user2",
    userName: "박모험",
    userAvatar: "",
    cityId: "tokyo",
    missionId: "t1",
    missionTitle: "빨간 사인 찾기",
    proofType: "photo",
    content: "출근길에 발견한 빨간 표지판. 오늘의 도쿄 테마 산책 완료!",
    image: spotShibuya,
    likes: 24,
    comments: 5,
    stampReactions: 12,
    postcardReactions: 6,
    cheerReactions: 4,
    createdAt: "2026-03-08T10:30:00",
    isLiked: true,
  },
  {
    id: "p2",
    userId: "user3",
    userName: "이탐험",
    userAvatar: "",
    cityId: "tokyo",
    missionId: "t2",
    missionTitle: "편의점 간식 캡처",
    proofType: "photo",
    content: "2km 러닝 끝나고 라멘 컵 하나. 외부 앱 기록이랑 같이 올렸어요.",
    image: foodRamen,
    likes: 18,
    comments: 3,
    stampReactions: 9,
    postcardReactions: 4,
    cheerReactions: 7,
    createdAt: "2026-03-07T18:00:00",
    isLiked: false,
  },
  {
    id: "p3",
    userId: "user1",
    userName: "김여행",
    userAvatar: "",
    cityId: "tokyo",
    missionId: "t3",
    missionTitle: "2km 라이트 런",
    proofType: "screenshot",
    content: "PWA 트래킹이 중간에 꺼져서 러닝 앱 스크린샷으로 인증. 티켓 3장 획득!",
    image: heroMapImg,
    likes: 31,
    comments: 8,
    stampReactions: 16,
    postcardReactions: 5,
    cheerReactions: 11,
    createdAt: "2026-03-07T20:00:00",
    isLiked: false,
  },
  {
    id: "p4",
    userId: "user5",
    userName: "정걸음",
    userAvatar: "",
    cityId: "tokyo",
    missionId: "t4",
    missionTitle: "오늘의 하늘 기록",
    proofType: "text",
    content: "오늘 하늘은 옅은 회색. 그래도 30분 도시 산책을 끝내니 여행 온 기분이 났어요.",
    image: spotAsakusa,
    likes: 42,
    comments: 12,
    stampReactions: 18,
    postcardReactions: 10,
    cheerReactions: 8,
    createdAt: "2026-03-06T14:00:00",
    isLiked: true,
  },
];

export const suggestedSessions: WalkRunSession[] = [
  {
    id: "session-15m-walk",
    title: "15-minute walk",
    subtitle: "가볍게 나가 오늘의 첫 여행 티켓을 받기",
    activityType: "walk",
    targetLabel: "15분",
    durationMinutes: 15,
    cityId: "seoul",
    cityTheme: "서울 골목 산책",
    coverImage: citySeoulImg,
    difficulty: "easy",
    ticketReward: 2,
    stampRewardIds: ["First Walk", "Red Sign"],
    missions: [
      { id: "s1", title: "빨간 간판 찾기", proofType: "photo", optional: true },
      { id: "s3", title: "오늘의 골목 한 줄", proofType: "text", optional: true },
    ],
    fallbackProofs: ["photo", "text", "session"],
    status: "suggested",
  },
  {
    id: "session-2k-run",
    title: "2km light run",
    subtitle: "정확한 백그라운드 GPS보다 완료 증명이 중요한 러닝",
    activityType: "run",
    targetLabel: "2km",
    distanceKm: 2,
    cityId: "tokyo",
    cityTheme: "도쿄 라이트 런",
    coverImage: cityTokyoImg,
    difficulty: "steady",
    ticketReward: 3,
    stampRewardIds: ["Light Runner", "Backup Proof"],
    missions: [
      { id: "t3", title: "2km 라이트 런", proofType: "session", optional: false },
      { id: "t5", title: "러닝 앱 스크린샷", proofType: "screenshot", optional: true },
    ],
    fallbackProofs: ["session", "screenshot", "text"],
    status: "suggested",
  },
  {
    id: "session-30m-city",
    title: "30-minute city walk",
    subtitle: "사진 미션 2개를 골라 도시 스탬프를 채우기",
    activityType: "walk",
    targetLabel: "30분",
    durationMinutes: 30,
    cityId: "tokyo",
    cityTheme: "도쿄 시티 프레임",
    coverImage: spotTokyoTower,
    difficulty: "challenge",
    ticketReward: 4,
    stampRewardIds: ["Tokyo Red", "City Frame"],
    missions: [
      { id: "t1", title: "빨간 사인 찾기", proofType: "photo", optional: true },
      { id: "t7", title: "작은 교차로 프레임", proofType: "photo", optional: true },
      { id: "t6", title: "같은 미션 피드 보기", proofType: "social", optional: true },
    ],
    fallbackProofs: ["photo", "session", "screenshot"],
    status: "suggested",
  },
];

export const passportProgress: PassportProgress = {
  travelTickets: 8,
  stampsEarned: 5,
  sessionsCompleted: 12,
  visitedCityIds: ["seoul", "busan", "tokyo"],
  nextCityId: "osaka",
  nextUnlockLabel: "티켓 2장 + 스탬프 1개 더 모으면 오사카 티켓 오픈",
  representativePhotos: [
    { id: "photo-red-sign", cityId: "tokyo", missionTitle: "빨간 사인 찾기", image: spotShibuya },
    { id: "photo-snack", cityId: "tokyo", missionTitle: "편의점 간식 캡처", image: foodRamen },
    { id: "photo-seoul", cityId: "seoul", missionTitle: "횡단보도 프레임", image: citySeoulImg },
    { id: "photo-paris", cityId: "paris", missionTitle: "오늘의 창문", image: cityParisImg },
  ],
};

export function getCurrentCity(totalSteps: number): City {
  let current = cities[0];
  for (const city of cities) {
    if (totalSteps >= city.stepsRequired) {
      current = city;
    } else {
      break;
    }
  }
  return current;
}

export function getNextCity(totalSteps: number): City | null {
  for (const city of cities) {
    if (totalSteps < city.stepsRequired) {
      return city;
    }
  }
  return null;
}

export function getProgress(totalSteps: number): number {
  const current = getCurrentCity(totalSteps);
  const next = getNextCity(totalSteps);
  if (!next) return 100;
  const range = next.stepsRequired - current.stepsRequired;
  const progress = totalSteps - current.stepsRequired;
  return Math.min((progress / range) * 100, 100);
}

export function formatSteps(steps: number): string {
  if (steps >= 1000000) return `${(steps / 1000000).toFixed(1)}M`;
  if (steps >= 1000) return `${(steps / 1000).toFixed(0)}K`;
  return steps.toString();
}
