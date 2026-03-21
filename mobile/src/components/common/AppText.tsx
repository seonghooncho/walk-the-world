import { Text, type TextProps, type TextStyle } from "react-native";
import { palette, textVariants } from "@/src/lib/theme";

type Variant = keyof typeof textVariants;
type Tone = "default" | "muted" | "inverse" | "primary" | "accent" | "success" | "danger";

interface AppTextProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
}

const toneColor: Record<Tone, string> = {
  default: palette.foreground,
  muted: palette.mutedForeground,
  inverse: palette.white,
  primary: palette.primary,
  accent: palette.accent,
  success: palette.success,
  danger: palette.destructive,
};

export function AppText({ variant = "body", tone = "default", style, ...props }: AppTextProps) {
  const textStyle = textVariants[variant] as TextStyle;
  return <Text {...props} style={[textStyle, { color: toneColor[tone] }, style]} />;
}
