import * as Linking from "expo-linking";
import QRCode from "react-native-qrcode-svg";
import { StyleSheet, View } from "react-native";
import { BottomSheet } from "@/src/components/shared/BottomSheet";
import { AppText } from "@/src/components/common/AppText";
import { useAuth } from "@/src/contexts/AuthContext";
import { palette, spacing } from "@/src/lib/theme";

export function QRCodeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const url = Linking.createURL(`/add-friend/${user.id}`);

  return (
    <BottomSheet open={open} onClose={onClose}>
      <View style={styles.content}>
        <AppText variant="title">내 QR코드</AppText>
        <AppText tone="muted">QR을 스캔하면 바로 친구 추가 화면으로 이동합니다.</AppText>
        <View style={styles.qrWrap}>
          <QRCode value={url} size={220} color={palette.foreground} backgroundColor={palette.card} />
        </View>
        <AppText variant="caption" style={{ textAlign: "center" }}>{url}</AppText>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing["2xl"],
    gap: spacing.lg,
    alignItems: "center",
  },
  qrWrap: {
    backgroundColor: palette.card,
    padding: 18,
    borderRadius: 22,
  },
});
