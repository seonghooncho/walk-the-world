import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Footprints, MapPin, Utensils, ArrowRight, Trophy, Ticket } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import StepProgressRing from "@/components/shared/StepProgressRing";
import FriendCouponBadge from "@/components/shared/FriendCouponBadge";
import SpotCarousel from "@/components/shared/SpotCarousel";
import MissionCard from "@/components/shared/MissionCard";
import MissionDetailModal from "@/components/shared/MissionDetailModal";
import { useAuth } from "@/contexts/AuthContext";
import { useBadges, useCityMembers, useCurrency, useStepInfo } from "@/hooks/useApi";
import {
  buildStaticMissionMap,
  findCityById,
  getCityFoodItems,
  getCityLandmarkItems,
  getStaticCities,
  type UiMission,
} from "@/lib/city-utils";
import cityTokyoImg from "@/assets/city-tokyo.jpg";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
});

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, requireLogin } = useAuth();
  const [selectedMission, setSelectedMission] = useState<UiMission | null>(null);
  const { data: stepInfo, isLoading: isStepLoading } = useStepInfo();
  const { data: currency } = useCurrency();
  const { data: badgesResponse, isLoading: isBadgesLoading } = useBadges();
  const cities = useMemo(() => getStaticCities(), []);
  const totalSteps = stepInfo?.totalSteps ?? user?.totalSteps ?? 0;
  const completedMissionIds = useMemo(
    () =>
      new Set(
        (badgesResponse?.badges ?? [])
          .filter((badge) => badge.earned)
          .map((badge) => badge.missionId),
      ),
    [badgesResponse],
  );
  const missions = useMemo(
    () => buildStaticMissionMap(totalSteps, completedMissionIds),
    [completedMissionIds, totalSteps],
  );
  const currentCity = findCityById(cities, stepInfo?.currentCityId ?? user?.currentCityId ?? null);
  const { data: cityMembers } = useCityMembers(currentCity?.id ?? "");

  if (!isLoggedIn) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
          <p className="text-sm text-muted-foreground">로그인이 필요합니다</p>
          <button
            onClick={requireLogin}
            className="rounded-xl bg-gradient-hero px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            로그인하기
          </button>
        </div>
      </AppLayout>
    );
  }

  if (!user || !stepInfo || !currentCity || isStepLoading || isBadgesLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  const progress = stepInfo.progressPercent;
  const activeMissions = (missions[currentCity.id] || []).filter((mission) => mission.status === "available");
  const memberCount = (cityMembers?.length ?? 0) + 1;
  const nextCityName = stepInfo.nextCityName ?? "최종 도시";

  return (
    <AppLayout>
      <div className="relative h-52 overflow-hidden">
        <img src={cityTokyoImg} alt={currentCity.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute bottom-10 left-4 right-4">
          <motion.div {...fade(0)}>
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/60">현재 위치</p>
            <h1 className="mt-0.5 text-xl font-bold text-white">
              {currentCity.countryFlag} {currentCity.name}, {currentCity.country}
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 -mt-6 space-y-5 px-4">
        <motion.div {...fade(0.1)} className="rounded-2xl bg-card p-5 shadow-elevated">
          <div className="flex items-center gap-5">
            <StepProgressRing progress={progress} size={100} strokeWidth={5}>
              <div className="text-center">
                <Footprints className="mx-auto mb-0.5 h-4 w-4 text-primary" />
                <p className="text-lg font-bold text-card-foreground">{user.totalSteps.toLocaleString()}</p>
              </div>
            </StepProgressRing>

            <div className="flex-1 space-y-3">
              <div>
                <p className="text-[11px] text-muted-foreground">다음 도시</p>
                <p className="text-xl font-bold text-card-foreground">{nextCityName}</p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[11px] text-muted-foreground">{nextCityName}까지</p>
                  <p className="text-sm font-semibold text-primary">{stepInfo.stepsToNextCity.toLocaleString()} 보</p>
                </div>
                <div className="h-6 w-px bg-border" />
                <div>
                  <p className="text-[11px] text-muted-foreground">진행률</p>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3.5 w-3.5 text-gold" />
                    <p className="text-sm font-semibold text-card-foreground">{Math.round(progress)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div {...fade(0.2)} className="grid grid-cols-5 gap-2.5">
          <button
            onClick={() => navigate("/city")}
            className="col-span-3 flex items-center gap-3 rounded-xl bg-card p-3.5 transition-shadow hover:shadow-elevated"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ocean/10">
              <MapPin className="h-4 w-4 text-ocean" />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[13px] font-semibold text-card-foreground">도시 커뮤니티</p>
              <p className="text-[11px] text-muted-foreground">{memberCount}명 활동 중</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/map")}
            className="col-span-2 flex items-center gap-2.5 rounded-xl bg-card p-3.5 transition-shadow hover:shadow-elevated"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-earth/10">
              <Utensils className="h-4 w-4 text-earth" />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[13px] font-semibold text-card-foreground">맛집</p>
              <p className="truncate text-[11px] text-muted-foreground">{currentCity.famousFood[0]}</p>
            </div>
          </button>
        </motion.div>

        <motion.button
          {...fade(0.25)}
          onClick={() => navigate("/city")}
          className="flex w-full items-center justify-between rounded-xl bg-card p-3.5 transition-shadow hover:shadow-elevated"
        >
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" />
            <FriendCouponBadge count={currency?.coupons ?? user.coupons} />
          </div>
          <span className="text-[11px] text-muted-foreground">이번 주 남은 쿠폰</span>
        </motion.button>

        {activeMissions.length > 0 && (
          <motion.div {...fade(0.3)}>
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-foreground">🎯 진행 중인 미션</h2>
              <button onClick={() => navigate("/map")} className="flex items-center gap-0.5 text-xs font-medium text-muted-foreground">
                전체 보기
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {activeMissions.slice(0, 4).map((mission, index) => (
                <MissionCard key={mission.id} mission={mission} index={index} onClick={setSelectedMission} />
              ))}
            </div>
          </motion.div>
        )}

        <motion.div {...fade(0.35)}>
          <SpotCarousel title={`${currentCity.name} 명소`} emoji="🏛️" items={getCityLandmarkItems(currentCity)} maxVisible={3} />
        </motion.div>

        <motion.div {...fade(0.4)}>
          <SpotCarousel title={`${currentCity.name} 맛집`} emoji="🍜" items={getCityFoodItems(currentCity)} maxVisible={3} />
        </motion.div>

        <div className="h-2" />
      </div>

      {selectedMission && <MissionDetailModal mission={selectedMission} onClose={() => setSelectedMission(null)} />}
    </AppLayout>
  );
};

export default HomePage;
