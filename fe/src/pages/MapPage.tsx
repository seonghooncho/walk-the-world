import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, LockKeyhole, MapPinned, Route, Stamp, Ticket } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import CityCard from "@/components/shared/CityCard";
import MissionDetailModal from "@/components/shared/MissionDetailModal";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useBadges, useStepInfo } from "@/hooks/useApi";
import {
  buildGuestPreviewStepInfo,
  buildPassportSnapshot,
  buildStaticMissionMap,
  findCityById,
  getStaticCities,
  isCityUnlockedByPassport,
  type UiMission,
} from "@/lib/city-utils";
import heroMapImg from "@/assets/hero-map.jpg";

const MapPage = () => {
  const { user, isLoggedIn } = useAuth();
  const [selectedMission, setSelectedMission] = useState<UiMission | null>(null);
  const { data: stepInfo, isLoading: isStepLoading } = useStepInfo();
  const { data: badgesResponse, isLoading: isBadgesLoading } = useBadges();
  const cities = useMemo(() => getStaticCities(), []);
  const guestStepInfo = useMemo(() => buildGuestPreviewStepInfo(cities), [cities]);
  const activeStepInfo = isLoggedIn ? stepInfo : guestStepInfo;
  const totalSteps = activeStepInfo?.totalSteps ?? user?.totalSteps ?? 450000;
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
  const passport = useMemo(
    () => buildPassportSnapshot(cities, totalSteps, completedMissionIds),
    [cities, completedMissionIds, totalSteps],
  );
  const currentCity = findCityById(cities, activeStepInfo?.currentCityId ?? user?.currentCityId ?? null);

  if ((isLoggedIn && (!user || isStepLoading || isBadgesLoading)) || !currentCity || !activeStepInfo) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  const nextCityLabel = passport.nextCity ? passport.nextCity.name : "세계 한 바퀴 완성";
  const passportCompletion = cities.length > 0 ? Math.round((passport.visitedCityIds.length / cities.length) * 100) : 0;

  return (
    <AppLayout>
      <div className="relative h-44 overflow-hidden">
        <img src={heroMapImg} alt="여행 여권 지도" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
        <div className="absolute bottom-4 left-4 right-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
              <Stamp className="h-3 w-3" />
              Passport map
            </div>
            <h1 className="text-xl font-extrabold text-white">스탬프를 모아 다음 도시를 여세요</h1>
            <p className="mt-1 text-[12px] leading-5 text-white/75">걸음 수 정확도보다 세션 완료와 증명 미션이 도시 진행을 만듭니다.</p>
          </motion.div>
        </div>
      </div>

      <div className="border-b border-border/70 bg-card px-4 py-4">
        <div className="rounded-2xl border border-border bg-background/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-primary">다음 여권 페이지</p>
              <div className="mt-1 flex min-w-0 items-center gap-2">
                <span className="truncate text-base font-extrabold text-foreground">
                  {currentCity.name}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-base font-extrabold text-muted-foreground">{nextCityLabel}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{passport.nextUnlockLabel}</p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <MapPinned className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-ocean" style={{ width: `${passportCompletion}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{passport.visitedCityIds.length}/{cities.length} 도시 오픈</span>
            <span>{passportCompletion}% passport</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-b border-border bg-card px-4 py-3">
        {[
          { icon: Ticket, value: passport.travelTickets, label: "티켓" },
          { icon: Stamp, value: passport.stampsEarned, label: "스탬프" },
          { icon: Route, value: passport.sessionsCompleted, label: "세션" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-secondary/70 p-3 text-center">
            <stat.icon className="mx-auto mb-1.5 h-4 w-4 text-primary" />
            <p className="font-num text-lg font-extrabold text-foreground">{stat.value}</p>
            <p className="text-[10px] font-medium text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2 p-4">
        <div className="rounded-2xl bg-card p-4 shadow-card">
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-bold text-card-foreground">도시 오픈 규칙</p>
              <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">
                세션으로 티켓을 모으고, proof mission으로 스탬프를 찍고, 일정 개수의 미션을 완료하면 다음 도시가 열립니다.
              </p>
            </div>
          </div>
        </div>

        {cities.map((city, index) => (
          <CityCard
            key={city.id}
            city={city}
            missions={missions[city.id] || []}
            isUnlocked={isCityUnlockedByPassport(city, totalSteps, completedMissionIds)}
            isCurrent={city.id === currentCity.id}
            index={index}
            defaultExpanded={city.id === currentCity.id}
            onMissionClick={setSelectedMission}
          />
        ))}
      </div>

      {selectedMission && <MissionDetailModal mission={selectedMission} onClose={() => setSelectedMission(null)} />}
    </AppLayout>
  );
};

export default MapPage;
