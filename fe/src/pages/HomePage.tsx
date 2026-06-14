import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  Compass,
  LogIn,
  MapPin,
  Play,
  Route,
  ShieldCheck,
  Sparkles,
  Stamp,
  Ticket,
  Timer,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import MissionCard from "@/components/shared/MissionCard";
import MissionDetailModal from "@/components/shared/MissionDetailModal";
import SpotCarousel from "@/components/shared/SpotCarousel";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useBadges, useCityMembers, useStepInfo } from "@/hooks/useApi";
import {
  buildGuestPreviewStepInfo,
  buildPassportSnapshot,
  buildStaticMissionMap,
  findCityById,
  getCityLandmarkItems,
  getStaticCities,
  mockProofPosts,
  type UiMission,
} from "@/lib/city-utils";
import { cityUsers, passportProgress, suggestedSessions, type ProofType, type WalkRunSession } from "@/mocks/mockData";
import cityTokyoImg from "@/assets/city-tokyo.jpg";
import { toast } from "sonner";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
});

const proofLabel: Record<ProofType, string> = {
  photo: "사진",
  text: "텍스트",
  session: "세션",
  screenshot: "스크린샷",
  social: "소셜",
};

const difficultyLabel: Record<WalkRunSession["difficulty"], string> = {
  easy: "가볍게",
  steady: "꾸준히",
  challenge: "도전",
};

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [selectedMission, setSelectedMission] = useState<UiMission | null>(null);
  const [activeSession, setActiveSession] = useState<WalkRunSession | null>(null);
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
  const { data: cityMembers } = useCityMembers(currentCity?.id ?? "");

  if ((isLoggedIn && (!user || !stepInfo || isStepLoading || isBadgesLoading)) || !currentCity || !activeStepInfo) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  const memberCount = isLoggedIn
    ? (cityMembers?.length ?? 0) + 1
    : cityUsers.filter((member) => member.currentCityId === currentCity.id).length + 1;
  const recommendedSession = activeSession ?? suggestedSessions.find((session) => session.cityId === currentCity.id) ?? suggestedSessions[0];
  const sessionMissions = recommendedSession.missions
    .map((sessionMission) => missions[recommendedSession.cityId]?.find((mission) => mission.id === sessionMission.id))
    .filter((mission): mission is UiMission => Boolean(mission));
  const cityMissions = (missions[currentCity.id] || []).filter((mission) => mission.status === "available");
  const heroImage = recommendedSession.coverImage || cityTokyoImg;
  const latestProof = mockProofPosts[0];

  const handleStartSession = (session: WalkRunSession) => {
    setActiveSession(session);
    toast.success(`${session.title} 세션을 시작했어요`, {
      description: "정확한 자동 추적이 없어도 완료 기록이나 증명 업로드로 이어갈 수 있습니다.",
    });
  };

  return (
    <AppLayout>
      <div className="relative min-h-[25rem] overflow-hidden">
        <img src={heroImage} alt={recommendedSession.cityTheme} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
        <div className="relative flex min-h-[25rem] flex-col justify-end px-4 pb-10 pt-20 text-white">
          <motion.div {...fade(0)}>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              walk/run trip MVP
            </div>
            <h1 className="max-w-[18rem] text-3xl font-extrabold leading-tight">
              오늘의 작은 여행을 시작하세요
            </h1>
            <p className="mt-3 max-w-[20rem] text-[13px] leading-6 text-white/80">
              걷기나 러닝 세션을 시작하고, 사진·텍스트·스크린샷 증명 미션으로 도시 스탬프와 여행 티켓을 모읍니다.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => handleStartSession(recommendedSession)}
                className="pressable inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-[13px] font-extrabold text-foreground"
              >
                <Play className="h-4 w-4 fill-current" />
                오늘의 여행 시작
              </button>
              <button
                type="button"
                onClick={() => navigate("/city")}
                className="pressable inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-[13px] font-bold text-white backdrop-blur"
              >
                인증 피드
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 -mt-6 space-y-5 px-4">
        <motion.section {...fade(0.1)} className="rounded-2xl bg-card p-4 shadow-elevated">
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { icon: Ticket, label: "여행 티켓", value: passport.travelTickets },
              { icon: Stamp, label: "도시 스탬프", value: passport.stampsEarned },
              { icon: Route, label: "완료 세션", value: passport.sessionsCompleted },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-secondary/70 p-3">
                <stat.icon className="mb-2 h-4 w-4 text-primary" />
                <p className="font-num text-xl font-extrabold text-foreground">{stat.value}</p>
                <p className="text-[10px] font-medium text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-primary/10 p-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-[11px] leading-5 text-muted-foreground">
              PWA에서는 GPS와 백그라운드 추적이 완벽하지 않을 수 있어요. 그래서 세션 완료, 수동 기록, 외부 앱 스크린샷, 사진 증명을 모두 허용합니다.
            </p>
          </div>
        </motion.section>

        <motion.section {...fade(0.16)}>
          <div className="mb-2.5 flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-extrabold text-foreground">추천 walk/run trip</h2>
              <p className="text-[11px] text-muted-foreground">원하는 강도로 시작하고, 미션은 선택해서 완료하세요.</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {suggestedSessions.map((session) => {
              const isActive = activeSession?.id === session.id;
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => handleStartSession(session)}
                  className={`pressable w-full overflow-hidden rounded-2xl bg-card text-left shadow-card transition-shadow hover:shadow-elevated ${
                    isActive ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <div className="flex gap-3 p-3">
                    <img src={session.coverImage} alt={session.cityTheme} className="h-24 w-24 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground">
                          {session.activityType === "walk" ? "Walk" : "Run"}
                        </span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {difficultyLabel[session.difficulty]}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-extrabold text-card-foreground">{session.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-5 text-muted-foreground">{session.subtitle}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-gold/10 px-2 py-1 text-[10px] font-bold text-gold">
                          <Ticket className="h-3 w-3" /> +{session.ticketReward}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                          <Timer className="h-3 w-3" /> {session.targetLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                          <Stamp className="h-3 w-3" /> {session.missions.length} missions
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.section>

        <motion.section {...fade(0.22)} className="rounded-2xl bg-card p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-primary">{activeSession ? "진행 중인 세션" : "오늘 추천 세션"}</p>
              <h2 className="text-lg font-extrabold text-card-foreground">{recommendedSession.cityTheme}</h2>
              <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">{recommendedSession.subtitle}</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Compass className="h-6 w-6" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {recommendedSession.missions.map((mission) => (
              <div key={mission.id} className="rounded-xl bg-secondary/70 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-primary">{proofLabel[mission.proofType]} 증명</span>
                  <span className="text-[10px] text-muted-foreground">{mission.optional ? "선택" : "필수"}</span>
                </div>
                <p className="line-clamp-2 text-[12px] font-bold leading-5 text-foreground">{mission.title}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => sessionMissions[0] && setSelectedMission(sessionMissions[0])}
            className="pressable mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-[13px] font-bold text-background"
          >
            <Camera className="h-4 w-4" />
            첫 미션 인증하기
          </button>
        </motion.section>

        {cityMissions.length > 0 && (
          <motion.section {...fade(0.28)}>
            <div className="mb-2.5 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-extrabold text-foreground">{currentCity.name} proof missions</h2>
                <p className="text-[11px] text-muted-foreground">세션 중 또는 세션 후에 골라서 인증할 수 있어요.</p>
              </div>
              <button onClick={() => navigate("/map")} className="flex items-center gap-0.5 text-xs font-medium text-muted-foreground">
                여권 지도
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {cityMissions.slice(0, 4).map((mission, index) => (
                <MissionCard key={mission.id} mission={mission} index={index} onClick={setSelectedMission} />
              ))}
            </div>
          </motion.section>
        )}

        <motion.button
          {...fade(0.34)}
          type="button"
          onClick={() => navigate("/city")}
          className="pressable w-full rounded-2xl bg-card p-4 text-left shadow-card"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-primary">같은 미션을 한 여행자들</p>
              <p className="mt-1 truncate text-sm font-extrabold text-card-foreground">{latestProof.missionTitle}</p>
              <p className="mt-0.5 line-clamp-2 text-[12px] leading-5 text-muted-foreground">
                {memberCount}명이 {currentCity.name} 미션 피드에서 사진, 스크린샷, 짧은 기록을 공유 중입니다.
              </p>
            </div>
            <MapPin className="h-5 w-5 shrink-0 text-primary" />
          </div>
        </motion.button>

        <motion.div {...fade(0.4)}>
          <SpotCarousel title={`${currentCity.name}에서 찾을 수 있는 장면`} emoji="🏷️" items={getCityLandmarkItems(currentCity)} maxVisible={3} />
        </motion.div>

        {!isLoggedIn && (
          <motion.button
            {...fade(0.45)}
            type="button"
            onClick={() => navigate(`/login?redirect=${encodeURIComponent("/")}`)}
            className="pressable flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-[13px] font-extrabold text-primary-foreground shadow-glow"
          >
            <LogIn className="h-4 w-4" />
            내 여권으로 이어서 여행하기
          </motion.button>
        )}

        <p className="px-2 pb-2 text-center text-[10px] leading-5 text-muted-foreground">
          현재 데모 여권: 티켓 {passportProgress.travelTickets}장, 스탬프 {passportProgress.stampsEarned}개, 완료 세션 {passportProgress.sessionsCompleted}개
        </p>
      </div>

      {selectedMission && <MissionDetailModal mission={selectedMission} onClose={() => setSelectedMission(null)} />}
    </AppLayout>
  );
};

export default HomePage;
