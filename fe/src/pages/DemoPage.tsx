import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Camera, LogIn, MessageCircle, Route, Stamp, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import MissionCard from "@/components/shared/MissionCard";
import PostCard from "@/components/shared/PostCard";
import {
  buildGuestPreviewStepInfo,
  buildPassportSnapshot,
  buildStaticMissionMap,
  findCityById,
  getStaticCities,
  mockProofPosts,
} from "@/lib/city-utils";
import { suggestedSessions } from "@/mocks/mockData";

type DemoTab = "trip" | "missions" | "feed";

const tabs: Array<{ key: DemoTab; label: string }> = [
  { key: "trip", label: "세션" },
  { key: "missions", label: "미션" },
  { key: "feed", label: "피드" },
];

const DemoPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DemoTab>("trip");
  const cities = useMemo(() => getStaticCities(), []);
  const stepInfo = useMemo(() => buildGuestPreviewStepInfo(cities), [cities]);
  const city = findCityById(cities, stepInfo.currentCityId) ?? cities[0];
  const missions = useMemo(() => buildStaticMissionMap(stepInfo.totalSteps, new Set<string>()), [stepInfo.totalSteps]);
  const passport = useMemo(() => buildPassportSnapshot(cities, stepInfo.totalSteps, new Set<string>()), [cities, stepInfo.totalSteps]);
  const activeMissions = missions[city.id] ?? [];
  const primarySession = suggestedSessions[1];

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
        {activeTab === "trip" && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="relative h-56 overflow-hidden rounded-2xl">
              <img src={primarySession.coverImage} alt={primarySession.cityTheme} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-[11px] font-bold text-white/70">추천 walk/run trip</p>
                <h2 className="mt-1 text-2xl font-extrabold">{primarySession.title}</h2>
                <p className="mt-1 text-[13px] leading-5 text-white/75">{primarySession.subtitle}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Ticket, label: "티켓", value: `${passport.travelTickets}장` },
                { icon: Stamp, label: "스탬프", value: `${passport.stampsEarned}개` },
                { icon: Route, label: "세션", value: `${passport.sessionsCompleted}회` },
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
              onClick={() => navigate("/")}
              className="pressable flex w-full items-center justify-between rounded-2xl bg-card p-4 text-left shadow-card"
            >
              <span>
                <span className="block text-sm font-bold text-foreground">Start trip 루프 보기</span>
                <span className="text-[12px] text-muted-foreground">세션 시작, proof mission, 스탬프 피드가 한 화면에서 이어집니다</span>
              </span>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </motion.section>
        )}

        {activeTab === "missions" && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-2xl bg-card p-4 shadow-card">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-base font-bold text-foreground">{city.name} proof missions</h2>
                  <p className="text-[12px] text-muted-foreground">사진, 텍스트, 세션, 스크린샷 증명으로 스탬프를 모읍니다.</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {activeMissions.slice(0, 4).map((mission, index) => (
                <MissionCard key={mission.id} mission={mission} index={index} />
              ))}
            </div>
          </motion.section>
        )}

        {activeTab === "feed" && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="rounded-2xl bg-gradient-ocean p-4 text-white">
              <MessageCircle className="mb-3 h-5 w-5" />
              <h2 className="text-lg font-bold">미션 인증 피드</h2>
              <p className="mt-1 text-[12px] leading-5 text-white/75">같은 미션을 다른 여행자가 어떻게 완료했는지 보고 여행 반응을 남깁니다.</p>
            </div>
            {mockProofPosts.slice(0, 2).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </motion.section>
        )}
      </main>
    </AppLayout>
  );
};

export default DemoPage;
