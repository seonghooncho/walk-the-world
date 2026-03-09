import spotTokyoTower from "@/assets/spot-tokyo-tower.jpg";
import spotShibuya from "@/assets/spot-shibuya.jpg";
import spotAsakusa from "@/assets/spot-asakusa.jpg";
import spotGyeongbokgung from "@/assets/spot-gyeongbokgung.jpg";
import foodRamen from "@/assets/food-ramen.jpg";
import foodSushi from "@/assets/food-sushi.jpg";
import foodTakoyaki from "@/assets/food-takoyaki.jpg";
import foodTempura from "@/assets/food-tempura.jpg";

export type MissionType = "photo" | "food" | "writing" | "explore" | "social";
export type MissionStatus = "locked" | "available" | "completed";

export interface Mission {
  id: string;
  cityId: string;
  type: MissionType;
  title: string;
  description: string;
  image: string;
  /** 이 미션을 열기 위해 필요한 누적 걸음 수 (도시 내 기준) */
  stepsRequired: number;
  emoji: string;
  reward?: string;
  /** 런타임에서 계산됨 — 원본 데이터에선 무시 */
  status: MissionStatus;
  aiComposite?: boolean;
  aiPrompt?: string;
}

// =====================================================================
// 미션 잠금 해제 규칙
// =====================================================================
// 1. 도시 잠금: cities[].stepsRequired <= user.totalSteps
// 2. 미션 잠금: 도시가 열려 있고 + mission.stepsRequired <= user.totalSteps
// 3. 완료: completedMissions Set에 missionId가 포함
//
// computeMissionStatus(mission, userTotalSteps, cityUnlocked, completedSet)
//   → "completed" | "available" | "locked"
// =====================================================================

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

/**
 * 도시의 모든 미션에 대해 status를 재계산하여 새 배열을 반환
 */
export function computeCityMissions(
  cityId: string,
  userTotalSteps: number,
  isCityUnlocked: boolean,
  completedMissions: Set<string>,
): Mission[] {
  const missions = cityMissions[cityId] || [];
  return missions.map((m) => ({
    ...m,
    status: computeMissionStatus(m, userTotalSteps, isCityUnlocked, completedMissions),
  }));
}

// =====================================================================
// Missions per city (status 필드는 초기값 — 런타임에서 재계산됨)
// =====================================================================
export const cityMissions: Record<string, Mission[]> = {
  // ============ 서울 ============
  seoul: [
    { id: "s1", cityId: "seoul", type: "photo", title: "경복궁 앞에서 사진 찍기", description: "경복궁 정문에서 인증샷을 남겨보세요", image: spotGyeongbokgung, stepsRequired: 0, emoji: "📸", reward: "여행자 배지", status: "available" },
    { id: "s2", cityId: "seoul", type: "food", title: "비빔밥 먹기", description: "전통 비빔밥을 먹고 인증해보세요", image: foodRamen, stepsRequired: 50000, emoji: "🍽️", reward: "미식가 칭호", status: "locked" },
    { id: "s3", cityId: "seoul", type: "writing", title: "서울의 추억 남기기", description: "서울에서의 첫 여행 소감을 적어보세요", image: spotGyeongbokgung, stepsRequired: 100000, emoji: "✍️", status: "locked" },
    { id: "s4", cityId: "seoul", type: "explore", title: "남산타워 전망대 도착", description: "남산타워까지 걸어서 올라가보세요", image: spotTokyoTower, stepsRequired: 150000, emoji: "🗺️", reward: "등반왕 배지", status: "locked" },
    { id: "s5", cityId: "seoul", type: "social", title: "서울 친구 만들기", description: "서울에 있는 다른 여행자와 친구를 맺어보세요", image: spotShibuya, stepsRequired: 180000, emoji: "👋", status: "locked" },
    { id: "s6", cityId: "seoul", type: "photo", title: "한복 입고 인생샷", description: "한복을 입고 경복궁에서 AI 합성 사진을 만들어보세요", image: spotGyeongbokgung, stepsRequired: 50000, emoji: "📸", reward: "한복 미인 배지", status: "locked", aiComposite: true, aiPrompt: "경복궁 근정전 앞 벚꽃이 흩날리는 아름다운 배경" },
  ],

  // ============ 부산 ============
  busan: [
    { id: "b1", cityId: "busan", type: "photo", title: "해운대 해변 인증샷", description: "해운대 바다를 배경으로 사진을 남겨보세요", image: spotShibuya, stepsRequired: 200000, emoji: "📸", reward: "해변 탐험가", status: "locked" },
    { id: "b2", cityId: "busan", type: "food", title: "밀면 한 그릇", description: "부산의 대표 음식 밀면을 맛보세요", image: foodRamen, stepsRequired: 250000, emoji: "🍽️", status: "locked" },
    { id: "b3", cityId: "busan", type: "explore", title: "감천문화마을 산책", description: "알록달록한 감천문화마을을 걸어보세요", image: spotAsakusa, stepsRequired: 300000, emoji: "🗺️", reward: "마을 탐험가", status: "locked" },
    { id: "b4", cityId: "busan", type: "writing", title: "바다가 보이는 일기", description: "부산 바다를 보며 느낀 점을 적어보세요", image: spotShibuya, stepsRequired: 350000, emoji: "✍️", status: "locked" },
    { id: "b5", cityId: "busan", type: "photo", title: "광안대교 야경 합성", description: "광안대교의 화려한 야경 앞에 서 있는 합성 사진을 만들어보세요", image: spotShibuya, stepsRequired: 280000, emoji: "📸", reward: "야경 사진가", status: "locked", aiComposite: true, aiPrompt: "부산 광안대교 화려한 LED 야경이 비치는 해변" },
    { id: "b6", cityId: "busan", type: "writing", title: "부산 사투리 도전기", description: "부산 사투리를 배우고 느낀 점을 글로 남겨보세요", image: foodRamen, stepsRequired: 320000, emoji: "✍️", status: "locked" },
  ],

  // ============ 도쿄 ============
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

  // ============ 오사카 ============
  osaka: [
    { id: "o1", cityId: "osaka", type: "photo", title: "오사카성 인증샷", description: "오사카성을 배경으로 사진을 찍어보세요", image: spotGyeongbokgung, stepsRequired: 600000, emoji: "📸", reward: "성 탐험가", status: "locked" },
    { id: "o2", cityId: "osaka", type: "food", title: "오코노미야키 체험", description: "오사카식 오코노미야키를 먹어보세요", image: foodTakoyaki, stepsRequired: 650000, emoji: "🍽️", status: "locked" },
    { id: "o3", cityId: "osaka", type: "explore", title: "도톤보리 야경 산책", description: "네온사인 가득한 도톤보리를 걸어보세요", image: spotShibuya, stepsRequired: 700000, emoji: "🗺️", status: "locked" },
    { id: "o4", cityId: "osaka", type: "writing", title: "오사카의 맛을 기록하기", description: "먹거리 천국 오사카에서의 미식 일기를 남겨보세요", image: foodTempura, stepsRequired: 750000, emoji: "✍️", status: "locked" },
    { id: "o5", cityId: "osaka", type: "photo", title: "글리코 간판 앞 합성샷", description: "도톤보리의 상징 글리코 간판 앞에서 AI 합성 사진을 만들어보세요", image: spotShibuya, stepsRequired: 630000, emoji: "📸", reward: "오사카 러너", status: "locked", aiComposite: true, aiPrompt: "오사카 도톤보리 글리코 간판이 빛나는 야경 거리" },
    { id: "o6", cityId: "osaka", type: "writing", title: "오사카 vs 도쿄 비교기", description: "오사카와 도쿄를 비교하며 느낀 점을 적어보세요", image: foodTakoyaki, stepsRequired: 720000, emoji: "✍️", status: "locked" },
  ],

  // ============ 상하이 ============
  shanghai: [
    { id: "sh1", cityId: "shanghai", type: "photo", title: "와이탄 야경 촬영", description: "상하이 와이탄의 화려한 야경을 남겨보세요", image: spotShibuya, stepsRequired: 800000, emoji: "📸", status: "locked" },
    { id: "sh2", cityId: "shanghai", type: "food", title: "샤오롱바오 먹기", description: "진짜 상하이 샤오롱바오를 맛보세요", image: foodSushi, stepsRequired: 860000, emoji: "🍽️", status: "locked" },
    { id: "sh3", cityId: "shanghai", type: "explore", title: "예원 정원 산책", description: "아름다운 중국 전통 정원을 걸어보세요", image: spotAsakusa, stepsRequired: 920000, emoji: "🗺️", status: "locked" },
    { id: "sh4", cityId: "shanghai", type: "photo", title: "동방명주 앞 합성샷", description: "상하이의 상징 동방명주탑 앞에서 AI 합성 사진을 찍어보세요", image: spotTokyoTower, stepsRequired: 830000, emoji: "📸", reward: "상하이 탐험가", status: "locked", aiComposite: true, aiPrompt: "상하이 푸둥 동방명주탑과 스카이라인이 보이는 야경" },
    { id: "sh5", cityId: "shanghai", type: "writing", title: "중국 문화 체험기", description: "상하이에서 경험한 중국 문화에 대해 글을 남겨보세요", image: spotAsakusa, stepsRequired: 890000, emoji: "✍️", status: "locked" },
    { id: "sh6", cityId: "shanghai", type: "photo", title: "치파오 입고 촬영", description: "전통 의상 치파오를 입고 상하이 골목 배경 합성 사진을 만들어보세요", image: spotGyeongbokgung, stepsRequired: 950000, emoji: "📸", reward: "치파오 미인", status: "locked", aiComposite: true, aiPrompt: "상하이 프랑스 조계지 플라타너스 가로수길의 복고풍 골목" },
  ],

  // ============ 방콕 ============
  bangkok: [
    { id: "bk1", cityId: "bangkok", type: "photo", title: "왓 아룬 사진 찍기", description: "새벽의 사원 앞에서 인증샷을 남겨보세요", image: spotAsakusa, stepsRequired: 1000000, emoji: "📸", status: "locked" },
    { id: "bk2", cityId: "bangkok", type: "food", title: "팟타이 먹기", description: "본고장 팟타이를 맛보세요", image: foodTakoyaki, stepsRequired: 1070000, emoji: "🍽️", status: "locked" },
    { id: "bk3", cityId: "bangkok", type: "social", title: "카오산 로드 친구 만들기", description: "배낭여행자 거리에서 새 친구를 사귀세요", image: spotShibuya, stepsRequired: 1140000, emoji: "👋", status: "locked" },
    { id: "bk4", cityId: "bangkok", type: "photo", title: "왕궁 앞 합성 사진", description: "태국 왕궁의 황금빛 지붕 앞에서 AI 합성 사진을 만들어보세요", image: spotGyeongbokgung, stepsRequired: 1040000, emoji: "📸", reward: "황금 궁전 배지", status: "locked", aiComposite: true, aiPrompt: "방콕 왕궁의 황금빛 첨탑과 에메랄드 사원이 보이는 광장" },
    { id: "bk5", cityId: "bangkok", type: "writing", title: "태국 사원 순례기", description: "방콕의 화려한 사원들을 방문하고 느낀 점을 적어보세요", image: spotAsakusa, stepsRequired: 1100000, emoji: "✍️", status: "locked" },
    { id: "bk6", cityId: "bangkok", type: "photo", title: "수상시장 인증샷", description: "담넌 사두악 수상시장에서 배 위의 사진을 업로드하세요", image: foodTempura, stepsRequired: 1120000, emoji: "📸", reward: "수상 탐험가", status: "locked" },
    { id: "bk7", cityId: "bangkok", type: "writing", title: "태국 음식 리뷰", description: "방콕에서 먹은 음식들에 대한 솔직한 리뷰를 써보세요", image: foodTakoyaki, stepsRequired: 1160000, emoji: "✍️", status: "locked" },
  ],

  // ============ 싱가포르 ============
  singapore: [
    { id: "sg1", cityId: "singapore", type: "photo", title: "마리나 베이 샌즈 인증", description: "싱가포르의 상징 마리나 베이 샌즈를 배경으로 사진을 찍어보세요", image: spotTokyoTower, stepsRequired: 1200000, emoji: "📸", reward: "가든시티 탐험가", status: "locked" },
    { id: "sg2", cityId: "singapore", type: "photo", title: "머라이언 합성 사진", description: "머라이언 분수 옆에서 물줄기를 받는 포즈의 AI 합성 사진을 만들어보세요", image: spotShibuya, stepsRequired: 1230000, emoji: "📸", reward: "머라이언 친구", status: "locked", aiComposite: true, aiPrompt: "싱가포르 머라이언 파크에서 물줄기를 뿜는 머라이언 동상 옆" },
    { id: "sg3", cityId: "singapore", type: "writing", title: "가든스 바이 더 베이 감상문", description: "초현실적인 슈퍼트리 그로브를 보고 느낀 감상을 적어보세요", image: spotAsakusa, stepsRequired: 1260000, emoji: "✍️", status: "locked" },
    { id: "sg4", cityId: "singapore", type: "food", title: "칠리크랩 도전", description: "싱가포르 대표 음식 칠리크랩을 먹고 인증해보세요", image: foodTempura, stepsRequired: 1290000, emoji: "🍽️", reward: "크랩 마스터", status: "locked" },
    { id: "sg5", cityId: "singapore", type: "photo", title: "슈퍼트리 야경 합성", description: "가든스 바이 더 베이 슈퍼트리의 환상적인 야경과 합성 사진을 만들어보세요", image: spotTokyoTower, stepsRequired: 1320000, emoji: "📸", reward: "야경 감별사", status: "locked", aiComposite: true, aiPrompt: "싱가포르 가든스 바이 더 베이 슈퍼트리 그로브의 보라빛 LED 야경" },
    { id: "sg6", cityId: "singapore", type: "writing", title: "다문화 도시의 매력", description: "중국, 말레이, 인도 문화가 공존하는 싱가포르의 매력을 글로 남겨보세요", image: spotGyeongbokgung, stepsRequired: 1350000, emoji: "✍️", status: "locked" },
  ],

  // ============ 뭄바이 ============
  mumbai: [
    { id: "mb1", cityId: "mumbai", type: "photo", title: "게이트웨이 오브 인디아 인증", description: "뭄바이의 상징 게이트웨이 오브 인디아에서 사진을 찍어보세요", image: spotGyeongbokgung, stepsRequired: 1400000, emoji: "📸", reward: "인도 모험가", status: "locked" },
    { id: "mb2", cityId: "mumbai", type: "photo", title: "타지마할 호텔 합성샷", description: "웅장한 타지마할 팰리스 호텔을 배경으로 AI 합성 사진을 만들어보세요", image: spotTokyoTower, stepsRequired: 1440000, emoji: "📸", reward: "궁전 여행자", status: "locked", aiComposite: true, aiPrompt: "뭄바이 타지마할 팰리스 호텔의 웅장한 정면과 아라비아해가 보이는 석양" },
    { id: "mb3", cityId: "mumbai", type: "writing", title: "볼리우드의 도시 체험기", description: "볼리우드 영화의 본고장에서 느낀 활기를 글로 남겨보세요", image: spotShibuya, stepsRequired: 1470000, emoji: "✍️", status: "locked" },
    { id: "mb4", cityId: "mumbai", type: "food", title: "버터 치킨 맛보기", description: "정통 인도식 버터 치킨을 맛보고 인증해보세요", image: foodRamen, stepsRequired: 1500000, emoji: "🍽️", reward: "카레 마스터", status: "locked" },
    { id: "mb5", cityId: "mumbai", type: "photo", title: "인도 전통 의상 합성", description: "사리를 입고 뭄바이 거리에서 AI 합성 사진을 만들어보세요", image: spotAsakusa, stepsRequired: 1530000, emoji: "📸", reward: "사리 패셔니스타", status: "locked", aiComposite: true, aiPrompt: "뭄바이 마린 드라이브 해안가 석양빛이 비치는 거리" },
    { id: "mb6", cityId: "mumbai", type: "writing", title: "인도 길거리 음식 도전기", description: "뭄바이 길거리 음식에 도전한 경험을 솔직하게 적어보세요", image: foodTakoyaki, stepsRequired: 1560000, emoji: "✍️", status: "locked" },
  ],

  // ============ 두바이 ============
  dubai: [
    { id: "db1", cityId: "dubai", type: "photo", title: "부르즈 할리파 인증샷", description: "세계 최고층 건물 앞에서 사진을 찍어보세요", image: spotTokyoTower, stepsRequired: 1600000, emoji: "📸", reward: "스카이 워커", status: "locked" },
    { id: "db2", cityId: "dubai", type: "photo", title: "사막 위의 나 합성", description: "끝없는 황금빛 사막 위에 서 있는 AI 합성 사진을 만들어보세요", image: spotShibuya, stepsRequired: 1640000, emoji: "📸", reward: "사막 탐험가", status: "locked", aiComposite: true, aiPrompt: "두바이 황금빛 사막의 모래 언덕 위 석양이 지는 드라마틱한 풍경" },
    { id: "db3", cityId: "dubai", type: "writing", title: "미래도시 두바이 탐방기", description: "사막 위에 세워진 미래도시 두바이의 첫인상을 글로 남겨보세요", image: spotTokyoTower, stepsRequired: 1670000, emoji: "✍️", status: "locked" },
    { id: "db4", cityId: "dubai", type: "food", title: "샤와르마 체험", description: "중동의 대표 음식 샤와르마를 맛보세요", image: foodRamen, stepsRequired: 1700000, emoji: "🍽️", status: "locked" },
    { id: "db5", cityId: "dubai", type: "photo", title: "팜 주메이라 합성샷", description: "야자수 모양 인공 섬 위에서 AI 합성 사진을 만들어보세요", image: spotAsakusa, stepsRequired: 1730000, emoji: "📸", reward: "럭셔리 트래블러", status: "locked", aiComposite: true, aiPrompt: "두바이 팜 주메이라 아틀란티스 호텔이 보이는 해변의 청록빛 바다" },
    { id: "db6", cityId: "dubai", type: "writing", title: "두바이 럭셔리 체험기", description: "세계에서 가장 호화로운 도시에서의 경험을 기록해보세요", image: spotShibuya, stepsRequired: 1760000, emoji: "✍️", reward: "럭셔리 작가", status: "locked" },
  ],

  // ============ 이스탄불 ============
  istanbul: [
    { id: "is1", cityId: "istanbul", type: "photo", title: "아야 소피아 인증샷", description: "천년의 역사를 간직한 아야 소피아에서 사진을 찍어보세요", image: spotGyeongbokgung, stepsRequired: 1800000, emoji: "📸", reward: "역사 탐험가", status: "locked" },
    { id: "is2", cityId: "istanbul", type: "photo", title: "블루 모스크 합성 사진", description: "블루 모스크의 장엄한 내부를 배경으로 AI 합성 사진을 만들어보세요", image: spotAsakusa, stepsRequired: 1835000, emoji: "📸", reward: "모스크 순례자", status: "locked", aiComposite: true, aiPrompt: "이스탄불 블루 모스크 내부의 푸른 이즈닉 타일과 황금 돔 천장" },
    { id: "is3", cityId: "istanbul", type: "writing", title: "동서양의 교차점에서", description: "아시아와 유럽을 잇는 이스탄불에서 느낀 문화적 교차를 글로 남겨보세요", image: spotShibuya, stepsRequired: 1870000, emoji: "✍️", status: "locked" },
    { id: "is4", cityId: "istanbul", type: "food", title: "케밥 먹기", description: "본고장 터키 케밥을 맛보고 인증해보세요", image: foodRamen, stepsRequired: 1900000, emoji: "🍽️", reward: "케밥 감별사", status: "locked" },
    { id: "is5", cityId: "istanbul", type: "photo", title: "보스포루스 해협 합성", description: "보스포루스 해협 크루즈를 배경으로 AI 합성 사진을 만들어보세요", image: spotTokyoTower, stepsRequired: 1930000, emoji: "📸", status: "locked", aiComposite: true, aiPrompt: "이스탄불 보스포루스 해협 위 페리에서 본 석양과 모스크 실루엣" },
    { id: "is6", cityId: "istanbul", type: "writing", title: "그랜드 바자르 쇼핑 일기", description: "세계에서 가장 오래된 시장 그랜드 바자르에서의 흥정 경험을 적어보세요", image: spotAsakusa, stepsRequired: 1960000, emoji: "✍️", reward: "흥정왕", status: "locked" },
  ],

  // ============ 파리 ============
  paris: [
    { id: "p1", cityId: "paris", type: "photo", title: "에펠탑 앞에서 사진 찍기", description: "파리의 상징 앞에서 인증샷을 남겨보세요", image: spotTokyoTower, stepsRequired: 2000000, emoji: "📸", reward: "파리지앵", status: "locked" },
    { id: "p2", cityId: "paris", type: "food", title: "크루아상 맛보기", description: "진짜 프랑스 크루아상을 체험하세요", image: foodTempura, stepsRequired: 2060000, emoji: "🍽️", status: "locked" },
    { id: "p3", cityId: "paris", type: "explore", title: "루브르 박물관 탐방", description: "세계 최대 박물관을 걸어보세요", image: spotGyeongbokgung, stepsRequired: 2120000, emoji: "🗺️", status: "locked" },
    { id: "p4", cityId: "paris", type: "writing", title: "파리에서 보내는 연애편지", description: "사랑의 도시에서 특별한 편지를 써보세요", image: spotAsakusa, stepsRequired: 2160000, emoji: "✍️", reward: "로맨티스트", status: "locked" },
    { id: "p5", cityId: "paris", type: "photo", title: "에펠탑 야경 합성", description: "반짝이는 에펠탑 야경 앞에서 AI 합성 사진을 만들어보세요", image: spotTokyoTower, stepsRequired: 2030000, emoji: "📸", reward: "에펠탑 러버", status: "locked", aiComposite: true, aiPrompt: "파리 에펠탑이 반짝이는 야경, 트로카데로 광장에서 본 로맨틱한 풍경" },
    { id: "p6", cityId: "paris", type: "writing", title: "프랑스 미술관 감상기", description: "오르세, 루브르 등 파리 미술관에서 본 작품에 대한 감상을 남겨보세요", image: spotGyeongbokgung, stepsRequired: 2140000, emoji: "✍️", status: "locked" },
    { id: "p7", cityId: "paris", type: "photo", title: "개선문 앞 인증", description: "샹젤리제 거리 끝 개선문에서 사진을 업로드해보세요", image: spotShibuya, stepsRequired: 2090000, emoji: "📸", status: "locked" },
  ],

  // ============ 런던 ============
  london: [
    { id: "ld1", cityId: "london", type: "photo", title: "빅 벤 인증샷", description: "런던의 상징 빅 벤 시계탑에서 사진을 찍어보세요", image: spotTokyoTower, stepsRequired: 2200000, emoji: "📸", reward: "런던 탐험가", status: "locked" },
    { id: "ld2", cityId: "london", type: "photo", title: "타워 브릿지 합성 사진", description: "타워 브릿지 위에서 템스강을 내려다보는 AI 합성 사진을 만들어보세요", image: spotShibuya, stepsRequired: 2235000, emoji: "📸", reward: "브릿지 워커", status: "locked", aiComposite: true, aiPrompt: "런던 타워 브릿지 위에서 내려다보는 템스강과 런던 시티 스카이라인" },
    { id: "ld3", cityId: "london", type: "writing", title: "영국 왕실 문화 체험기", description: "버킹엄 궁전 근위병 교대식을 보고 느낀 점을 적어보세요", image: spotGyeongbokgung, stepsRequired: 2270000, emoji: "✍️", status: "locked" },
    { id: "ld4", cityId: "london", type: "food", title: "피쉬 앤 칩스 도전", description: "정통 영국식 피쉬 앤 칩스를 맛보세요", image: foodTempura, stepsRequired: 2300000, emoji: "🍽️", reward: "영국 미식가", status: "locked" },
    { id: "ld5", cityId: "london", type: "photo", title: "해리포터 플랫폼 합성", description: "킹스 크로스역 9와 3/4 플랫폼에서 AI 합성 사진을 만들어보세요", image: spotAsakusa, stepsRequired: 2330000, emoji: "📸", reward: "마법사 배지", status: "locked", aiComposite: true, aiPrompt: "런던 킹스 크로스역 9와 3/4 플랫폼 벽돌벽 앞 마법의 안개" },
    { id: "ld6", cityId: "london", type: "writing", title: "대영박물관 감상문", description: "세계 3대 박물관 대영박물관에서 가장 인상 깊었던 전시를 글로 남겨보세요", image: spotGyeongbokgung, stepsRequired: 2360000, emoji: "✍️", reward: "역사 기록가", status: "locked" },
    { id: "ld7", cityId: "london", type: "photo", title: "런던 아이 인증", description: "템스강변 대관람차 런던 아이에서 찍은 사진을 업로드하세요", image: spotTokyoTower, stepsRequired: 2250000, emoji: "📸", status: "locked" },
  ],

  // ============ 뉴욕 ============
  newyork: [
    { id: "ny1", cityId: "newyork", type: "photo", title: "자유의 여신상 인증", description: "자유의 상징 앞에서 사진을 남겨보세요", image: spotTokyoTower, stepsRequired: 2400000, emoji: "📸", status: "locked" },
    { id: "ny2", cityId: "newyork", type: "food", title: "뉴욕 피자 한 조각", description: "정통 뉴욕 스타일 피자를 맛보세요", image: foodSushi, stepsRequired: 2480000, emoji: "🍽️", status: "locked" },
    { id: "ny3", cityId: "newyork", type: "explore", title: "센트럴 파크 산책", description: "뉴욕의 허파를 걸어보세요", image: spotGyeongbokgung, stepsRequired: 2550000, emoji: "🗺️", status: "locked" },
    { id: "ny4", cityId: "newyork", type: "photo", title: "타임스 스퀘어 합성샷", description: "타임스 스퀘어의 화려한 네온사인 속에 서 있는 AI 합성 사진을 만들어보세요", image: spotShibuya, stepsRequired: 2440000, emoji: "📸", reward: "빅 애플 러버", status: "locked", aiComposite: true, aiPrompt: "뉴욕 타임스 스퀘어의 수백 개 LED 광고판이 빛나는 밤거리" },
    { id: "ny5", cityId: "newyork", type: "writing", title: "브로드웨이 뮤지컬 감상기", description: "브로드웨이에서 관람한 뮤지컬에 대한 감상을 남겨보세요", image: spotAsakusa, stepsRequired: 2500000, emoji: "✍️", status: "locked" },
    { id: "ny6", cityId: "newyork", type: "photo", title: "브루클린 브릿지 합성", description: "브루클린 브릿지를 걸으며 맨해튼 스카이라인과 AI 합성 사진을 만들어보세요", image: spotTokyoTower, stepsRequired: 2530000, emoji: "📸", reward: "뉴요커", status: "locked", aiComposite: true, aiPrompt: "뉴욕 브루클린 브릿지 보행로에서 본 맨해튼 스카이라인 석양" },
    { id: "ny7", cityId: "newyork", type: "writing", title: "뉴욕의 다양성 에세이", description: "세계의 수도 뉴욕에서 만난 다양한 문화와 사람들에 대해 써보세요", image: spotShibuya, stepsRequired: 2570000, emoji: "✍️", reward: "세계시민 배지", status: "locked" },
  ],

  // ============ 리우데자네이루 ============
  rio: [
    { id: "ri1", cityId: "rio", type: "photo", title: "코르코바도 산 인증샷", description: "거대한 예수상 아래에서 사진을 찍어보세요", image: spotTokyoTower, stepsRequired: 2600000, emoji: "📸", reward: "리우 모험가", status: "locked" },
    { id: "ri2", cityId: "rio", type: "photo", title: "예수상 앞 합성 사진", description: "코르코바도 예수상이 두 팔 벌린 모습 아래 AI 합성 사진을 만들어보세요", image: spotGyeongbokgung, stepsRequired: 2640000, emoji: "📸", reward: "예수상 배지", status: "locked", aiComposite: true, aiPrompt: "리우데자네이루 코르코바도 산 정상 예수상 앞 구름 위 파노라마 전경" },
    { id: "ri3", cityId: "rio", type: "writing", title: "삼바의 리듬 속으로", description: "브라질 삼바 문화를 체험하고 느낀 점을 글로 남겨보세요", image: spotShibuya, stepsRequired: 2670000, emoji: "✍️", status: "locked" },
    { id: "ri4", cityId: "rio", type: "food", title: "슈하스코 도전", description: "브라질식 바비큐 슈하스코를 맛보세요", image: foodRamen, stepsRequired: 2700000, emoji: "🍽️", reward: "슈하스코 마스터", status: "locked" },
    { id: "ri5", cityId: "rio", type: "photo", title: "코파카바나 해변 합성", description: "코파카바나 해변의 하얀 모래사장 위에서 AI 합성 사진을 만들어보세요", image: spotShibuya, stepsRequired: 2730000, emoji: "📸", reward: "해변의 왕", status: "locked", aiComposite: true, aiPrompt: "리우데자네이루 코파카바나 해변의 하얀 모래와 슈거로프 산이 보이는 석양" },
    { id: "ri6", cityId: "rio", type: "writing", title: "지구 한바퀴 완주 소감", description: "서울에서 시작해 리우까지 도착한 지구 한바퀴 여행의 소감을 남겨보세요", image: spotTokyoTower, stepsRequired: 2780000, emoji: "✍️", reward: "지구 한바퀴 완주자", status: "locked" },
    { id: "ri7", cityId: "rio", type: "photo", title: "카니발 의상 합성", description: "화려한 리우 카니발 의상을 입은 AI 합성 사진을 만들어보세요", image: spotAsakusa, stepsRequired: 2760000, emoji: "📸", reward: "카니발 스타", status: "locked", aiComposite: true, aiPrompt: "리우 카니발 퍼레이드의 화려한 깃털과 반짝이는 장식들이 가득한 무대" },
  ],
};

export function getMissionProgress(cityId: string): { completed: number; total: number } {
  const missions = cityMissions[cityId] || [];
  const completed = missions.filter((m) => m.status === "completed").length;
  return { completed, total: missions.length };
}

export function getCityMissionStats(cityId: string) {
  const missions = cityMissions[cityId] || [];
  return {
    total: missions.length,
    completed: missions.filter((m) => m.status === "completed").length,
    available: missions.filter((m) => m.status === "available").length,
    locked: missions.filter((m) => m.status === "locked").length,
  };
}
