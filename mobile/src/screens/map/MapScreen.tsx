import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import heroMapImg from "@/src/assets/images/hero-map.jpg";
import { AppScreen } from "@/src/components/common/AppScreen";
import { AppText } from "@/src/components/common/AppText";
import { LoadingSpinner } from "@/src/components/common/LoadingSpinner";
import { CityCard } from "@/src/components/shared/CityCard";
import { MissionDetailSheet } from "@/src/components/shared/MissionDetailSheet";
import { useAuth } from "@/src/contexts/AuthContext";
import { useBadges, useStepInfo } from "@/src/hooks/useApi";
import { buildGuestPreviewStepInfo, buildStaticMissionMap, findCityById, getCompletedMissionIds, getStaticCities, GUEST_PREVIEW_TOTAL_STEPS, type UiMission } from "@/src/lib/city-utils";
import { palette, spacing } from "@/src/lib/theme";

export function MapScreen() {
  const { user, isLoggedIn, isReady } = useAuth();
  const { data: stepInfo, isLoading: isStepLoading } = useStepInfo();
  const { data: badgesResponse, isLoading: isBadgesLoading } = useBadges();
  const [selectedMission, setSelectedMission] = useState<UiMission | null>(null);
  const [expandedCityId, setExpandedCityId] = useState<string | null>(null);
  const cities = useMemo(() => getStaticCities(), []);
  const guestStepInfo = useMemo(() => buildGuestPreviewStepInfo(cities), [cities]);
  const activeStepInfo = isLoggedIn ? stepInfo : guestStepInfo;
  const totalSteps = activeStepInfo?.totalSteps ?? user?.totalSteps ?? GUEST_PREVIEW_TOTAL_STEPS;
  const completedMissionIds = getCompletedMissionIds(badgesResponse?.badges);
  const missions = useMemo(() => buildStaticMissionMap(totalSteps, completedMissionIds), [completedMissionIds, totalSteps]);
  const currentCity = findCityById(cities, activeStepInfo?.currentCityId ?? user?.currentCityId ?? null);

  if (!isReady || ((isLoggedIn && (!user || isStepLoading || isBadgesLoading)) || !currentCity || !activeStepInfo)) {
    return (
      <AppScreen centerContent>
        <LoadingSpinner size="large" />
      </AppScreen>
    );
  }

  const visitedCount = cities.filter((city) => totalSteps >= city.stepsRequired).length;
  const completionRate = cities.length > 0 ? Math.round((visitedCount / cities.length) * 100) : 0;

  return (
    <AppScreen>
      <View style={styles.hero}>
        <Image source={heroMapImg} style={styles.heroImage} contentFit="cover" />
        <View style={styles.heroOverlay} />
        <View style={styles.heroText}>
          <AppText variant="headline" tone="inverse">🌍 나의 여행 노선도</AppText>
          <AppText variant="caption" tone="inverse">서울에서 시작하여 지구 한바퀴를 돌아보세요</AppText>
        </View>
      </View>

      <View style={styles.stats}>
        {[
          { value: visitedCount, label: "방문 도시" },
          { value: cities.length, label: "전체 도시" },
          { value: `${completionRate}%`, label: "완료율", highlight: true },
        ].map((item) => (
          <View key={item.label} style={styles.statItem}>
            <AppText variant="headline" tone={item.highlight ? "primary" : "default"}>{String(item.value)}</AppText>
            <AppText variant="caption">{item.label}</AppText>
          </View>
        ))}
      </View>

      <View style={styles.list}>
        {cities.map((city) => (
          <CityCard
            key={city.id}
            city={city}
            missions={missions[city.id] || []}
            isUnlocked={totalSteps >= city.stepsRequired}
            isCurrent={city.id === currentCity.id}
            expanded={expandedCityId === city.id}
            onToggle={() => setExpandedCityId((current) => (current === city.id ? null : city.id))}
            onMissionPress={setSelectedMission}
          />
        ))}
      </View>
      <MissionDetailSheet mission={selectedMission} onClose={() => setSelectedMission(null)} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: { height: 180, overflow: "hidden" },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: { position: "absolute", inset: 0, backgroundColor: "rgba(15,23,42,0.32)" },
  heroText: { position: "absolute", left: 16, right: 16, bottom: 16, gap: 4 },
  stats: {
    flexDirection: "row",
    backgroundColor: palette.card,
    paddingVertical: 14,
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
});
