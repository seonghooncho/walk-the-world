import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Award, ChevronRight, Footprints, Globe, QrCode, ScanLine, Settings, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import UserAvatar from "@/components/shared/UserAvatar";
import StepProgressRing from "@/components/shared/StepProgressRing";
import { SettingsSheet, MyPostsSheet } from "@/components/shared/ProfileSheets";
import QRCodeModal from "@/components/shared/QRCodeModal";
import QRScannerModal from "@/components/shared/QRScannerModal";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useLogout, useMe, useStepInfo } from "@/hooks/useApi";
import { findCityById, getProgressPercent, getStaticCities } from "@/lib/city-utils";
import { toast } from "sonner";

const ProfilePage = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn, requireLogin } = useAuth();
  const { data: user, isLoading } = useMe();
  const { data: stepInfo } = useStepInfo();
  const logout = useLogout();
  const cities = useMemo(() => getStaticCities(), []);
  const currentCity = findCityById(cities, user?.currentCityId ?? null);
  const progress = user ? getProgressPercent(cities, user.totalSteps, user.currentCityId) : 50;

  useEffect(() => {
    if (!isLoggedIn) {
      requireLogin();
    }
  }, [isLoggedIn, requireLogin]);

  const handleLogout = async () => {
    await logout.mutateAsync();
    toast.success("로그아웃 되었습니다");
    navigate("/login");
  };

  if (!isLoggedIn) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <p className="text-sm text-muted-foreground">로그인이 필요합니다</p>
        </div>
      </AppLayout>
    );
  }

  if (isLoading || !user) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  const stats = [
    { icon: Footprints, label: "총 걸음 수", value: user.totalSteps.toLocaleString() },
    { icon: Globe, label: "현재 도시", value: currentCity ? `${currentCity.countryFlag} ${currentCity.name}` : user.currentCityId },
    { icon: Users, label: "친구", value: `${user.friendCount}명` },
    { icon: Award, label: "재화", value: `쿠폰 ${user.coupons}개 / 하트 ${user.hearts}개` },
  ];

  const menuItems = [
    { label: "내 게시물", action: () => setShowMyPosts(true) },
    { label: "배지 컬렉션", action: () => navigate("/profile/badges") },
    { label: "알림 설정", action: () => setShowSettings(true) },
    { label: "도움말", action: () => toast.info("서비스 지원 채널로 문의해주세요") },
    { label: "로그아웃", action: handleLogout },
  ];

  return (
    <AppLayout>
      <div className="border-b border-border bg-card px-4 pb-8 pt-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">프로필</h1>
          <button onClick={() => setShowSettings(true)} className="text-muted-foreground">
            <Settings className="h-5 w-5" />
          </button>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
          <StepProgressRing progress={stepInfo ? stepInfo.progressPercent : progress} size={110} strokeWidth={5}>
            <UserAvatar name={user.name} avatar={user.avatarUrl ?? undefined} size="lg" />
          </StepProgressRing>
          <h2 className="mt-3 text-lg font-bold text-foreground">{user.name}</h2>
          <p className="text-[13px] text-muted-foreground">
            {currentCity ? `${currentCity.countryFlag} ${currentCity.name}에서 여행 중` : `${user.currentCityId}에서 여행 중`}
          </p>
        </motion.div>

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
        <div className="grid grid-cols-2 gap-2.5">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="rounded-xl bg-card p-4"
            >
              <stat.icon className="mb-1.5 h-4 w-4 text-muted-foreground" />
              <p className="text-lg font-bold text-card-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-px overflow-hidden rounded-xl"
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

      <SettingsSheet open={showSettings} onClose={() => setShowSettings(false)} onLogout={handleLogout} />
      <MyPostsSheet open={showMyPosts} onClose={() => setShowMyPosts(false)} />
      <QRCodeModal open={showQR} onClose={() => setShowQR(false)} />
      <QRScannerModal open={showScanner} onClose={() => setShowScanner(false)} />
    </AppLayout>
  );
};

export default ProfilePage;
