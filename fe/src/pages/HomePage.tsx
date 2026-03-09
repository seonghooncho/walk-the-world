import { useState } from "react";
import { motion } from "framer-motion";
import { Footprints, MapPin, Utensils, Flame, ArrowRight } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import StepProgressRing from "@/components/shared/StepProgressRing";
import FriendCouponBadge from "@/components/shared/FriendCouponBadge";
import SpotCarousel from "@/components/shared/SpotCarousel";
import MissionCard from "@/components/shared/MissionCard";
import MissionDetailModal from "@/components/shared/MissionDetailModal";
import {
  getCurrentCity,
  getNextCity,
  getProgress,
  formatSteps,
  cityUsers,
} from "@/mocks/mockData";
import { cityLandmarkImages, cityFoodImages } from "@/mocks/spotImages";
import { useAppStore } from "@/stores/appStore";
import type { Mission } from "@/mocks/missionData";
import cityTokyoImg from "@/assets/city-tokyo.jpg";
import { useNavigate } from "react-router-dom";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
});

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const user = useAppStore((s) => s.user);
  const missions = useAppStore((s) => s.missions);
  const coupons = useAppStore((s) => s.coupons);

  const city = getCurrentCity(user.totalSteps);
  const nextCity = getNextCity(user.totalSteps);
  const progress = getProgress(user.totalSteps);
  const stepsToNext = nextCity ? nextCity.stepsRequired - user.totalSteps : 0;
  const todaySteps = user.todaySteps ?? 8247;
  const activeMissions = (missions[city.id] || []).filter((m) => m.status === "available");

  return (
    <AppLayout>
      {/* Hero */}
      <div className="relative h-52 overflow-hidden">
        <img src={cityTokyoImg} alt={city.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute bottom-10 left-4 right-4">
          <motion.div {...fade(0)}>
            <p className="text-[11px] font-medium text-white/60 uppercase tracking-wider">현재 위치</p>
            <h1 className="text-xl font-bold text-white mt-0.5">
              {city.countryFlag} {city.name}, {city.country}
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="space-y-5 px-4 -mt-6 relative z-10">
        {/* Steps card */}
        <motion.div
          {...fade(0.1)}
          className="rounded-2xl bg-card p-5 shadow-elevated"
        >
          <div className="flex items-center gap-5">
            <StepProgressRing progress={progress} size={100} strokeWidth={5}>
              <div className="text-center">
                <Footprints className="mx-auto mb-0.5 h-4 w-4 text-primary" />
                <p className="text-lg font-bold text-card-foreground">{formatSteps(user.totalSteps)}</p>
              </div>
            </StepProgressRing>

            <div className="flex-1 space-y-3">
              <div>
                <p className="text-[11px] text-muted-foreground">오늘 걸음</p>
                <p className="text-xl font-bold text-card-foreground">{todaySteps.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[11px] text-muted-foreground">{nextCity?.name}까지</p>
                  <p className="text-sm font-semibold text-primary">{formatSteps(stepsToNext)}</p>
                </div>
                <div className="h-6 w-px bg-border" />
                <div>
                  <p className="text-[11px] text-muted-foreground">연속</p>
                  <div className="flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-destructive" />
                    <p className="text-sm font-semibold text-card-foreground">{user.streakDays ?? 7}일</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick actions – bento grid */}
        <motion.div {...fade(0.2)} className="grid grid-cols-5 gap-2.5">
          <button
            onClick={() => navigate("/city")}
            className="col-span-3 flex items-center gap-3 rounded-xl bg-card p-3.5 transition-shadow hover:shadow-elevated"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ocean/10">
              <MapPin className="h-4 w-4 text-ocean" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-[13px] font-semibold text-card-foreground">도시 커뮤니티</p>
              <p className="text-[11px] text-muted-foreground">{cityUsers.length + 1}명 접속 중</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/map")}
            className="col-span-2 flex items-center gap-2.5 rounded-xl bg-card p-3.5 transition-shadow hover:shadow-elevated"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-earth/10">
              <Utensils className="h-4 w-4 text-earth" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-[13px] font-semibold text-card-foreground">맛집</p>
              <p className="text-[11px] text-muted-foreground truncate">{city.famousFood[0]}</p>
            </div>
          </button>
        </motion.div>

        {/* Coupon */}
        <motion.button
          {...fade(0.25)}
          onClick={() => navigate("/city")}
          className="flex w-full items-center justify-between rounded-xl bg-card p-3.5 transition-shadow hover:shadow-elevated"
        >
          <FriendCouponBadge count={coupons} />
          <span className="text-[11px] text-muted-foreground">이번 주 남은 쿠폰</span>
        </motion.button>

        {/* Active missions */}
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
              {activeMissions.slice(0, 4).map((mission, i) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  index={i}
                  onClick={(m) => setSelectedMission(m)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Landmarks */}
        <motion.div {...fade(0.35)}>
          <SpotCarousel
            title={`${city.name} 명소`}
            emoji="🏛️"
            items={cityLandmarkImages[city.id] || city.landmarks.map((l) => ({ name: l, image: cityTokyoImg }))}
            maxVisible={3}
          />
        </motion.div>

        {/* Famous food */}
        <motion.div {...fade(0.4)}>
          <SpotCarousel
            title={`${city.name} 맛집`}
            emoji="🍜"
            items={cityFoodImages[city.id] || city.famousFood.map((f) => ({ name: f, image: cityTokyoImg }))}
            maxVisible={3}
          />
        </motion.div>

        {/* Bottom spacer */}
        <div className="h-2" />
      </div>

      {selectedMission && (
        <MissionDetailModal
          mission={selectedMission}
          onClose={() => setSelectedMission(null)}
        />
      )}
    </AppLayout>
  );
};

export default HomePage;
