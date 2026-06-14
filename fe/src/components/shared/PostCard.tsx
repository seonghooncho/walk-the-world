import { Camera, Heart, MessageCircle, PenLine, Send, Share2, Smartphone, Stamp, Timer, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import UserAvatar from "./UserAvatar";
import { useToggleLike } from "@/hooks/useApi";
import type { UiPost } from "@/lib/city-utils";
import { getTimeAgo } from "@/lib/timeAgo";
import { toast } from "sonner";

interface PostCardProps {
  post: UiPost;
}

const PostCard = ({ post }: PostCardProps) => {
  const navigate = useNavigate();
  const toggleLike = useToggleLike();
  const ProofIcon =
    post.proofType === "photo"
      ? Camera
      : post.proofType === "text"
        ? PenLine
        : post.proofType === "screenshot"
          ? Smartphone
          : post.proofType === "social"
            ? Users
            : Timer;

  const goToDetail = () => navigate(`/post/${post.id}`);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${post.userName}: ${post.content}`);
      toast.success("클립보드에 복사되었습니다!");
    } catch {
      toast.info("공유 기능은 준비 중입니다");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={goToDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") goToDetail();
      }}
      role="button"
      tabIndex={0}
      className="cursor-pointer rounded-xl bg-card p-4 transition-shadow hover:shadow-elevated"
    >
      <div className="mb-3 flex items-center gap-3">
        <UserAvatar name={post.userName} avatar={post.userAvatarUrl ?? undefined} size="sm" />
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-card-foreground">{post.userName}</p>
          <p className="text-[11px] text-muted-foreground">{getTimeAgo(post.createdAt)}</p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
          <Stamp className="h-3 w-3" />
          {post.missionTitle}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold text-secondary-foreground">
          <ProofIcon className="h-3 w-3" />
          {post.proofType === "photo"
            ? "사진 증명"
            : post.proofType === "text"
              ? "텍스트 증명"
              : post.proofType === "screenshot"
                ? "스크린샷 증명"
                : post.proofType === "social"
                  ? "소셜 증명"
                  : "세션 증명"}
        </span>
      </div>

      <p className="mb-3 text-sm leading-relaxed text-card-foreground">{post.content}</p>

      {post.imageUrl && (
        <div className="mb-3 overflow-hidden rounded-lg">
          <img src={post.imageUrl} alt="" className="h-44 w-full object-cover" />
        </div>
      )}

      <div className="flex items-center gap-4 border-t border-border pt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike.mutate(post.id);
          }}
          disabled={toggleLike.isPending}
          className="flex items-center gap-1.5 text-[12px]"
        >
          <Stamp
            className={`h-4 w-4 transition-colors ${
              post.isLiked ? "fill-primary text-primary" : "text-muted-foreground"
            }`}
          />
          <span className={post.isLiked ? "font-medium text-primary" : "text-muted-foreground"}>
            {post.stampReactions}
          </span>
        </button>

        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Send className="h-4 w-4" />
          <span>{post.postcardReactions}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Heart className="h-4 w-4" />
          <span>{post.cheerReactions}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            goToDetail();
          }}
          className="flex items-center gap-1.5 text-[12px] text-muted-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments}</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            void handleShare();
          }}
          className="ml-auto text-muted-foreground"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default PostCard;
