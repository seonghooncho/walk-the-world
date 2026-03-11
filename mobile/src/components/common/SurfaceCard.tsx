import { View, StyleSheet, type ViewProps } from "react-native";
import { palette, radius, shadows } from "@/src/lib/theme";

export function SurfaceCard({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.card, style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    ...shadows.card,
  },
});
