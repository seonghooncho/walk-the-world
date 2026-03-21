import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { BottomSheet } from "@/src/components/shared/BottomSheet";
import { AppText } from "@/src/components/common/AppText";
import { PrimaryButton } from "@/src/components/common/PrimaryButton";
import { useAuth } from "@/src/contexts/AuthContext";
import { spacing } from "@/src/lib/theme";

export function LoginPromptSheet() {
  const { showLoginPrompt, dismissLoginPrompt } = useAuth();

  return (
    <BottomSheet open={showLoginPrompt} onClose={dismissLoginPrompt}>
      <View style={styles.content}>
        <AppText variant="title">로그인이 필요합니다</AppText>
        <AppText tone="muted">이 기능은 회원 상태와 연결되어 있어 로그인 후 이용할 수 있습니다.</AppText>
        <PrimaryButton
          title="로그인하러 가기"
          onPress={() => {
            dismissLoginPrompt();
            router.push("/login");
          }}
        />
        <Pressable onPress={dismissLoginPrompt}>
          <View style={styles.cancel}>
            <AppText variant="bodyBold">나중에</AppText>
          </View>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing["2xl"],
    gap: spacing.lg,
  },
  cancel: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
});
