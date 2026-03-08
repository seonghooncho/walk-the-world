import { useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import CityCard from "@/components/shared/CityCard";
import MissionDetailModal from "@/components/shared/MissionDetailModal";
import { cities, getCurrentCity } from "@/data/mockData";
import { useAppStore } from "@/stores/appStore";
import type { Mission } from "@/data/missionData";
import heroMapImg from "@/assets/hero-map.jpg";

const MapPage = () => {
  const user = useAppStore((s) => s.user);
  const currentCity = getCurrentCity(user.totalSteps);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const missions = useAppStore((s) => s.missions);

  const visitedCount = cities.filter((c) => user.totalSteps >= c.stepsRequired).length;
  const completionRate = Math.round((visitedCount / cities.length) * 100);

  return (
    <AppLayout>
      {/* Hero */}
      <div className="relative h-40 overflow-hidden">
        <img src={heroMapImg} alt="세계 노선도" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute bottom-4 left-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-lg font-bold text-white">🌍 나의 여행 노선도</h1>
            <p className="text-[11px] text-white/70 mt-0.5">서울에서 시작하여 지구 한바퀴를 돌아보세요</p>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-around bg-card py-3 border-b border-border">
        {[
          { value: visitedCount, label: "방문 도시" },
          { value: cities.length, label: "전체 도시" },
          { value: `${completionRate}%`, label: "완료율", highlight: true },
        ].map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-3">
            {i > 0 && <div className="h-5 w-px bg-border" />}
            <div className="text-center">
              <p className={`text-base font-bold ${stat.highlight ? "text-primary" : "text-foreground"}`}>
                {stat.value}
              </p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* City list */}
      <div className="space-y-2 p-4">
        {cities.map((city, i) => (
          <CityCard
            key={city.id}
            city={city}
            isUnlocked={user.totalSteps >= city.stepsRequired}
            isCurrent={city.id === currentCity.id}
            index={i}
            defaultExpanded={city.id === currentCity.id}
            onMissionClick={(m) => setSelectedMission(m)}
          />
        ))}
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

export default MapPage;
