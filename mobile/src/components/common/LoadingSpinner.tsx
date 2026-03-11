import { ActivityIndicator, View } from "react-native";
import { palette } from "@/src/lib/theme";

export function LoadingSpinner({ size = "small" }: { size?: "small" | "large" }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size={size} color={palette.primary} />
    </View>
  );
}
