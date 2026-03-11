import { ChevronDown, Lock, MapPin, Target } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppText } from "@/src/components/common/AppText";
import { SurfaceCard } from "@/src/components/common/SurfaceCard";
import { MissionCard } from "@/src/components/shared/MissionCard";
import type { UiCity, UiMission } from "@/src/lib/city-utils";
import { formatSteps } from "@/src/lib/city-utils";
import { gradients, palette, radius, spacing } from "@/src/lib/theme";

export function CityCard({
  city,
  missions,
  isUnlocked,
  isCurrent,
  expanded,
  onToggle,
  onMissionPress,
}: {
  city: UiCity;
  missions: UiMission[];
  isUnlocked: boolean;
  isCurrent: boolean;
  expanded: boolean;
  onToggle: () => void;
  onMissionPress?: (mission: UiMission) => void;
}) {
  const completed = missions.filter((mission) => mission.status === "completed").length;
  const headerContent = (
    <>
      <View style={[styles.badge, !isUnlocked && styles.badgeLocked]}>
        {isUnlocked ? <AppText variant="headline">{city.countryFlag}</AppText> : <Lock size={16} color={palette.mutedForeground} />}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={styles.row}>
          <AppText variant="bodyBold" tone={isCurrent ? "inverse" : "default"}>
            {city.name}
          </AppText>
          {isCurrent ? <MapPin size={14} color={palette.white} /> : null}
        </View>
        <AppText variant="caption" tone={isCurrent ? "inverse" : "muted"}>
          {city.country}
          {isUnlocked && missions.length > 0 ? ` • 미션 ${completed}/${missions.length}` : ""}
        </AppText>
      </View>
      <View style={styles.row}>
        <AppText variant="caption" tone={isCurrent ? "inverse" : "muted"}>
          {formatSteps(city.stepsRequired)} 보
        </AppText>
        {isUnlocked && missions.length > 0 ? (
          <ChevronDown size={16} color={isCurrent ? palette.white : palette.mutedForeground} style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }} />
        ) : null}
      </View>
    </>
  );

  return (
    <View style={{ gap: 0 }}>
      <Pressable onPress={() => isUnlocked && missions.length > 0 && onToggle()}>
        {isCurrent ? (
          <LinearGradient colors={gradients.hero} style={styles.header}>
            {headerContent}
          </LinearGradient>
        ) : (
          <View style={[styles.header, styles.headerCard]}>
            {headerContent}
          </View>
        )}
      </Pressable>

      {expanded && isUnlocked ? (
        <SurfaceCard style={styles.expanded}>
          <View style={styles.progressRow}>
            <Target size={14} color={palette.primary} />
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: missions.length ? `${(completed / missions.length) * 100}%` : "0%" }]} />
            </View>
            <AppText variant="captionBold">{completed}/{missions.length}</AppText>
          </View>
          <View style={styles.grid}>
            {missions.map((mission) => (
              <View key={mission.id} style={{ width: "48.5%" }}>
                <MissionCard mission={mission} onPress={onMissionPress} />
              </View>
            ))}
          </View>
        </SurfaceCard>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 76,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  headerCard: {
    backgroundColor: palette.card,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.muted,
  },
  badgeLocked: {
    backgroundColor: palette.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  expanded: {
    marginTop: 2,
    padding: spacing.lg,
    gap: spacing.md,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: palette.muted,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: palette.primary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
});
