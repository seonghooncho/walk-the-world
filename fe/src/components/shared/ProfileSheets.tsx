import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff, HelpCircle, LogOut, ChevronRight, FileText, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import BottomSheet from "./BottomSheet";
import PostCard from "./PostCard";
import { useMyPosts } from "@/hooks/useApi";
import { toUiPost } from "@/lib/city-utils";
import { toast } from "sonner";

// Settings sheet component (reusable)
export const SettingsSheet = ({
  open,
  onClose,
  onLogout,
  onWithdraw,
  isWithdrawing = false,
}: {
  open: boolean;
  onClose: () => void;
  onLogout?: () => void;
  onWithdraw?: () => void;
  isWithdrawing?: boolean;
}) => {
  const [notifications, setNotifications] = useState(true);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  const handleClose = () => {
    setConfirmWithdraw(false);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={handleClose} title="설정">
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
          onClick={() => {
            onLogout?.();
            handleClose();
          }}
          className="flex w-full items-center gap-3 rounded-xl bg-destructive/10 p-4"
        >
          <LogOut className="h-5 w-5 text-destructive" />
          <span className="text-sm font-medium text-destructive">로그아웃</span>
        </button>
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-destructive">회원탈퇴</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                탈퇴 후 30일 안에 다시 로그인하면 계정을 복구할 수 있습니다.
              </p>
            </div>
          </div>
          {confirmWithdraw ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmWithdraw(false)}
                disabled={isWithdrawing}
                className="rounded-lg bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => onWithdraw?.()}
                disabled={isWithdrawing}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground disabled:opacity-50"
              >
                {isWithdrawing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                탈퇴하기
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmWithdraw(true)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-semibold text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              회원탈퇴
            </button>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};

// My posts sheet
export const MyPostsSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { data, isLoading } = useMyPosts({ enabled: open });
  const myPosts = (data?.pages ?? []).flatMap((page) => page.data).map(toUiPost);

  return (
    <BottomSheet open={open} onClose={onClose} title={`내 게시물 (${myPosts.length})`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">게시물을 불러오는 중입니다</p>
          </div>
        ) : myPosts.length === 0 ? (
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
