import { Calendar, MapPin, MessageCircle, UserPlus } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { BottomSheet } from "@/src/components/shared/BottomSheet";
import { AppText } from "@/src/components/common/AppText";
import { UserAvatar } from "@/src/components/common/UserAvatar";
import type { UiProfile } from "@/src/lib/city-utils";
import { formatSteps } from "@/src/lib/city-utils";
import { gradients, palette, radius, spacing } from "@/src/lib/theme";
import { LinearGradient } from "expo-linear-gradient";

export function ProfileDetailSheet({
  open,
  onClose,
  user,
  cityLabel,
  onMessage,
  onAddFriend,
}: {
  open: boolean;
  onClose: () => void;
  user: UiProfile;
  cityLabel?: string;
  onMessage?: () => void;
  onAddFriend?: () => void;
}) {
  const joinDate = user.joinedAt ? new Date(user.joinedAt) : null;
  const joinLabel = joinDate ? `${joinDate.getFullYear()}.${String(joinDate.getMonth() + 1).padStart(2, "0")}` : "정보 없음";

  return (
    <BottomSheet open={open} onClose={onClose}>
      <View style={styles.content}>
        <View style={styles.header}>
          <UserAvatar name={user.name} avatar={user.avatarUrl} size="lg" showOnline />
          <AppText variant="title">{user.name}</AppText>
        </View>

        <View style={styles.stats}>
          <View style={styles.statCard}>
            <AppText variant="caption">총 걸음</AppText>
            <AppText variant="bodyBold">{formatSteps(user.totalSteps)}</AppText>
          </View>
          <View style={styles.statCard}>
            <MapPin size={16} color={palette.accent} />
            <AppText variant="bodyBold">{cityLabel ?? user.currentCityId}</AppText>
          </View>
          <View style={styles.statCard}>
            <Calendar size={16} color={palette.ocean} />
            <AppText variant="bodyBold">{joinLabel}</AppText>
          </View>
        </View>

        {!user.isFriend ? (
          <Pressable onPress={() => { onAddFriend?.(); onClose(); }}>
            <LinearGradient colors={gradients.hero} style={styles.action}>
              <UserPlus size={16} color={palette.white} />
              <AppText variant="bodyBold" tone="inverse">친구 추가</AppText>
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable onPress={() => { onMessage?.(); onClose(); }}>
            <LinearGradient colors={gradients.hero} style={styles.action}>
              <MessageCircle size={16} color={palette.white} />
              <AppText variant="bodyBold" tone="inverse">메시지 보내기</AppText>
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing["2xl"],
    gap: spacing.xl,
  },
  header: {
    alignItems: "center",
    gap: spacing.md,
  },
  stats: {
    gap: spacing.md,
  },
  statCard: {
    backgroundColor: palette.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 6,
  },
  action: {
    minHeight: 52,
    borderRadius: radius.xl,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
