import { Image } from "expo-image";
import { MapPin, Ticket, Trophy, Utensils } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AppScreen } from "@/src/components/common/AppScreen";
import { AppText } from "@/src/components/common/AppText";
import { LoadingSpinner } from "@/src/components/common/LoadingSpinner";
import { SurfaceCard } from "@/src/components/common/SurfaceCard";
import { MissionCard } from "@/src/components/shared/MissionCard";
import { MissionDetailSheet } from "@/src/components/shared/MissionDetailSheet";
import { SpotCarousel } from "@/src/components/shared/SpotCarousel";
import { StepProgressRing } from "@/src/components/shared/StepProgressRing";
import { useAuth } from "@/src/contexts/AuthContext";
import { useBadges, useCityMembers, useCurrency, useStepInfo } from "@/src/hooks/useApi";
import { buildGuestPreviewStepInfo, buildStaticMissionMap, findCityById, getCityFoodItems, getCityLandmarkItems, getCompletedMissionIds, getStaticCities, GUEST_PREVIEW_TOTAL_STEPS, type UiMission } from "@/src/lib/city-utils";
import { cityUsers } from "@/src/mocks/mockData";
import { palette, radius, spacing } from "@/src/lib/theme";

const GUEST_PREVIEW_COUPONS = 2;

export function HomeScreen() {
  const { user, isLoggedIn, isReady } = useAuth();
  const { data: stepInfo, isLoading: isStepLoading } = useStepInfo();
  const { data: currency } = useCurrency();
  const { data: badgesResponse, isLoading: isBadgesLoading } = useBadges();
  const [selectedMission, setSelectedMission] = useState<UiMission | null>(null);
  const cities = useMemo(() => getStaticCities(), []);
  const guestStepInfo = useMemo(() => buildGuestPreviewStepInfo(cities), [cities]);
  const activeStepInfo = isLoggedIn ? stepInfo : guestStepInfo;
  const totalSteps = activeStepInfo?.totalSteps ?? user?.totalSteps ?? GUEST_PREVIEW_TOTAL_STEPS;
  const completedMissionIds = getCompletedMissionIds(badgesResponse?.badges);
  const missions = useMemo(() => buildStaticMissionMap(totalSteps, completedMissionIds), [completedMissionIds, totalSteps]);
  const currentCity = findCityById(cities, activeStepInfo?.currentCityId ?? user?.currentCityId ?? null);
  const { data: cityMembers } = useCityMembers(currentCity?.id ?? "");

  if (!isReady || ((isLoggedIn && (!user || !stepInfo || isStepLoading || isBadgesLoading)) || !currentCity || !activeStepInfo)) {
    return (
      <AppScreen centerContent>
        <LoadingSpinner size="large" />
      </AppScreen>
    );
  }

  const progress = activeStepInfo.progressPercent;
  const activeMissions = (missions[currentCity.id] || []).filter((mission) => mission.status === "available");
  const memberCount = isLoggedIn ? (cityMembers?.length ?? 0) + 1 : cityUsers.filter((member) => member.currentCityId === currentCity.id).length + 1;
  const nextCityName = activeStepInfo.nextCityName ?? "최종 도시";
  const totalStepsLabel = (isLoggedIn ? user?.totalSteps : activeStepInfo.totalSteps)?.toLocaleString() ?? "0";
  const couponCount = isLoggedIn ? currency?.coupons ?? user?.coupons ?? 0 : GUEST_PREVIEW_COUPONS;

  return (
    <AppScreen>
      <View style={styles.hero}>
        <Image source={currentCity.image} style={styles.heroImage} contentFit="cover" />
        <View style={styles.heroOverlay} />
        <View style={styles.heroText}>
          <AppText variant="caption" tone="inverse">현재 위치</AppText>
          <AppText variant="title" tone="inverse">
            {currentCity.countryFlag} {currentCity.name}, {currentCity.country}
          </AppText>
        </View>
      </View>

      <View style={styles.content}>
        <SurfaceCard style={styles.progressCard}>
          <StepProgressRing progress={progress} size={100} strokeWidth={5}>
            <View style={{ alignItems: "center" }}>
              <AppText variant="caption">총 걸음</AppText>
              <AppText variant="headline">{totalStepsLabel}</AppText>
            </View>
          </StepProgressRing>
          <View style={{ flex: 1, gap: spacing.lg }}>
            <View>
              <AppText variant="caption">다음 도시</AppText>
              <AppText variant="title">{nextCityName}</AppText>
            </View>
            <View style={styles.stats}>
              <View>
                <AppText variant="caption">{nextCityName}까지</AppText>
                <AppText variant="bodyBold" tone="primary">{activeStepInfo.stepsToNextCity.toLocaleString()} 보</AppText>
              </View>
              <View style={styles.divider} />
              <View>
                <AppText variant="caption">진행률</AppText>
                <View style={styles.row}>
                  <Trophy size={14} color={palette.gold} />
                  <AppText variant="bodyBold">{Math.round(progress)}%</AppText>
                </View>
              </View>
            </View>
          </View>
        </SurfaceCard>

        <View style={styles.quickActions}>
          <Pressable style={[styles.quickCard, { flex: 3 }]} onPress={() => router.push("/city")}>
            <View style={[styles.quickIcon, { backgroundColor: "rgba(59,130,246,0.12)" }]}>
              <MapPin size={16} color={palette.ocean} />
            </View>
            <View>
              <AppText variant="bodyBold">도시 커뮤니티</AppText>
              <AppText variant="caption">{memberCount}명 활동 중</AppText>
            </View>
          </Pressable>
          <Pressable style={[styles.quickCard, { flex: 2 }]} onPress={() => router.push("/map")}>
            <View style={[styles.quickIcon, { backgroundColor: "rgba(120, 113, 108, 0.12)" }]}>
              <Utensils size={16} color={palette.earth} />
            </View>
            <View>
              <AppText variant="bodyBold">맛집</AppText>
              <AppText variant="caption">{currentCity.famousFood[0]}</AppText>
            </View>
          </Pressable>
        </View>

        <Pressable style={styles.ticketRow} onPress={() => router.push("/city")}>
          <View style={styles.row}>
            <Ticket size={16} color={palette.primary} />
            <AppText variant="bodyBold">쿠폰 {couponCount}장</AppText>
          </View>
          <AppText variant="caption">이번 주 남은 쿠폰</AppText>
        </Pressable>

        {activeMissions.length > 0 ? (
          <View style={{ gap: spacing.md }}>
            <View style={styles.sectionHeader}>
              <AppText variant="headline">🎯 진행 중인 미션</AppText>
              <Pressable onPress={() => router.push("/map")}>
                <AppText variant="captionBold">전체 보기</AppText>
              </Pressable>
            </View>
            <View style={styles.grid}>
              {activeMissions.slice(0, 4).map((mission) => (
                <View key={mission.id} style={{ width: "48.5%" }}>
                  <MissionCard mission={mission} onPress={setSelectedMission} />
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <SpotCarousel title={`${currentCity.name} 명소`} emoji="🏛️" items={getCityLandmarkItems(currentCity)} maxVisible={3} />
        <SpotCarousel title={`${currentCity.name} 맛집`} emoji="🍜" items={getCityFoodItems(currentCity)} maxVisible={3} />
      </View>

      <MissionDetailSheet mission={selectedMission} onClose={() => setSelectedMission(null)} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 220,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(15,23,42,0.32)",
  },
  heroText: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    gap: 4,
  },
  content: {
    marginTop: -20,
    paddingHorizontal: 16,
    gap: spacing.lg,
  },
  progressCard: {
    padding: spacing.lg,
    flexDirection: "row",
    gap: spacing.lg,
    borderRadius: radius.xl,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: palette.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  quickActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  quickCard: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ticketRow: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
});
