import type { ImageSourcePropType } from "react-native";
import spotTokyoTower from "@/src/assets/images/spot-tokyo-tower.jpg";
import spotShibuya from "@/src/assets/images/spot-shibuya.jpg";
import spotAsakusa from "@/src/assets/images/spot-asakusa.jpg";
import spotGyeongbokgung from "@/src/assets/images/spot-gyeongbokgung.jpg";
import foodRamen from "@/src/assets/images/food-ramen.jpg";
import foodSushi from "@/src/assets/images/food-sushi.jpg";
import foodTakoyaki from "@/src/assets/images/food-takoyaki.jpg";
import foodTempura from "@/src/assets/images/food-tempura.jpg";

export interface SpotImageItem {
  name: string;
  image: ImageSourcePropType;
  subtitle?: string;
}

export const cityLandmarkImages: Record<string, SpotImageItem[]> = {
  seoul: [
    { name: "경복궁", image: spotGyeongbokgung, subtitle: "왕실의 품격을 간직한 고궁" },
    { name: "남산타워", image: spotTokyoTower, subtitle: "서울의 전경이 한눈에 보이는 전망대" },
  ],
  tokyo: [
    { name: "도쿄타워", image: spotTokyoTower, subtitle: "도쿄를 대표하는 랜드마크" },
    { name: "시부야", image: spotShibuya, subtitle: "끝없이 움직이는 도쿄의 심장" },
    { name: "아사쿠사", image: spotAsakusa, subtitle: "전통과 여행 감성이 남아있는 거리" },
  ],
};

export const cityFoodImages: Record<string, SpotImageItem[]> = {
  seoul: [
    { name: "비빔밥", image: foodRamen, subtitle: "다채로운 맛이 공존하는 한 그릇" },
    { name: "떡볶이", image: foodTakoyaki, subtitle: "매콤달콤한 길거리 대표 간식" },
  ],
  tokyo: [
    { name: "라멘", image: foodRamen, subtitle: "진한 육수와 면의 조화" },
    { name: "스시", image: foodSushi, subtitle: "신선한 재료로 완성한 일본의 정수" },
    { name: "타코야키", image: foodTakoyaki, subtitle: "뜨겁고 부드러운 길거리 간식" },
    { name: "텐푸라", image: foodTempura, subtitle: "바삭하게 튀겨낸 장인의 한 접시" },
  ],
};
