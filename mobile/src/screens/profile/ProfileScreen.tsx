import { useEffect, useMemo, useState } from "react";
import { Award, Globe, QrCode, ScanLine, Settings, Users } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AppScreen } from "@/src/components/common/AppScreen";
import { AppText } from "@/src/components/common/AppText";
import { LoadingSpinner } from "@/src/components/common/LoadingSpinner";
import { UserAvatar } from "@/src/components/common/UserAvatar";
import { MyPostsSheet } from "@/src/components/shared/MyPostsSheet";
import { QRCodeSheet } from "@/src/components/shared/QRCodeSheet";
import { QRScannerSheet } from "@/src/components/shared/QRScannerSheet";
import { SettingsSheet } from "@/src/components/shared/SettingsSheet";
import { StepProgressRing } from "@/src/components/shared/StepProgressRing";
import { useAuth } from "@/src/contexts/AuthContext";
import { useLogout, useMe, useStepInfo } from "@/src/hooks/useApi";
import { findCityById, getProgressPercent, getStaticCities } from "@/src/lib/city-utils";
import { palette, radius, spacing } from "@/src/lib/theme";
import { useToast } from "@/src/providers/ToastProvider";

export function ProfileScreen() {
  const toast = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const { isLoggedIn, requireLogin, isReady } = useAuth();
  const { data: user, isLoading } = useMe();
  const { data: stepInfo } = useStepInfo();
  const logout = useLogout();
  const cities = useMemo(() => getStaticCities(), []);
  const currentCity = findCityById(cities, user?.currentCityId ?? null);
  const progress = user ? getProgressPercent(cities, user.totalSteps, user.currentCityId) : 50;

  useEffect(() => {
    if (isReady && !isLoggedIn) {
      requireLogin();
    }
  }, [isLoggedIn, isReady, requireLogin]);

  if (!isLoggedIn) {
    return (
      <AppScreen centerContent>
        <AppText tone="muted">로그인이 필요합니다</AppText>
      </AppScreen>
    );
  }

  if (isLoading || !user) {
    return (
      <AppScreen centerContent>
        <LoadingSpinner size="large" />
      </AppScreen>
    );
  }

  const stats = [
    { icon: Globe, label: "현재 도시", value: currentCity ? `${currentCity.countryFlag} ${currentCity.name}` : user.currentCityId },
    { icon: Users, label: "친구", value: `${user.friendCount}명` },
    { icon: Award, label: "재화", value: `쿠폰 ${user.coupons}개 / 하트 ${user.hearts}개` },
  ];

  const handleLogout = async () => {
    await logout.mutateAsync();
    toast.success("로그아웃 되었습니다");
    router.replace("/login");
  };

  return (
    <AppScreen>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <AppText variant="headline">프로필</AppText>
          <Pressable onPress={() => setShowSettings(true)}>
            <Settings size={20} color={palette.mutedForeground} />
          </Pressable>
        </View>

        <View style={styles.profile}>
          <StepProgressRing progress={stepInfo?.progressPercent ?? progress} size={116} strokeWidth={5}>
            <UserAvatar name={user.name} avatar={user.avatarUrl} size="lg" />
          </StepProgressRing>
          <AppText variant="title">{user.name}</AppText>
          <AppText variant="caption">{currentCity ? `${currentCity.countryFlag} ${currentCity.name}에서 여행 중` : `${user.currentCityId}에서 여행 중`}</AppText>
        </View>

        <View style={styles.qrActions}>
          <Pressable style={styles.secondaryAction} onPress={() => setShowQR(true)}>
            <QrCode size={16} color={palette.secondaryForeground} />
            <AppText variant="bodyBold">내 QR코드</AppText>
          </Pressable>
          <Pressable style={styles.primaryAction} onPress={() => setShowScanner(true)}>
            <ScanLine size={16} color={palette.white} />
            <AppText variant="bodyBold" tone="inverse">QR 스캔</AppText>
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.statGrid}>
          <View style={styles.statCard}>
            <AppText variant="caption">총 걸음 수</AppText>
            <AppText variant="headline">{user.totalSteps.toLocaleString()}</AppText>
          </View>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <stat.icon size={16} color={palette.mutedForeground} />
              <AppText variant="bodyBold">{stat.value}</AppText>
              <AppText variant="caption">{stat.label}</AppText>
            </View>
          ))}
        </View>

        <View style={styles.menu}>
          {[
            { label: "내 게시물", action: () => setShowMyPosts(true) },
            { label: "배지 컬렉션", action: () => router.push("/profile/badges") },
            { label: "도움말", action: () => toast.info("서비스 지원 채널로 문의해주세요") },
            { label: "로그아웃", action: handleLogout },
          ].map((item) => (
            <Pressable key={item.label} style={styles.menuRow} onPress={item.action}>
              <AppText variant="bodyBold">{item.label}</AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <SettingsSheet open={showSettings} onClose={() => setShowSettings(false)} onLogout={handleLogout} />
      <MyPostsSheet open={showMyPosts} onClose={() => setShowMyPosts(false)} />
      <QRCodeSheet open={showQR} onClose={() => setShowQR(false)} />
      <QRScannerSheet open={showScanner} onClose={() => setShowScanner(false)} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: 16,
    paddingBottom: 28,
    backgroundColor: palette.card,
    gap: spacing.lg,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profile: {
    alignItems: "center",
    gap: spacing.sm,
  },
  qrActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md,
  },
  secondaryAction: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    backgroundColor: palette.secondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  primaryAction: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    backgroundColor: palette.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  statCard: {
    width: "48.5%",
    borderRadius: radius.lg,
    backgroundColor: palette.card,
    padding: spacing.lg,
    gap: 6,
  },
  menu: {
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: palette.card,
  },
  menuRow: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
});
