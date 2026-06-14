import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Footprints, LogIn, MapPinned, MessageCircle, Target, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import MissionCard from "@/components/shared/MissionCard";
import SpotCarousel from "@/components/shared/SpotCarousel";
import UserAvatar from "@/components/shared/UserAvatar";
import {
  buildGuestPreviewStepInfo,
  buildStaticMissionMap,
  findCityById,
  getCityFoodItems,
  getCityLandmarkItems,
  getStaticCities,
} from "@/lib/city-utils";
import cityTokyoImg from "@/assets/city-tokyo.jpg";

type DemoTab = "journey" | "missions" | "city";

const tabs: Array<{ key: DemoTab; label: string }> = [
  { key: "journey", label: "여정" },
  { key: "missions", label: "미션" },
  { key: "city", label: "도시" },
];

const demoMembers = [
  { name: "민서", steps: "82K", note: "라멘 미션 완료" },
  { name: "준호", steps: "76K", note: "시부야 인증 대기" },
  { name: "하린", steps: "69K", note: "도쿄 타워 기록" },
];

const DemoPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DemoTab>("journey");
  const cities = useMemo(() => getStaticCities(), []);
  const stepInfo = useMemo(() => buildGuestPreviewStepInfo(cities), [cities]);
  const city = findCityById(cities, stepInfo.currentCityId) ?? cities[0];
  const missions = useMemo(() => buildStaticMissionMap(stepInfo.totalSteps, new Set<string>()), [stepInfo.totalSteps]);
  const activeMissions = missions[city.id] ?? [];

  return (
    <AppLayout hideNav>
      <header className="app-layer-header sticky top-0 border-b border-border/60 bg-card/90 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="pressable flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="홈으로 이동"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-primary">둘러보기</p>
            <h1 className="truncate text-[17px] font-bold text-foreground">walk2world 데모</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/login?redirect=${encodeURIComponent("/")}`)}
            className="pressable flex items-center gap-1.5 rounded-xl bg-foreground px-3 py-2 text-xs font-bold text-background"
          >
            <LogIn className="h-3.5 w-3.5" />
            로그인
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1 px-4 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`pressable rounded-xl py-2 text-[12px] font-bold ${
                activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="space-y-5 px-4 py-4">
        {activeTab === "journey" && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="relative h-52 overflow-hidden rounded-2xl">
              <img src={cityTokyoImg} alt="도쿄" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-[11px] font-semibold text-white/70">현재 preview 도시</p>
                <h2 className="mt-1 text-2xl font-extrabold">{city.countryFlag} {city.name}</h2>
                <p className="mt-1 text-[13px] text-white/75">{stepInfo.nextCityName}까지 {stepInfo.stepsToNextCity.toLocaleString()}보</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Footprints, label: "누적", value: `${stepInfo.totalSteps.toLocaleString()}보` },
                { icon: MapPinned, label: "현재", value: city.name },
                { icon: Trophy, label: "진행률", value: `${Math.round(stepInfo.progressPercent)}%` },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-card p-3 shadow-card">
                  <item.icon className="mb-2 h-4 w-4 text-primary" />
                  <p className="text-[11px] text-muted-foreground">{item.label}</p>
                  <p className="font-num mt-0.5 truncate text-sm font-bold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate("/map")}
              className="pressable flex w-full items-center justify-between rounded-2xl bg-card p-4 text-left shadow-card"
            >
              <span>
                <span className="block text-sm font-bold text-foreground">전체 노선도 보기</span>
                <span className="text-[12px] text-muted-foreground">서울에서 세계 한 바퀴까지 이어지는 체크포인트</span>
              </span>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </motion.section>
        )}

        {activeTab === "missions" && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-2xl bg-card p-4 shadow-card">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-base font-bold text-foreground">도쿄 미션</h2>
                  <p className="text-[12px] text-muted-foreground">사진, 맛집, 기록 미션으로 도시 배지를 모읍니다.</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {activeMissions.slice(0, 4).map((mission, index) => (
                <MissionCard key={mission.id} mission={mission} index={index} />
              ))}
            </div>
            <SpotCarousel title="도쿄 명소" emoji="🏛️" items={getCityLandmarkItems(city)} maxVisible={3} />
            <SpotCarousel title="도쿄 맛집" emoji="🍜" items={getCityFoodItems(city)} maxVisible={3} />
          </motion.section>
        )}

        {activeTab === "city" && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="rounded-2xl bg-gradient-ocean p-4 text-white">
              <MessageCircle className="mb-3 h-5 w-5" />
              <h2 className="text-lg font-bold">같은 도시에 있는 여행자</h2>
              <p className="mt-1 text-[12px] leading-5 text-white/75">미션 인증과 맛집 기록이 도시 커뮤니티로 모입니다.</p>
            </div>
            {demoMembers.map((member) => (
              <div key={member.name} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
                <UserAvatar name={member.name} size="md" showOnline />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">{member.name}</p>
                  <p className="truncate text-[12px] text-muted-foreground">{member.steps} 보 · {member.note}</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/login?redirect=${encodeURIComponent("/city")}`)}
                  className="pressable rounded-xl bg-secondary px-3 py-2 text-[11px] font-bold text-secondary-foreground"
                >
                  친구
                </button>
              </div>
            ))}
          </motion.section>
        )}
      </main>
    </AppLayout>
  );
};

export default DemoPage;
