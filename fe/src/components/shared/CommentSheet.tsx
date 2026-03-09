import { useState, useMemo } from "react";
import { Send } from "lucide-react";
import UserAvatar from "./UserAvatar";
import BottomSheet from "./BottomSheet";
import { useAppStore } from "@/stores/appStore";
import { getTimeAgo } from "@/lib/timeAgo";

interface CommentSheetProps {
  postId: string;
  open: boolean;
  onClose: () => void;
}

const CommentSheet = ({ postId, open, onClose }: CommentSheetProps) => {
  const [text, setText] = useState("");
  const allComments = useAppStore((s) => s.comments);
  const addComment = useAppStore((s) => s.addComment);
  const comments = useMemo(() => allComments.filter((c) => c.postId === postId), [allComments, postId]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    addComment(postId, text.trim());
    setText("");
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={`댓글 ${comments.length}개`} className="max-h-[70vh]">
      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            첫 번째 댓글을 남겨보세요!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <UserAvatar name={comment.userName} size="sm" />
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-card-foreground">{comment.userName}</span>
                  <span className="text-[10px] text-muted-foreground">{getTimeAgo(comment.createdAt)}</span>
                </div>
                <p className="mt-0.5 text-sm text-card-foreground">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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
    </BottomSheet>
  );
};

export default CommentSheet;
