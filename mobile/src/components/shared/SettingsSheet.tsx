import { Pressable, StyleSheet, View } from "react-native";
import { BottomSheet } from "@/src/components/shared/BottomSheet";
import { AppText } from "@/src/components/common/AppText";
import { spacing } from "@/src/lib/theme";

export function SettingsSheet({
  open,
  onClose,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <View style={styles.content}>
        <AppText variant="title">설정</AppText>
        <Pressable style={styles.row} onPress={onClose}>
          <AppText variant="bodyBold">알림 설정</AppText>
        </Pressable>
        <Pressable style={styles.row} onPress={onClose}>
          <AppText variant="bodyBold">도움말</AppText>
        </Pressable>
        <Pressable style={styles.row} onPress={onLogout}>
          <AppText variant="bodyBold">로그아웃</AppText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing["2xl"],
    gap: spacing.sm,
  },
  row: {
    minHeight: 52,
    justifyContent: "center",
  },
});
