import { Heart, MessageCircle, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import UserAvatar from "./UserAvatar";
import type { Post } from "@/mocks/mockData";
import { useAppStore } from "@/stores/appStore";
import { getTimeAgo } from "@/lib/timeAgo";
import { toast } from "sonner";

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const navigate = useNavigate();
  const toggleLike = useAppStore((s) => s.toggleLike);
  const storePost = useAppStore((s) => s.posts.find((p) => p.id === post.id));
  const displayPost = storePost || post;

  const goToDetail = () => navigate(`/post/${displayPost.id}`);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${displayPost.userName}: ${displayPost.content}`);
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
        <UserAvatar name={displayPost.userName} avatar={displayPost.userAvatar} size="sm" />
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-card-foreground">{displayPost.userName}</p>
          <p className="text-[11px] text-muted-foreground">{getTimeAgo(displayPost.createdAt)}</p>
        </div>
      </div>

      <p className="mb-3 text-sm leading-relaxed text-card-foreground">{displayPost.content}</p>

      {displayPost.image && (
        <div className="mb-3 overflow-hidden rounded-lg">
          <img src={displayPost.image} alt="" className="h-44 w-full object-cover" />
        </div>
      )}

      <div className="flex items-center gap-5 border-t border-border pt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(displayPost.id);
          }}
          className="flex items-center gap-1.5 text-[13px]"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              displayPost.isLiked ? "fill-destructive text-destructive" : "text-muted-foreground"
            }`}
          />
          <span className={displayPost.isLiked ? "text-destructive font-medium" : "text-muted-foreground"}>
            {displayPost.likes}
          </span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            goToDetail();
          }}
          className="flex items-center gap-1.5 text-[13px] text-muted-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{displayPost.comments}</span>
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
