import { useMemo, useState } from "react";
import { ArrowLeft, Heart, MessageCircle, Send } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { AppText } from "@/src/components/common/AppText";
import { LoadingSpinner } from "@/src/components/common/LoadingSpinner";
import { UserAvatar } from "@/src/components/common/UserAvatar";
import { useAddComment, usePost, usePostComments, useToggleLike } from "@/src/hooks/useApi";
import { toUiComment, toUiPost } from "@/src/lib/city-utils";
import { getTimeAgo } from "@/src/lib/time-ago";
import { palette, radius, spacing } from "@/src/lib/theme";

export function PostDetailScreen({ postId }: { postId: number }) {
  const [text, setText] = useState("");
  const { data: postData, isLoading: isPostLoading } = usePost(postId);
  const { data: commentsData, isLoading: isCommentsLoading } = usePostComments(postId);
  const toggleLike = useToggleLike();
  const addComment = useAddComment();

  const post = postData ? toUiPost(postData) : null;
  const comments = useMemo(() => (commentsData?.pages ?? []).flatMap((page) => page.data).map(toUiComment).reverse(), [commentsData]);

  const submit = async () => {
    if (!text.trim()) return;
    await addComment.mutateAsync({ postId, content: text.trim() });
    setText("");
  };

  if (isPostLoading || isCommentsLoading) {
    return (
      <View style={styles.center}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.center}>
        <AppText tone="muted">게시물을 찾을 수 없습니다</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={20} color={palette.foreground} />
        </Pressable>
        <AppText variant="bodyBold">게시물</AppText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.postHeader}>
          <UserAvatar name={post.userName} avatar={post.userAvatarUrl} size="md" />
          <View style={{ flex: 1 }}>
            <AppText variant="bodyBold">{post.userName}</AppText>
            <AppText variant="caption">{getTimeAgo(post.createdAt)}</AppText>
          </View>
        </View>

        <AppText>{post.content}</AppText>
        {post.imageUrl ? <View style={styles.imagePlaceholder} /> : null}

        <View style={styles.actions}>
          <Pressable style={styles.action} onPress={() => toggleLike.mutate(post.id)}>
            <Heart size={16} color={post.isLiked ? palette.destructive : palette.mutedForeground} fill={post.isLiked ? palette.destructive : "transparent"} />
            <AppText variant="caption">{String(post.likes)}</AppText>
          </Pressable>
          <View style={styles.action}>
            <MessageCircle size={16} color={palette.mutedForeground} />
            <AppText variant="caption">{String(comments.length)}</AppText>
          </View>
        </View>

        <View style={{ gap: spacing.md }}>
          <AppText variant="captionBold">댓글 {comments.length}개</AppText>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentRow}>
              <UserAvatar name={comment.userName} avatar={comment.userAvatarUrl} size="sm" />
              <View style={styles.commentBubble}>
                <View style={styles.commentMeta}>
                  <AppText variant="captionBold">{comment.userName}</AppText>
                  <AppText variant="caption">{getTimeAgo(comment.createdAt)}</AppText>
                </View>
                <AppText>{comment.content}</AppText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput value={text} onChangeText={setText} placeholder="댓글을 입력하세요..." placeholderTextColor={palette.mutedForeground} style={styles.input} onSubmitEditing={() => void submit()} />
        <Pressable onPress={() => void submit()} style={[styles.send, !text.trim() && { opacity: 0.4 }]} disabled={!text.trim()}>
          <Send size={16} color={palette.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: palette.background },
  header: {
    paddingTop: 64,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: palette.background,
  },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 120 },
  postHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  imagePlaceholder: { height: 220, borderRadius: radius.lg, backgroundColor: palette.secondary },
  actions: { flexDirection: "row", gap: spacing.lg },
  action: { flexDirection: "row", alignItems: "center", gap: 6 },
  commentRow: { flexDirection: "row", gap: spacing.md },
  commentBubble: { flex: 1, backgroundColor: palette.secondary, borderRadius: radius.lg, padding: spacing.md, gap: 4 },
  commentMeta: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  inputBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: palette.card,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 28,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.xl,
    backgroundColor: palette.secondary,
    paddingHorizontal: spacing.lg,
    color: palette.foreground,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
