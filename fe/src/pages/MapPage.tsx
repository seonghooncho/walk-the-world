import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import CityCard from "@/components/shared/CityCard";
import MissionDetailModal from "@/components/shared/MissionDetailModal";
import { useAuth } from "@/contexts/AuthContext";
import { useBadges, useStepInfo } from "@/hooks/useApi";
import {
  buildGuestPreviewStepInfo,
  buildStaticMissionMap,
  findCityById,
  GUEST_PREVIEW_TOTAL_STEPS,
  getStaticCities,
  type UiMission,
} from "@/lib/city-utils";
import heroMapImg from "@/assets/hero-map.jpg";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const MapPage = () => {
  const { user, isLoggedIn } = useAuth();
  const [selectedMission, setSelectedMission] = useState<UiMission | null>(null);
  const { data: stepInfo, isLoading: isStepLoading } = useStepInfo();
  const { data: badgesResponse, isLoading: isBadgesLoading } = useBadges();
  const cities = useMemo(() => getStaticCities(), []);
  const guestStepInfo = useMemo(() => buildGuestPreviewStepInfo(cities), [cities]);
  const activeStepInfo = isLoggedIn ? stepInfo : guestStepInfo;
  const totalSteps = activeStepInfo?.totalSteps ?? user?.totalSteps ?? GUEST_PREVIEW_TOTAL_STEPS;
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

  const visitedCount = cities.filter((city) => totalSteps >= city.stepsRequired).length;
  const completionRate = cities.length > 0 ? Math.round((visitedCount / cities.length) * 100) : 0;

  return (
    <AppLayout>
      <div className="relative h-40 overflow-hidden">
        <img src={heroMapImg} alt="세계 노선도" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute bottom-4 left-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-lg font-bold text-white">🌍 나의 여행 노선도</h1>
            <p className="mt-0.5 text-[11px] text-white/70">서울에서 시작하여 지구 한바퀴를 돌아보세요</p>
          </motion.div>
        </div>
      </div>

      <div className="flex items-center justify-around border-b border-border bg-card py-3">
        {[
          { value: visitedCount, label: "방문 도시" },
          { value: cities.length, label: "전체 도시" },
          { value: `${completionRate}%`, label: "완료율", highlight: true },
        ].map((stat, index) => (
          <div key={stat.label} className="flex items-center gap-3">
            {index > 0 && <div className="h-5 w-px bg-border" />}
            <div className="text-center">
              <p className={`text-base font-bold ${stat.highlight ? "text-primary" : "text-foreground"}`}>{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 p-4">
        {cities.map((city, index) => (
          <CityCard
            key={city.id}
            city={city}
            missions={missions[city.id] || []}
            isUnlocked={totalSteps >= city.stepsRequired}
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
