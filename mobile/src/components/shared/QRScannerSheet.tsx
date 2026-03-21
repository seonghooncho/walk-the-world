import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { BottomSheet } from "@/src/components/shared/BottomSheet";
import { AppText } from "@/src/components/common/AppText";
import { PrimaryButton } from "@/src/components/common/PrimaryButton";
import { spacing } from "@/src/lib/theme";
import { useState } from "react";

export function QRScannerSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [handled, setHandled] = useState(false);

  const parseUserId = (value: string) => {
    const match = value.match(/\/add-friend\/(\d+)$/);
    return match ? Number(match[1]) : null;
  };

  if (!permission?.granted) {
    return (
      <BottomSheet open={open} onClose={onClose}>
        <View style={styles.content}>
          <AppText variant="title">카메라 권한이 필요합니다</AppText>
          <PrimaryButton title="권한 허용하기" onPress={() => void requestPermission()} />
        </View>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      open={open}
      onClose={() => {
        setHandled(false);
        onClose();
      }}
    >
      <View style={styles.content}>
        <AppText variant="title">QR 스캔</AppText>
        <AppText tone="muted">친구의 QR 코드를 카메라 안에 맞춰주세요.</AppText>
        <View style={styles.cameraWrap}>
          <CameraView
            style={StyleSheet.absoluteFill}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={(event) => {
              if (handled) return;
              const userId = parseUserId(event.data);
              if (!userId) return;
              setHandled(true);
              onClose();
              router.push(`/add-friend/${userId}`);
            }}
          />
        </View>
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
  cameraWrap: {
    height: 320,
    borderRadius: 22,
    overflow: "hidden",
  },
});
