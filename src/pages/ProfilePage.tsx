import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings, ChevronRight, Footprints, Globe, Users, QrCode, ScanLine, Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import UserAvatar from "@/components/shared/UserAvatar";
import StepProgressRing from "@/components/shared/StepProgressRing";
import { SettingsSheet, MyPostsSheet } from "@/components/shared/ProfileSheets";
import QRCodeModal from "@/components/shared/QRCodeModal";
import QRScannerModal from "@/components/shared/QRScannerModal";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useMe } from "@/hooks/useApi";
import { toast } from "sonner";

const ProfilePage = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();
  const { logout, isLoggedIn, requireLogin } = useAuth();
  const { data: user, isLoading } = useMe();

  // Require login
  useEffect(() => {
    if (!isLoggedIn) {
      requireLogin();
    }
  }, [isLoggedIn, requireLogin]);

  const handleLogout = () => {
    logout();
    toast.success("로그아웃 되었습니다");
    navigate("/login");
  };

  if (!isLoggedIn) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground text-sm">로그인이 필요합니다</p>
        </div>
      </AppLayout>
    );
  }

  if (isLoading || !user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  const stats = [
    { icon: Footprints, label: "총 걸음 수", value: user.totalSteps.toLocaleString() },
    { icon: Globe, label: "현재 도시", value: user.currentCityId },
    { icon: Users, label: "친구", value: `${user.friendCount}명` },
    { icon: Award, label: "쿠폰", value: `${user.coupons}개` },
  ];

  const menuItems = [
    { label: "내 게시물", action: () => setShowMyPosts(true) },
    { label: "배지 컬렉션", action: () => navigate("/profile/badges") },
    { label: "알림 설정", action: () => setShowSettings(true) },
    { label: "도움말", action: () => toast.info("walkworld@support.com 으로 문의해주세요") },
    { label: "로그아웃", action: handleLogout },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-card px-4 pb-8 pt-12 border-b border-border">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">프로필</h1>
          <button onClick={() => setShowSettings(true)} className="text-muted-foreground">
            <Settings className="h-5 w-5" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <StepProgressRing progress={0.5} size={110} strokeWidth={5}>
            <UserAvatar name={user.name} size="lg" />
          </StepProgressRing>
          <h2 className="mt-3 text-lg font-bold text-foreground">{user.name}</h2>
          <p className="text-[13px] text-muted-foreground">
            {user.currentCityId}에서 여행 중
          </p>
        </motion.div>

        {/* QR Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-5 flex justify-center gap-2.5"
        >
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-[13px] font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <QrCode className="h-4 w-4" />
            내 QR코드
          </button>
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground"
          >
            <ScanLine className="h-4 w-4" />
            QR 스캔
          </button>
        </motion.div>
      </div>

      <div className="space-y-4 p-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl bg-card p-4"
            >
              <stat.icon className="mb-1.5 h-4 w-4 text-muted-foreground" />
              <p className="text-lg font-bold text-card-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Menu */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-px rounded-xl overflow-hidden"
        >
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex w-full items-center justify-between bg-card px-4 py-3.5 transition-colors hover:bg-secondary/40"
            >
              <span className="text-[13px] font-medium text-card-foreground">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </motion.div>
      </div>

      <SettingsSheet open={showSettings} onClose={() => setShowSettings(false)} />
      <MyPostsSheet open={showMyPosts} onClose={() => setShowMyPosts(false)} />
      <QRCodeModal open={showQR} onClose={() => setShowQR(false)} />
      <QRScannerModal open={showScanner} onClose={() => setShowScanner(false)} />
    </AppLayout>
  );
};

export default ProfilePage;
