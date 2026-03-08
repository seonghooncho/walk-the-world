// Spot image mappings for cities
import spotTokyoTower from "@/assets/spot-tokyo-tower.jpg";
import spotShibuya from "@/assets/spot-shibuya.jpg";
import spotAsakusa from "@/assets/spot-asakusa.jpg";
import spotGyeongbokgung from "@/assets/spot-gyeongbokgung.jpg";
import foodRamen from "@/assets/food-ramen.jpg";
import foodSushi from "@/assets/food-sushi.jpg";
import foodTakoyaki from "@/assets/food-takoyaki.jpg";
import foodTempura from "@/assets/food-tempura.jpg";

export interface SpotImageData {
  name: string;
  image: string;
  subtitle?: string;
}

// Maps city landmarks to images (fallback to first available)
export const cityLandmarkImages: Record<string, SpotImageData[]> = {
  seoul: [
    { name: "경복궁", image: spotGyeongbokgung, subtitle: "조선 왕궁" },
    { name: "남산타워", image: spotTokyoTower, subtitle: "서울 전망" },
    { name: "명동", image: spotShibuya, subtitle: "쇼핑 거리" },
    { name: "홍대", image: spotAsakusa, subtitle: "예술의 거리" },
  ],
  tokyo: [
    { name: "도쿄타워", image: spotTokyoTower, subtitle: "333m 랜드마크" },
    { name: "시부야 교차로", image: spotShibuya, subtitle: "세계 최대 교차로" },
    { name: "아사쿠사", image: spotAsakusa, subtitle: "센소지 사원" },
    { name: "아키하바라", image: spotGyeongbokgung, subtitle: "서브컬처 성지" },
  ],
};

export const cityFoodImages: Record<string, SpotImageData[]> = {
  seoul: [
    { name: "비빔밥", image: foodRamen, subtitle: "전통 한식" },
    { name: "김치찌개", image: foodSushi, subtitle: "매콤한 국물" },
    { name: "떡볶이", image: foodTakoyaki, subtitle: "매콤 달콤" },
    { name: "삼겹살", image: foodTempura, subtitle: "구워 먹는 고기" },
  ],
  tokyo: [
    { name: "라멘", image: foodRamen, subtitle: "진한 육수" },
    { name: "스시", image: foodSushi, subtitle: "신선한 회" },
    { name: "타코야키", image: foodTakoyaki, subtitle: "문어 볼" },
    { name: "텐푸라", image: foodTempura, subtitle: "바삭한 튀김" },
  ],
};
