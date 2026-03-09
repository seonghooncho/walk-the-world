import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Check, LogIn, ArrowLeft } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import UserAvatar from "@/components/shared/UserAvatar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useAppStore } from "@/stores/appStore";
import { cityUsers } from "@/mocks/mockData";
import { toast } from "sonner";

const AddFriendPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const addFriendFree = useAppStore((s) => s.addFriendFree);
  const [adding, setAdding] = useState(false);
  const [done, setDone] = useState(false);

  // Simulate "logged in" state — in real app, check auth token
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Find target user from mock data (will be replaced by API call)
  const allUsers = [user, ...cityUsers];
  const targetUser = allUsers.find((u) => u.id === userId);

  const isSelf = userId === user.id;
  const isAlreadyFriend = user.friends.includes(userId || "");

  const handleAddFriend = () => {
    if (!userId) return;
    setAdding(true);
    setTimeout(() => {
      const result = addFriendFree(userId);
      setAdding(false);
      if (result.success) {
        setDone(true);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }, 800);
  };

  const handleMockLogin = () => {
    setIsLoggedIn(true);
    toast.success("로그인 되었습니다! (데모)");
  };

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
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          뒤로가기
        </button>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-sm rounded-3xl bg-card p-8 shadow-elevated"
        >
          {/* Target user info */}
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <UserAvatar name={targetUser.name} size="lg" />
            </motion.div>
            <h2 className="mt-3 text-xl font-bold text-card-foreground">{targetUser.name}</h2>
            <p className="text-sm text-muted-foreground">
              {(targetUser.totalSteps / 1000).toFixed(0)}K 보 걸음
            </p>
          </div>

          {/* Free badge */}
          <div className="mt-5 flex justify-center">
            <div className="rounded-full bg-success/10 px-4 py-1.5 text-xs font-bold text-success">
              🎉 QR 친구 추가 — 무료!
            </div>
          </div>

          {/* Action area */}
          <div className="mt-6">
            {!isLoggedIn ? (
              /* Not logged in */
              <div className="space-y-3">
                <p className="text-center text-sm text-muted-foreground">
                  친구를 추가하려면 먼저 로그인해주세요
                </p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleMockLogin}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-night py-4 text-sm font-bold text-white shadow-card"
                >
                  <LogIn className="h-5 w-5" />
                  로그인하기
                </motion.button>
              </div>
            ) : isSelf ? (
              /* Self */
              <div className="rounded-xl bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">자기 자신은 추가할 수 없어요 😅</p>
              </div>
            ) : isAlreadyFriend || done ? (
              /* Already friends or just added */
              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <Check className="h-8 w-8 text-success" />
                </div>
                <p className="text-sm font-semibold text-card-foreground">이미 친구입니다! 🎉</p>
                <button
                  onClick={() => navigate("/city")}
                  className="w-full rounded-xl bg-muted py-3 text-sm font-medium text-muted-foreground"
                >
                  도시 커뮤니티로 이동
                </button>
              </div>
            ) : (
              /* Can add friend */
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddFriend}
                disabled={adding}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-hero py-4 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-40"
              >
                {adding ? (
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
