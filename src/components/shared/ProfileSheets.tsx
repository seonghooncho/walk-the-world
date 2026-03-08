import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff, HelpCircle, LogOut, ChevronRight, FileText } from "lucide-react";
import BottomSheet from "./BottomSheet";
import PostCard from "./PostCard";
import { useAppStore } from "@/stores/appStore";
import { toast } from "sonner";

// Settings sheet component (reusable)
export const SettingsSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [notifications, setNotifications] = useState(true);

  return (
    <BottomSheet open={open} onClose={onClose} title="설정">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
          <div className="flex items-center gap-3">
            {notifications ? <Bell className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
            <span className="text-sm font-medium text-card-foreground">알림</span>
          </div>
          <button
            onClick={() => { setNotifications(!notifications); toast.success(notifications ? "알림 꺼짐" : "알림 켜짐"); }}
            className={`h-7 w-12 rounded-full transition-colors ${notifications ? "bg-primary" : "bg-border"}`}
          >
            <motion.div
              animate={{ x: notifications ? 22 : 2 }}
              className="h-5 w-5 rounded-full bg-white shadow-md"
            />
          </button>
        </div>
        <button className="flex w-full items-center gap-3 rounded-xl bg-muted/50 p-4">
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-card-foreground">도움말</span>
          <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
        </button>
        <button
          onClick={() => { toast.info("로그아웃 되었습니다 (데모)"); onClose(); }}
          className="flex w-full items-center gap-3 rounded-xl bg-destructive/10 p-4"
        >
          <LogOut className="h-5 w-5 text-destructive" />
          <span className="text-sm font-medium text-destructive">로그아웃</span>
        </button>
      </div>
    </BottomSheet>
  );
};

// My posts sheet
export const MyPostsSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const posts = useAppStore((s) => s.posts);
  const user = useAppStore((s) => s.user);
  const myPosts = posts.filter((p) => p.userId === user.id);

  return (
    <BottomSheet open={open} onClose={onClose} title={`내 게시물 (${myPosts.length})`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {myPosts.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">아직 작성한 게시물이 없어요</p>
          </div>
        ) : (
          myPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </BottomSheet>
  );
};
