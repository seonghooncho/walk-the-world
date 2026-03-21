import { ScrollView, StyleSheet, View } from "react-native";
import { BottomSheet } from "@/src/components/shared/BottomSheet";
import { AppText } from "@/src/components/common/AppText";
import { LoadingSpinner } from "@/src/components/common/LoadingSpinner";
import { PostCard } from "@/src/components/shared/PostCard";
import { useMyPosts } from "@/src/hooks/useApi";
import { toUiPost } from "@/src/lib/city-utils";
import { spacing } from "@/src/lib/theme";

export function MyPostsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, isLoading } = useMyPosts();
  const posts = (data?.pages ?? []).flatMap((page) => page.data).map(toUiPost);

  return (
    <BottomSheet open={open} onClose={onClose}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title">내 게시물</AppText>
        {isLoading ? (
          <LoadingSpinner size="large" />
        ) : posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <View style={{ paddingVertical: 40 }}>
            <AppText tone="muted" style={{ textAlign: "center" }}>아직 작성한 게시물이 없어요</AppText>
          </View>
        )}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing["2xl"],
    gap: spacing.lg,
  },
});
