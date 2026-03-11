import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { Home, Map, MessageSquare, User, Users } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/src/components/common/AppText";
import { palette, radius, screenMaxWidth } from "@/src/lib/theme";

const tabs = [
  { key: "index", label: "홈", href: "/", icon: Home },
  { key: "map", label: "노선도", href: "/map", icon: Map },
  { key: "city", label: "도시", href: "/city", icon: Users },
  { key: "feed", label: "채팅", href: "/feed", icon: MessageSquare },
  { key: "profile", label: "프로필", href: "/profile", icon: User },
] as const;

export function BottomTabBar({ state }: BottomTabBarProps) {
  return (
    <View style={styles.wrap}>
      <BlurView intensity={24} tint="light" style={styles.blur}>
        {tabs.map((tab) => {
          const active = state.routes[state.index]?.name === tab.key;
          const Icon = tab.icon;

          return (
            <Pressable key={tab.key} onPress={() => router.replace(tab.href)} style={styles.tab}>
              {active ? <View style={styles.indicator} /> : null}
              <Icon size={18} color={active ? palette.foreground : palette.mutedForeground} strokeWidth={active ? 2.25 : 1.8} />
              <AppText variant="caption" tone={active ? "default" : "muted"} style={{ fontFamily: active ? undefined : undefined }}>
                {tab.label}
              </AppText>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  blur: {
    width: "100%",
    maxWidth: screenMaxWidth,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 8,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(15,23,42,0.08)",
    backgroundColor: "rgba(255,255,255,0.84)",
  },
  tab: {
    minWidth: 60,
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  indicator: {
    position: "absolute",
    top: -8,
    width: 20,
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
  },
});
