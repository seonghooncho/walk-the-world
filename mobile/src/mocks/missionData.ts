import spotTokyoTower from "@/src/assets/images/spot-tokyo-tower.jpg";
import spotShibuya from "@/src/assets/images/spot-shibuya.jpg";
import spotAsakusa from "@/src/assets/images/spot-asakusa.jpg";
import spotGyeongbokgung from "@/src/assets/images/spot-gyeongbokgung.jpg";
import foodRamen from "@/src/assets/images/food-ramen.jpg";
import foodSushi from "@/src/assets/images/food-sushi.jpg";
import foodTakoyaki from "@/src/assets/images/food-takoyaki.jpg";
import foodTempura from "@/src/assets/images/food-tempura.jpg";
import type { ImageSourcePropType } from "react-native";

export type MissionType = "photo" | "food" | "writing" | "explore" | "social";
export type MissionStatus = "locked" | "available" | "completed";

export interface Mission {
  id: string;
  cityId: string;
  type: MissionType;
  title: string;
  description: string;
  image: ImageSourcePropType;
  stepsRequired: number;
  emoji: string;
  reward?: string;
  status: MissionStatus;
  aiComposite?: boolean;
  aiPrompt?: string;
}

export function computeMissionStatus(
  mission: Mission,
  userTotalSteps: number,
  isCityUnlocked: boolean,
  completedMissions: Set<string>,
): MissionStatus {
  if (completedMissions.has(mission.id)) return "completed";
  if (!isCityUnlocked) return "locked";
  if (userTotalSteps >= mission.stepsRequired) return "available";
  return "locked";
}

export function computeCityMissions(
  cityId: string,
  userTotalSteps: number,
  isCityUnlocked: boolean,
  completedMissions: Set<string>,
): Mission[] {
  const missions = cityMissions[cityId] || [];
  return missions.map((mission) => ({
    ...mission,
    status: computeMissionStatus(mission, userTotalSteps, isCityUnlocked, completedMissions),
  }));
}

export const cityMissions: Record<string, Mission[]> = {
  seoul: [
    { id: "s1", cityId: "seoul", type: "photo", title: "경복궁 앞에서 사진 찍기", description: "경복궁 정문에서 인증샷을 남겨보세요", image: spotGyeongbokgung, stepsRequired: 0, emoji: "📸", reward: "여행자 배지", status: "available" },
    { id: "s2", cityId: "seoul", type: "food", title: "비빔밥 먹기", description: "전통 비빔밥을 먹고 인증해보세요", image: foodRamen, stepsRequired: 50000, emoji: "🍽️", reward: "미식가 칭호", status: "locked" },
    { id: "s3", cityId: "seoul", type: "writing", title: "서울의 추억 남기기", description: "서울에서의 첫 여행 소감을 적어보세요", image: spotGyeongbokgung, stepsRequired: 100000, emoji: "✍️", status: "locked" },
    { id: "s4", cityId: "seoul", type: "explore", title: "남산타워 전망대 도착", description: "남산타워까지 걸어서 올라가보세요", image: spotTokyoTower, stepsRequired: 150000, emoji: "🗺️", reward: "등반왕 배지", status: "locked" },
    { id: "s5", cityId: "seoul", type: "social", title: "서울 친구 만들기", description: "서울에 있는 다른 여행자와 친구를 맺어보세요", image: spotShibuya, stepsRequired: 180000, emoji: "👋", status: "locked" },
    { id: "s6", cityId: "seoul", type: "photo", title: "한복 입고 인생샷", description: "한복을 입고 경복궁에서 AI 합성 사진을 만들어보세요", image: spotGyeongbokgung, stepsRequired: 50000, emoji: "📸", reward: "한복 미인 배지", status: "locked", aiComposite: true, aiPrompt: "경복궁 근정전 앞 벚꽃이 흩날리는 아름다운 배경" },
  ],
  tokyo: [
    { id: "t1", cityId: "tokyo", type: "photo", title: "도쿄타워 앞에서 사진 찍기", description: "도쿄의 상징 앞에서 여행 인증샷을 남겨보세요", image: spotTokyoTower, stepsRequired: 400000, emoji: "📸", reward: "도쿄 탐험가", status: "locked" },
    { id: "t2", cityId: "tokyo", type: "food", title: "라멘 한 그릇 먹기", description: "진한 돈코츠 라멘을 맛보세요", image: foodRamen, stepsRequired: 430000, emoji: "🍽️", reward: "라멘 마스터", status: "locked" },
    { id: "t3", cityId: "tokyo", type: "explore", title: "시부야 교차로 건너기", description: "세계에서 가장 바쁜 교차로를 체험하세요", image: spotShibuya, stepsRequired: 460000, emoji: "🗺️", status: "locked" },
    { id: "t4", cityId: "tokyo", type: "writing", title: "도쿄에서 보내는 편지", description: "도쿄에서의 하루를 글로 남겨보세요", image: spotAsakusa, stepsRequired: 490000, emoji: "✍️", status: "locked" },
    { id: "t5", cityId: "tokyo", type: "food", title: "스시 오마카세 도전", description: "일본 정통 스시를 맛보세요", image: foodSushi, stepsRequired: 520000, emoji: "🍽️", reward: "스시 감별사", status: "locked" },
    { id: "t6", cityId: "tokyo", type: "photo", title: "아사쿠사 센소지 인증", description: "붉은 등 아래서 특별한 사진을 남기세요", image: spotAsakusa, stepsRequired: 540000, emoji: "📸", status: "locked" },
    { id: "t7", cityId: "tokyo", type: "social", title: "도쿄 여행자 모임", description: "같은 도시의 여행자 3명과 친구를 맺어보세요", image: spotShibuya, stepsRequired: 560000, emoji: "👋", reward: "소셜 나비", status: "locked" },
    { id: "t8", cityId: "tokyo", type: "food", title: "타코야키 길거리 체험", description: "아키하바라에서 타코야키를 즐겨보세요", image: foodTakoyaki, stepsRequired: 580000, emoji: "🍽️", status: "locked" },
    { id: "t9", cityId: "tokyo", type: "photo", title: "벚꽃 아래 인생샷 합성", description: "만개한 벚꽃 터널 속 나의 모습을 AI로 합성해보세요", image: spotAsakusa, stepsRequired: 440000, emoji: "📸", reward: "벚꽃 여행자", status: "locked", aiComposite: true, aiPrompt: "도쿄 메구로강 만개한 벚꽃 터널 아래 봄날의 풍경" },
    { id: "t10", cityId: "tokyo", type: "writing", title: "일본 편의점 탐방기", description: "일본 편의점에서 발견한 신기한 것들을 글로 남겨보세요", image: foodSushi, stepsRequired: 470000, emoji: "✍️", status: "locked" },
  ],
  paris: [
    { id: "p1", cityId: "paris", type: "photo", title: "에펠탑 앞에서 사진 찍기", description: "파리의 상징 앞에서 인증샷을 남겨보세요", image: spotTokyoTower, stepsRequired: 2000000, emoji: "📸", reward: "파리지앵", status: "locked" },
    { id: "p2", cityId: "paris", type: "food", title: "크루아상 맛보기", description: "진짜 프랑스 크루아상을 체험하세요", image: foodTempura, stepsRequired: 2060000, emoji: "🍽️", status: "locked" },
    { id: "p3", cityId: "paris", type: "explore", title: "루브르 박물관 탐방", description: "세계 최대 박물관을 걸어보세요", image: spotGyeongbokgung, stepsRequired: 2120000, emoji: "🗺️", status: "locked" },
    { id: "p4", cityId: "paris", type: "writing", title: "파리에서 보내는 연애편지", description: "사랑의 도시에서 특별한 편지를 써보세요", image: spotAsakusa, stepsRequired: 2160000, emoji: "✍️", reward: "로맨티스트", status: "locked" },
  ],
};
