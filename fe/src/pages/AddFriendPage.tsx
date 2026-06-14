import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, UserPlus } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import UserAvatar from "@/components/shared/UserAvatar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useAddFriend, usePublicProfile } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { toUiProfile } from "@/lib/city-utils";
import { toast } from "sonner";

const AddFriendPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const { user, isLoggedIn, requireLogin } = useAuth();
  const addFriend = useAddFriend();
  const targetUserId = Number(userId);
  const { data: profileData, isLoading } = usePublicProfile(targetUserId);
  const targetUser = profileData ? toUiProfile(profileData, { currentCityId: profileData.currentCityId }) : null;
  const isSelf = targetUser?.id === user?.id;
  const isAlreadyFriend = targetUser?.isFriend ?? false;

  const handleAddFriend = async () => {
    if (!targetUser) {
      return;
    }

    try {
      await addFriend.mutateAsync({ friendId: targetUser.id, method: "qr" });
      setDone(true);
      toast.success("친구가 되었습니다");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "친구 추가에 실패했습니다");
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (!isLoggedIn) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-sm text-muted-foreground">친구를 추가하려면 먼저 로그인해주세요</p>
          <button
            onClick={requireLogin}
            className="rounded-2xl bg-gradient-night px-6 py-3 text-sm font-bold text-white shadow-card"
          >
            로그인하기
          </button>
        </div>
      </AppLayout>
    );
  }

  if (!targetUser) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
          <p className="text-6xl">😕</p>
          <h1 className="mt-4 text-xl font-bold text-foreground">사용자를 찾을 수 없어요</h1>
          <p className="mt-2 text-sm text-muted-foreground">유효하지 않은 QR코드입니다</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-xl bg-gradient-hero px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
          >
            홈으로 돌아가기
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 pt-12">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          뒤로가기
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-sm rounded-3xl bg-card p-8 shadow-elevated"
        >
          <div className="flex flex-col items-center text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15 }}>
              <UserAvatar name={targetUser.name} avatar={targetUser.avatarUrl ?? undefined} size="lg" />
            </motion.div>
            <h2 className="mt-3 text-xl font-bold text-card-foreground">{targetUser.name}</h2>
            <p className="text-sm text-muted-foreground">
              스탬프 {Math.max(2, Math.round(targetUser.totalSteps / 120000))}개 · 세션 {Math.max(3, Math.round(targetUser.totalSteps / 70000))}회
            </p>
          </div>

          <div className="mt-5 flex justify-center">
            <div className="rounded-full bg-success/10 px-4 py-1.5 text-xs font-bold text-success">
              🎉 QR 친구 추가 - 무료!
            </div>
          </div>

          <div className="mt-6">
            {isSelf ? (
              <div className="rounded-xl bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">자기 자신은 추가할 수 없어요 😅</p>
              </div>
            ) : isAlreadyFriend || done ? (
              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <Check className="h-8 w-8 text-success" />
                </div>
                <p className="text-sm font-semibold text-card-foreground">이미 친구입니다! 🎉</p>
                <button
                  onClick={() => navigate("/city")}
                  className="w-full rounded-xl bg-muted py-3 text-sm font-medium text-muted-foreground"
                >
                  미션 피드로 이동
                </button>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => void handleAddFriend()}
                disabled={addFriend.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-hero py-4 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-40"
              >
                {addFriend.isPending ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    친구 추가하기
                  </>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default AddFriendPage;
