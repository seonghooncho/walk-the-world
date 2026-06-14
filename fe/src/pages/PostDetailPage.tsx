import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, Share2, Send, Stamp } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import UserAvatar from "@/components/shared/UserAvatar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useAddComment, usePost, usePostComments, useToggleLike } from "@/hooks/useApi";
import { toUiComment, toUiPost } from "@/lib/city-utils";
import { SOCIAL_TEXT_MAX_LENGTH } from "@/lib/input-limits";
import { getTimeAgo } from "@/lib/timeAgo";
import { toast } from "sonner";

const PostDetailPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const isComposingRef = useRef(false);
  const parsedPostId = Number(postId);
  const { data: postData, isLoading: isPostLoading } = usePost(parsedPostId);
  const { data: commentsData, isLoading: isCommentsLoading } = usePostComments(parsedPostId);
  const toggleLike = useToggleLike();
  const addComment = useAddComment();

  const post = postData ? toUiPost(postData) : null;
  const comments = useMemo(
    () => (commentsData?.pages ?? []).flatMap((page) => page.data).map(toUiComment).reverse(),
    [commentsData],
  );

  if (isPostLoading || isCommentsLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (!post) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-semibold text-muted-foreground">미션 인증을 찾을 수 없습니다</p>
          <button onClick={() => navigate("/city")} className="mt-4 text-sm font-medium text-primary">
            미션 피드로 돌아가기
          </button>
        </div>
      </AppLayout>
    );
  }

  const handleSubmit = () => {
    if (!text.trim() || !parsedPostId) {
      return;
    }

    addComment.mutate(
      { postId: parsedPostId, content: text.trim() },
      {
        onSuccess: () => setText(""),
      },
    );
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${post.userName}: ${post.content}`);
      toast.success("클립보드에 복사되었습니다!");
    } catch {
      toast.info("공유 기능은 준비 중입니다");
    }
  };

  return (
    <AppLayout>
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-bold text-foreground">미션 인증</h1>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="border-b border-border p-4">
          <div className="mb-3 flex items-center gap-3">
            <UserAvatar name={post.userName} avatar={post.userAvatarUrl ?? undefined} size="md" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-card-foreground">{post.userName}</p>
              <p className="text-xs text-muted-foreground">{getTimeAgo(post.createdAt)}</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-card-foreground">{post.content}</p>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
            <Stamp className="h-3.5 w-3.5" />
            {post.missionTitle}
          </div>

          {post.imageUrl && (
            <div className="mt-3 overflow-hidden rounded-xl">
              <img src={post.imageUrl} alt="" className="w-full object-cover" />
            </div>
          )}

          <div className="mt-4 flex items-center gap-6 border-t border-border pt-3">
            <button onClick={() => toggleLike.mutate(post.id)} className="flex items-center gap-1.5 text-sm">
              <motion.div whileTap={{ scale: 1.3 }}>
                <Heart
                  className={`h-4 w-4 ${
                    post.isLiked ? "fill-accent text-accent" : "text-muted-foreground"
                  }`}
                />
              </motion.div>
              <span className={post.isLiked ? "text-accent" : "text-muted-foreground"}>{post.stampReactions}</span>
            </button>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>{comments.length}</span>
            </div>
            <button onClick={handleShare} className="ml-auto text-muted-foreground">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4 p-4">
          <p className="text-xs font-semibold text-muted-foreground">댓글 {comments.length}개</p>
          {comments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">첫 번째 댓글을 남겨보세요!</p>
          ) : (
            comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-3"
              >
                <UserAvatar name={comment.userName} avatar={comment.userAvatarUrl ?? undefined} size="sm" />
                <div className="flex-1 rounded-xl bg-muted/50 p-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-card-foreground">{comment.userName}</span>
                    <span className="text-[10px] text-muted-foreground">{getTimeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-card-foreground">{comment.content}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={SOCIAL_TEXT_MAX_LENGTH}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !isComposingRef.current) {
                handleSubmit();
              }
            }}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            placeholder="댓글을 입력하세요..."
            className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || addComment.isPending}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground disabled:opacity-40"
            aria-label="댓글 보내기"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-1 flex justify-end">
          <span className="text-[10px] text-muted-foreground">
            {text.length}/{SOCIAL_TEXT_MAX_LENGTH}
          </span>
        </div>
      </div>
    </AppLayout>
  );
};

export default PostDetailPage;
