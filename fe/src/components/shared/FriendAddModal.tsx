import { useState } from "react";
import { Heart, Ticket, UserPlus, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserAvatar from "./UserAvatar";
import LoadingSpinner from "./LoadingSpinner";
import { useAddFriend, useCurrency } from "@/hooks/useApi";
import type { UiProfile } from "@/lib/city-utils";
import { toast } from "sonner";

interface FriendAddModalProps {
  targetUser: UiProfile | null;
  sameCityCost: boolean;
  onClose: () => void;
}

const FriendAddModal = ({ targetUser, sameCityCost, onClose }: FriendAddModalProps) => {
  const [adding, setAdding] = useState(false);
  const addFriend = useAddFriend();
  const { data: currency } = useCurrency();
  const coupons = currency?.coupons ?? 0;
  const hearts = currency?.hearts ?? 0;

  if (!targetUser) return null;

  const costLabel = sameCityCost ? "쿠폰 1장" : "하트 2개";
  const hasEnough = sameCityCost ? coupons >= 1 : hearts >= 2;

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addFriend.mutateAsync({
        friendId: targetUser.id,
        method: sameCityCost ? "same_city" : "different_city",
      });
      toast.success("친구가 되었습니다");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "친구 추가에 실패했습니다");
    } finally {
      setAdding(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-elevated"
        >
          <div className="flex flex-col items-center text-center">
            <UserAvatar name={targetUser.name} avatar={targetUser.avatarUrl ?? undefined} size="lg" />
            <h3 className="mt-3 text-lg font-bold text-card-foreground">{targetUser.name}</h3>
            <p className="text-xs text-muted-foreground">친구 요청을 보낼까요?</p>
          </div>

          <div className="mt-5 rounded-xl bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {sameCityCost ? (
                  <Ticket className="h-5 w-5 text-primary" />
                ) : (
                  <Heart className="h-5 w-5 text-accent" />
                )}
                <span className="text-sm font-medium text-card-foreground">비용: {costLabel}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                보유: {sameCityCost ? `${coupons}장` : `${hearts}개`}
              </span>
            </div>
            {!hasEnough && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>잔액이 부족합니다</span>
              </div>
            )}
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-muted py-3 text-sm font-medium text-muted-foreground"
            >
              취소
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAdd}
              disabled={!hasEnough || adding}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-hero py-3 text-sm font-bold text-primary-foreground disabled:opacity-40"
            >
              {adding ? (
                <LoadingSpinner size="h-4 w-4" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  친구 추가
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FriendAddModal;
