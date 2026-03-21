import { router } from "expo-router";
import { AppScreen } from "@/src/components/common/AppScreen";
import { AppText } from "@/src/components/common/AppText";
import { PrimaryButton } from "@/src/components/common/PrimaryButton";

export default function NotFoundScreen() {
  return (
    <AppScreen centerContent contentContainerStyle={{ paddingHorizontal: 24 }}>
      <AppText variant="title" style={{ marginBottom: 8 }}>
        페이지를 찾을 수 없어요
      </AppText>
      <AppText tone="muted" style={{ textAlign: "center", marginBottom: 20 }}>
        이동 경로가 잘못되었거나 페이지가 삭제되었을 수 있습니다.
      </AppText>
      <PrimaryButton title="홈으로 돌아가기" onPress={() => router.replace("/")} />
    </AppScreen>
  );
}
