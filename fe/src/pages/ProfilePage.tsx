import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Images, QrCode, Route, ScanLine, Settings, Stamp, Ticket, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import UserAvatar from "@/components/shared/UserAvatar";
import { SettingsSheet, MyPostsSheet } from "@/components/shared/ProfileSheets";
import QRCodeModal from "@/components/shared/QRCodeModal";
import QRScannerModal from "@/components/shared/QRScannerModal";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useBadges, useLogout, useMe, useWithdrawAccount } from "@/hooks/useApi";
import { buildPassportSnapshot, findCityById, getStaticCities } from "@/lib/city-utils";
import { passportProgress } from "@/mocks/mockData";
import { toast } from "sonner";

const ProfilePage = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn, requireLogin } = useAuth();
  const { data: user, isLoading } = useMe();
  const { data: badgesResponse, isLoading: isBadgesLoading } = useBadges();
  const logout = useLogout();
  const withdrawAccount = useWithdrawAccount();
  const cities = useMemo(() => getStaticCities(), []);
  const completedMissionIds = useMemo(
    () =>
      new Set(
        (badgesResponse?.badges ?? [])
          .filter((badge) => badge.earned)
          .map((badge) => badge.missionId),
      ),
    [badgesResponse],
  );
  const passport = useMemo(
    () => buildPassportSnapshot(cities, user?.totalSteps ?? 450000, completedMissionIds),
    [cities, completedMissionIds, user?.totalSteps],
  );
  const currentCity = findCityById(cities, user?.currentCityId ?? null);
  const visitedCities = cities.filter((city) => passport.visitedCityIds.includes(city.id)).slice(0, 6);

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

  const handleWithdraw = async () => {
    try {
      await withdrawAccount.mutateAsync();
      toast.success("회원탈퇴가 처리되었습니다");
      setShowSettings(false);
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "회원탈퇴 처리에 실패했습니다");
    }
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

  if (isLoading || isBadgesLoading || !user) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  const stats = [
    { icon: Ticket, label: "여행 티켓", value: `${passport.travelTickets}장` },
    { icon: Stamp, label: "도시 스탬프", value: `${passport.stampsEarned}개` },
    { icon: Route, label: "완료 세션", value: `${passport.sessionsCompleted}회` },
    { icon: Users, label: "여행 친구", value: `${user.friendCount}명` },
  ];

  const menuItems = [
    { label: "내 미션 인증", action: () => setShowMyPosts(true) },
    { label: "스탬프 컬렉션", action: () => navigate("/profile/badges") },
    { label: "알림 설정", action: () => setShowSettings(true) },
    { label: "도움말", action: () => toast.info("서비스 지원 채널로 문의해주세요") },
    { label: "로그아웃", action: handleLogout },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="여행 여권"
        subtitle="세션, 스탬프, 미션 인증을 모아보세요"
        rightElement={
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="pressable flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="설정 열기"
          >
            <Settings className="h-5 w-5" />
          </button>
        }
      />

      <div className="px-4 pb-4 pt-3">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl bg-gradient-night text-white shadow-elevated"
        >
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/55">walk2world passport</p>
                <h2 className="mt-2 text-2xl font-extrabold">{user.name}</h2>
                <p className="mt-1 text-[13px] text-white/70">
                  {currentCity ? `${currentCity.name} 테마 여행 중` : `${user.currentCityId} 여행 중`}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-2 backdrop-blur">
                <UserAvatar name={user.name} avatar={user.avatarUrl ?? undefined} size="lg" />
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-white/10 p-4">
              <div className="mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-white/80" />
                <p className="text-sm font-bold">다음 도시 오픈</p>
              </div>
              <p className="text-[12px] leading-5 text-white/70">{passport.nextUnlockLabel}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${Math.min(100, Math.round((passport.visitedCityIds.length / cities.length) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      <div className="space-y-4 px-4 pb-4">
        <div className="grid grid-cols-2 gap-2.5">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="rounded-xl bg-card p-4 shadow-card"
            >
              <stat.icon className="mb-1.5 h-4 w-4 text-primary" />
              <p className="text-lg font-extrabold text-card-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl bg-card p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stamp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-extrabold text-card-foreground">방문 도시 스탬프</h3>
            </div>
            <span className="text-[11px] text-muted-foreground">{visitedCities.length} cities</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {visitedCities.map((city) => (
              <div key={city.id} className="rounded-xl bg-secondary/70 p-3 text-center">
                <p className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-extrabold text-primary">
                  {city.name.slice(0, 1)}
                </p>
                <p className="mt-1 truncate text-[11px] font-bold text-foreground">{city.name}</p>
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{city.cityTheme}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }} className="rounded-2xl bg-card p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <Images className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-extrabold text-card-foreground">대표 미션 사진</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {passportProgress.representativePhotos.map((photo) => (
              <div key={photo.id} className="overflow-hidden rounded-xl bg-secondary">
                <img src={photo.image} alt={photo.missionTitle} className="h-24 w-full object-cover" />
                <p className="truncate px-2 py-2 text-[11px] font-semibold text-secondary-foreground">{photo.missionTitle}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-2.5"
        >
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-[13px] font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <QrCode className="h-4 w-4" />
            여행자 QR
          </button>
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground"
          >
            <ScanLine className="h-4 w-4" />
            QR 스캔
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
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

      <SettingsSheet
        open={showSettings}
        onClose={() => setShowSettings(false)}
        onLogout={handleLogout}
        onWithdraw={handleWithdraw}
        isWithdrawing={withdrawAccount.isPending}
      />
      <MyPostsSheet open={showMyPosts} onClose={() => setShowMyPosts(false)} />
      <QRCodeModal open={showQR} onClose={() => setShowQR(false)} />
      <QRScannerModal open={showScanner} onClose={() => setShowScanner(false)} />
    </AppLayout>
  );
};

export default ProfilePage;
