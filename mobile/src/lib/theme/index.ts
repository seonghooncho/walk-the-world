import { Platform, TextStyle, ViewStyle } from "react-native";

export const palette = {
  background: "hsl(0 0% 98%)",
  foreground: "hsl(240 10% 10%)",
  card: "hsl(0 0% 100%)",
  cardForeground: "hsl(240 10% 10%)",
  primary: "hsl(24 80% 50%)",
  primaryForeground: "hsl(0 0% 100%)",
  secondary: "hsl(240 6% 95%)",
  secondaryForeground: "hsl(240 10% 20%)",
  muted: "hsl(240 6% 94%)",
  mutedForeground: "hsl(240 5% 46%)",
  accent: "hsl(24 80% 50%)",
  accentForeground: "hsl(0 0% 100%)",
  destructive: "hsl(0 72% 51%)",
  destructiveForeground: "hsl(0 0% 100%)",
  border: "hsl(240 6% 92%)",
  input: "hsl(240 6% 92%)",
  cityTeal: "hsl(174 42% 50%)",
  gold: "hsl(40 70% 50%)",
  ocean: "hsl(210 55% 52%)",
  earth: "hsl(25 30% 42%)",
  success: "hsl(152 45% 48%)",
  overlay: "rgba(15, 23, 42, 0.5)",
  black: "#000000",
  white: "#ffffff",
} as const;

export const gradients = {
  hero: ["hsl(24 80% 50%)", "hsl(16 65% 52%)"],
  ocean: ["hsl(210 55% 52%)", "hsl(174 42% 50%)"],
  earth: ["hsl(25 30% 42%)", "hsl(24 80% 50%)"],
  night: ["hsl(240 12% 14%)", "hsl(250 16% 20%)"],
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
} as const;

export const typography = {
  display: "Outfit_700Bold",
  displaySemi: "Outfit_600SemiBold",
  body: "SpaceGrotesk_400Regular",
  bodyMedium: "SpaceGrotesk_500Medium",
  bodyBold: "SpaceGrotesk_700Bold",
} as const;

export const textVariants: Record<
  "display" | "title" | "headline" | "body" | "bodyBold" | "caption" | "captionBold",
  TextStyle
> = {
  display: { fontFamily: typography.display, fontSize: 30, lineHeight: 36, color: palette.foreground },
  title: { fontFamily: typography.display, fontSize: 24, lineHeight: 30, color: palette.foreground },
  headline: { fontFamily: typography.displaySemi, fontSize: 18, lineHeight: 24, color: palette.foreground },
  body: { fontFamily: typography.body, fontSize: 14, lineHeight: 20, color: palette.foreground },
  bodyBold: { fontFamily: typography.bodyBold, fontSize: 14, lineHeight: 20, color: palette.foreground },
  caption: { fontFamily: typography.body, fontSize: 12, lineHeight: 16, color: palette.mutedForeground },
  captionBold: { fontFamily: typography.bodyBold, fontSize: 12, lineHeight: 16, color: palette.foreground },
};

export const shadows = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 3,
    },
    android: { elevation: 2 },
    default: {},
  }),
  elevated: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 16,
    },
    android: { elevation: 6 },
    default: {},
  }),
} as const;

export const screenMaxWidth = 480;
