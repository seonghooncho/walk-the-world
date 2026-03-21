import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { AppScreen } from "@/src/components/common/AppScreen";
import { AppText } from "@/src/components/common/AppText";
import { LoadingSpinner } from "@/src/components/common/LoadingSpinner";
import { useAuth } from "@/src/contexts/AuthContext";
import { useBadges } from "@/src/hooks/useApi";
import { getStaticCities } from "@/src/lib/city-utils";
import { palette, radius, spacing } from "@/src/lib/theme";

export function BadgeCollectionScreen() {
  const { isLoggedIn, isReady } = useAuth();
  const { data, isLoading } = useBadges();
  const cities = useMemo(() => getStaticCities(), []);

  if (!isReady || !isLoggedIn || isLoading) {
    return (
      <AppScreen centerContent>
        <LoadingSpinner size="large" />
      </AppScreen>
    );
  }

  return (
    <AppScreen padded>
      <View style={{ paddingTop: 16, gap: spacing.lg }}>
        <AppText variant="title">배지 컬렉션</AppText>
        <View style={styles.summary}>
          <AppText variant="headline">{data?.totalEarned ?? 0} / {data?.totalPossible ?? 0}</AppText>
          <AppText variant="caption">획득한 배지 수</AppText>
        </View>
        {cities.map((city) => {
          const badges = (data?.badges ?? []).filter((badge) => badge.cityId === city.id);
          if (badges.length === 0) return null;
          return (
            <View key={city.id} style={{ gap: spacing.sm }}>
              <AppText variant="headline">
                {city.countryFlag} {city.name}
              </AppText>
              <View style={styles.grid}>
                {badges.map((badge) => (
                  <View key={badge.id} style={[styles.badgeCard, !badge.earned && { opacity: 0.42 }]}>
                    <AppText variant="title">{badge.emoji}</AppText>
                    <AppText variant="captionBold" style={{ textAlign: "center" }}>{badge.title}</AppText>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  summary: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    gap: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  badgeCard: {
    width: "31%",
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    gap: 8,
  },
});
