import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, Share2, Send } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import UserAvatar from "@/components/shared/UserAvatar";
import { useAppStore } from "@/stores/appStore";
import { getTimeAgo } from "@/lib/timeAgo";
import { toast } from "sonner";

const PostDetailPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const isComposingRef = useRef(false);

  const post = useAppStore((s) => s.posts.find((p) => p.id === postId));
  const allComments = useAppStore((s) => s.comments);
  const toggleLike = useAppStore((s) => s.toggleLike);
  const addComment = useAppStore((s) => s.addComment);

  const comments = useMemo(
    () => allComments.filter((c) => c.postId === postId),
    [allComments, postId]
  );

  if (!post) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-semibold text-muted-foreground">게시물을 찾을 수 없습니다</p>
          <button
            onClick={() => navigate("/city")}
            className="mt-4 text-sm font-medium text-primary"
          >
            도시로 돌아가기
          </button>
        </div>
      </AppLayout>
    );
  }

  const handleSubmit = () => {
    if (!text.trim() || !postId) return;
    addComment(postId, text.trim());
    setText("");
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
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-bold text-foreground">게시물</h1>
      </div>

      <div className="flex flex-1 flex-col">
        {/* Post content */}
        <div className="border-b border-border p-4">
          <div className="mb-3 flex items-center gap-3">
            <UserAvatar name={post.userName} avatar={post.userAvatar} size="md" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-card-foreground">{post.userName}</p>
              <p className="text-xs text-muted-foreground">{getTimeAgo(post.createdAt)}</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-card-foreground">{post.content}</p>

          {post.image && (
            <div className="mt-3 overflow-hidden rounded-xl">
              <img src={post.image} alt="" className="w-full object-cover" />
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center gap-6 border-t border-border pt-3">
            <button
              onClick={() => toggleLike(post.id)}
              className="flex items-center gap-1.5 text-sm"
            >
              <motion.div whileTap={{ scale: 1.3 }}>
                <Heart
                  className={`h-4 w-4 ${
                    post.isLiked ? "fill-accent text-accent" : "text-muted-foreground"
                  }`}
                />
              </motion.div>
              <span className={post.isLiked ? "text-accent" : "text-muted-foreground"}>
                {post.likes}
              </span>
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

        {/* Comments */}
        <div className="flex-1 p-4 space-y-4">
          <p className="text-xs font-semibold text-muted-foreground">
            댓글 {comments.length}개
          </p>
          {comments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              첫 번째 댓글을 남겨보세요!
            </p>
          ) : (
            comments.map((comment, i) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-3"
              >
                <UserAvatar name={comment.userName} size="sm" />
                <div className="flex-1 rounded-xl bg-muted/50 p-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-card-foreground">
                      {comment.userName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {getTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-card-foreground">{comment.content}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Comment input - fixed bottom */}
      <div className="sticky bottom-0 border-t border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isComposingRef.current) handleSubmit();
            }}
            onCompositionStart={() => { isComposingRef.current = true; }}
            onCompositionEnd={() => { isComposingRef.current = false; }}
            placeholder="댓글을 입력하세요..."
            className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default PostDetailPage;
