import { View, StyleSheet, Image } from "react-native";
import { AppText } from "@/src/components/common/AppText";
import { palette, radius } from "@/src/lib/theme";

const sizeMap = {
  sm: 36,
  md: 46,
  lg: 72,
} as const;

export function UserAvatar({
  name,
  avatar,
  size = "md",
  showOnline = false,
}: {
  name: string;
  avatar?: string | null;
  size?: keyof typeof sizeMap;
  showOnline?: boolean;
}) {
  const boxSize = sizeMap[size];
  const initials = name.slice(0, 1);

  return (
    <View style={{ position: "relative" }}>
      {avatar ? (
        <Image source={{ uri: avatar }} style={{ width: boxSize, height: boxSize, borderRadius: boxSize / 2 }} />
      ) : (
        <View style={[styles.fallback, { width: boxSize, height: boxSize, borderRadius: boxSize / 2 }]}>
          <AppText variant={size === "lg" ? "headline" : "bodyBold"} tone="inverse">
            {initials}
          </AppText>
        </View>
      )}
      {showOnline ? <View style={[styles.online, { left: boxSize - 16, top: boxSize - 16 }]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: palette.secondaryForeground,
    alignItems: "center",
    justifyContent: "center",
  },
  online: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: palette.success,
    borderWidth: 2,
    borderColor: palette.card,
  },
});
