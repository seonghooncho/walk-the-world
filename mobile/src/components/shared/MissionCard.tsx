import { Image } from "expo-image";
import { Camera, Check, ChevronRight, Compass, Lock, PenLine, Sparkles, Users, Utensils } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/src/components/common/AppText";
import { SurfaceCard } from "@/src/components/common/SurfaceCard";
import type { UiMission, UiMissionType } from "@/src/lib/city-utils";
import { palette, radius, spacing } from "@/src/lib/theme";

const typeConfig: Record<UiMissionType, { icon: typeof Camera; bg: string; fg: string }> = {
  photo: { icon: Camera, bg: palette.ocean, fg: palette.white },
  food: { icon: Utensils, bg: palette.earth, fg: palette.white },
  writing: { icon: PenLine, bg: palette.primary, fg: palette.white },
  explore: { icon: Compass, bg: palette.secondaryForeground, fg: palette.white },
  social: { icon: Users, bg: palette.cityTeal, fg: palette.white },
};

export function MissionCard({ mission, onPress }: { mission: UiMission; onPress?: (mission: UiMission) => void }) {
  const config = typeConfig[mission.type];
  const Icon = config.icon;
  const isLocked = mission.status === "locked";
  const isCompleted = mission.status === "completed";

  return (
    <Pressable disabled={isLocked} onPress={() => !isLocked && onPress?.(mission)} style={({ pressed }) => [pressed && { opacity: 0.96 }]}>
      <SurfaceCard style={[styles.card, isLocked && styles.locked]}>
        <View style={styles.imageWrap}>
          <Image source={mission.image} style={styles.image} contentFit="cover" />
          <View style={styles.imageOverlay} />
          <View style={[styles.typeChip, { backgroundColor: config.bg }]}>
            <Icon size={12} color={config.fg} />
          </View>
          {mission.aiComposite ? (
            <View style={styles.aiChip}>
              <Sparkles size={10} color={palette.white} />
              <AppText variant="captionBold" tone="inverse">
                AI
              </AppText>
            </View>
          ) : null}
          <View style={styles.statusWrap}>
            {isCompleted ? (
              <View style={[styles.status, { backgroundColor: palette.success }]}>
                <Check size={12} color={palette.white} />
              </View>
            ) : isLocked ? (
              <View style={[styles.status, { backgroundColor: "rgba(255,255,255,0.72)" }]}>
                <Lock size={12} color={palette.mutedForeground} />
              </View>
            ) : (
              <View style={[styles.dot, { backgroundColor: palette.primary }]} />
            )}
          </View>
          <View style={styles.titleWrap}>
            <AppText variant="captionBold" tone="inverse">
              {mission.emoji} {mission.title}
            </AppText>
          </View>
        </View>
        <View style={styles.body}>
          <AppText variant="caption" numberOfLines={1}>
            {mission.description}
          </AppText>
          <View style={styles.footer}>
            {mission.reward ? (
              <AppText variant="captionBold" tone="primary" style={{ flex: 1 }}>
                🏅 {mission.reward}
              </AppText>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            {!isLocked && !isCompleted ? (
              <View style={styles.cta}>
                <AppText variant="caption">도전</AppText>
                <ChevronRight size={12} color={palette.mutedForeground} />
              </View>
            ) : null}
            {isCompleted ? <AppText variant="captionBold" tone="success">완료</AppText> : null}
          </View>
        </View>
      </SurfaceCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
  },
  locked: {
    opacity: 0.42,
  },
  imageWrap: {
    height: 112,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(15,23,42,0.2)",
  },
  typeChip: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  aiChip: {
    position: "absolute",
    top: 8,
    left: 36,
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "rgba(15,23,42,0.72)",
    alignItems: "center",
  },
  statusWrap: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  status: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
  },
  titleWrap: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
  },
  body: {
    padding: spacing.md,
    gap: 6,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
});
