import { Heart, Ticket } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { useAddFriend } from "@/src/hooks/useApi";
import { BottomSheet } from "@/src/components/shared/BottomSheet";
import { AppText } from "@/src/components/common/AppText";
import { UserAvatar } from "@/src/components/common/UserAvatar";
import type { UiProfile } from "@/src/lib/city-utils";
import { gradients, palette, radius, spacing } from "@/src/lib/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useToast } from "@/src/providers/ToastProvider";

export function FriendAddSheet({
  open,
  onClose,
  targetUser,
  sameCityCost,
}: {
  open: boolean;
  onClose: () => void;
  targetUser: UiProfile | null;
  sameCityCost: boolean;
}) {
  const addFriend = useAddFriend();
  const toast = useToast();

  if (!targetUser) {
    return null;
  }

  const handleAdd = async (method: "city" | "qr") => {
    try {
      await addFriend.mutateAsync({ friendId: targetUser.id, method });
      toast.success("친구가 추가되었습니다");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "친구 추가에 실패했습니다");
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <View style={styles.content}>
        <View style={styles.header}>
          <UserAvatar name={targetUser.name} avatar={targetUser.avatarUrl} size="lg" />
          <AppText variant="title">{targetUser.name}</AppText>
        </View>
        <View style={styles.costCard}>
          {sameCityCost ? <Ticket size={18} color={palette.primary} /> : <Heart size={18} color={palette.destructive} />}
          <AppText>
            {sameCityCost ? "같은 도시 친구 추가는 쿠폰 1장이 필요합니다" : "다른 도시 친구 추가는 하트 2개가 필요합니다"}
          </AppText>
        </View>
        <Pressable onPress={() => handleAdd("city")}>
          <LinearGradient colors={gradients.hero} style={styles.action}>
            <AppText variant="bodyBold" tone="inverse">친구 추가하기</AppText>
          </LinearGradient>
        </Pressable>
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
  costCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: palette.secondary,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  action: {
    minHeight: 52,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
});
