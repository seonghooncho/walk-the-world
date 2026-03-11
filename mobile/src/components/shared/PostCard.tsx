import { Image } from "expo-image";
import { Heart, MessageCircle, Share2 } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AppText } from "@/src/components/common/AppText";
import { SurfaceCard } from "@/src/components/common/SurfaceCard";
import { UserAvatar } from "@/src/components/common/UserAvatar";
import { useToggleLike } from "@/src/hooks/useApi";
import type { UiPost } from "@/src/lib/city-utils";
import { getTimeAgo } from "@/src/lib/time-ago";
import { palette, spacing } from "@/src/lib/theme";
import { useToast } from "@/src/providers/ToastProvider";

export function PostCard({ post }: { post: UiPost }) {
  const toggleLike = useToggleLike();
  const toast = useToast();

  const goToDetail = () => router.push(`/post/${post.id}`);

  return (
    <Pressable onPress={goToDetail}>
      <SurfaceCard style={styles.card}>
        <View style={styles.header}>
          <UserAvatar name={post.userName} avatar={post.userAvatarUrl} size="sm" />
          <View style={{ flex: 1 }}>
            <AppText variant="bodyBold">{post.userName}</AppText>
            <AppText variant="caption">{getTimeAgo(post.createdAt)}</AppText>
          </View>
        </View>

        <AppText>{post.content}</AppText>

        {post.imageUrl ? <Image source={{ uri: post.imageUrl }} style={styles.image} contentFit="cover" /> : null}

        <View style={styles.actions}>
          <Pressable onPress={() => toggleLike.mutate(post.id)} style={styles.action}>
            <Heart size={16} color={post.isLiked ? palette.destructive : palette.mutedForeground} fill={post.isLiked ? palette.destructive : "transparent"} />
            <AppText variant="caption" tone={post.isLiked ? "danger" : "muted"}>{String(post.likes)}</AppText>
          </Pressable>
          <Pressable onPress={goToDetail} style={styles.action}>
            <MessageCircle size={16} color={palette.mutedForeground} />
            <AppText variant="caption">{String(post.comments)}</AppText>
          </Pressable>
          <Pressable
            onPress={() => toast.info("공유 기능은 준비 중입니다")}
            style={[styles.action, { marginLeft: "auto" }]}
          >
            <Share2 size={16} color={palette.mutedForeground} />
          </Pressable>
        </View>
      </SurfaceCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 14,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
