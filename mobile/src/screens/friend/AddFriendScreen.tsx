import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import { AppScreen } from "@/src/components/common/AppScreen";
import { AppText } from "@/src/components/common/AppText";
import { LoadingSpinner } from "@/src/components/common/LoadingSpinner";
import { UserAvatar } from "@/src/components/common/UserAvatar";
import { useAuth } from "@/src/contexts/AuthContext";
import { useAddFriend, usePublicProfile } from "@/src/hooks/useApi";
import { palette, radius, spacing } from "@/src/lib/theme";
import { useToast } from "@/src/providers/ToastProvider";

export function AddFriendScreen({ userId }: { userId: number }) {
  const toast = useToast();
  const { isLoggedIn, requireLogin, isReady } = useAuth();
  const { data, isLoading } = usePublicProfile(userId);
  const addFriend = useAddFriend();

  useEffect(() => {
    if (isReady && !isLoggedIn) {
      requireLogin();
    }
  }, [isLoggedIn, isReady, requireLogin]);

  const add = async () => {
    if (!data) return;
    try {
      await addFriend.mutateAsync({ friendId: data.id, method: "qr" });
      toast.success("친구가 추가되었습니다");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "친구 추가에 실패했습니다");
    }
  };

  if (!isLoggedIn || isLoading || !data) {
    return (
      <AppScreen centerContent>
        {isLoading ? <LoadingSpinner size="large" /> : <AppText tone="muted">로그인이 필요합니다</AppText>}
      </AppScreen>
    );
  }

  return (
    <AppScreen centerContent contentContainerStyle={styles.content}>
      <UserAvatar name={data.name} avatar={data.avatarUrl} size="lg" showOnline />
      <AppText variant="title">{data.name}</AppText>
      <AppText tone="muted">이 여행자를 친구로 추가할까요?</AppText>
      <Pressable style={styles.button} onPress={add}>
        <AppText variant="bodyBold" tone="inverse">친구 추가</AppText>
      </Pressable>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  button: {
    minHeight: 52,
    minWidth: 180,
    borderRadius: radius.xl,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
