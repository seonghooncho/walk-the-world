import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppText } from "@/src/components/common/AppText";
import { gradients, palette, radius } from "@/src/lib/theme";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({ title, onPress, disabled, loading, style }: PrimaryButtonProps) {
  return (
    <Pressable disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [style, pressed && { opacity: 0.92 }]}>
      <LinearGradient colors={gradients.hero} style={[styles.button, (disabled || loading) && styles.disabled]}>
        {loading ? <ActivityIndicator color={palette.primaryForeground} /> : <AppText variant="bodyBold" tone="inverse">{title}</AppText>}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  disabled: {
    opacity: 0.45,
  },
});
