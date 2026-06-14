import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Check,
  CircleStop,
  Gift,
  Headphones,
  Loader2,
  LocateFixed,
  LogIn,
  MapPin,
  Navigation,
  Play,
  Route,
  Sparkles,
  Stamp,
  Ticket,
  Timer,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCurrency,
  useExchangeFriendCoupon,
  useFinishSession,
  useFriendStories,
  useRecordSessionLocation,
  useStartSession,
  useSubmitSessionMissionProof,
  useTodaySession,
} from "@/hooks/useApi";
import { type GeoPointPayload, type SessionMissionData, type TodaySessionData } from "@/lib/api";
import { uploadImageFile } from "@/lib/upload-file";
import cityTokyoImg from "@/assets/city-tokyo.jpg";
import { toast } from "sonner";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.45, ease: [0.4, 0, 0.2, 1] as const },
});

const proofLabel: Record<SessionMissionData["proofType"], string> = {
  photo: "사진",
  text: "기록",
  session: "세션",
  screenshot: "스크린샷",
  social: "소셜",
};

const guestToday: TodaySessionData = {
  sessionId: null,
  sessionDate: new Date().toISOString().slice(0, 10),
  status: "ready",
  activityType: "walk",
  cityId: "seoul",
  cityName: "서울",
  countryFlag: "🇰🇷",
  dailyGoalMeters: 1000,
  distanceMeters: 0,
  bonusMeters: 0,
  progressMeters: 0,
  progressPercent: 0,
  durationSeconds: 0,
  ticketsEarned: 0,
  stampsEarned: 0,
  environmentHint: "city",
  playlistTitle: "오늘의 산책 플레이리스트",
  playlistUrl: "https://www.youtube.com/results?search_query=walking+playlist",
  startedAt: null,
  endedAt: null,
  missions: [
    {
      id: null,
      missionKey: "open_sky",
      title: "뻥 뚫린 오늘 하늘 찍기",
      description: "산책 중 고개를 들었을 때 보이는 하늘을 사진으로 남겨보세요.",
      proofType: "photo",
      emoji: "☁️",
      bonusMeters: 120,
      stampReward: "하늘 산책 스탬프",
      status: "available",
      verificationStatus: "pending",
      imageUrl: null,
      completedAt: null,
    },
    {
      id: null,
      missionKey: "crosswalk",
      title: "횡단보도 한 컷",
      description: "안전하게 멈춘 순간, 횡단보도나 보행자 표식을 찍어보세요.",
      proofType: "photo",
      emoji: "🚶",
      bonusMeters: 100,
      stampReward: "도시 보행 스탬프",
      status: "available",
      verificationStatus: "pending",
      imageUrl: null,
      completedAt: null,
    },
    {
      id: null,
      missionKey: "three_trees",
      title: "나무 3그루 한 번에 찍기",
      description: "한 장면 안에 나무가 여러 그루 들어오게 사진을 남겨보세요.",
      proofType: "photo",
      emoji: "🌳",
      bonusMeters: 140,
      stampReward: "초록 발견 스탬프",
      status: "available",
      verificationStatus: "pending",
      imageUrl: null,
      completedAt: null,
    },
    {
      id: null,
      missionKey: "snack_find",
      title: "산책 간식 발견",
      description: "편의점이나 가게에서 기분 좋은 간식 하나를 찾아 기록해보세요.",
      proofType: "photo",
      emoji: "🍿",
      bonusMeters: 120,
      stampReward: "간식 탐험 스탬프",
      status: "available",
      verificationStatus: "pending",
      imageUrl: null,
      completedAt: null,
    },
    {
      id: null,
      missionKey: "walk_15",
      title: "15분 산책 유지",
      description: "오늘의 세션을 15분 이상 이어가면 완료할 수 있어요.",
      proofType: "session",
      emoji: "⏱️",
      bonusMeters: 160,
      stampReward: "꾸준함 스탬프",
      status: "available",
      verificationStatus: "pending",
      imageUrl: null,
      completedAt: null,
    },
  ],
};

const formatMeters = (meters: number) => (meters >= 1000 ? `${(meters / 1000).toFixed(2)}km` : `${Math.max(0, Math.round(meters))}m`);

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remain = seconds % 60;
  if (minutes <= 0) return `${remain}초`;
  return `${minutes}분 ${remain.toString().padStart(2, "0")}초`;
};

const pointFromPosition = (position: GeolocationPosition): GeoPointPayload => ({
  latitude: position.coords.latitude,
  longitude: position.coords.longitude,
  accuracyMeters: Math.round(position.coords.accuracy),
  recordedAt: new Date(position.timestamp).toISOString(),
});

const inferEnvironmentHint = (point?: GeoPointPayload) => {
  if (!point) return "city";
  const accuracy = point.accuracyMeters ?? 999;
  if (accuracy <= 35) return "gps-city";
  if (accuracy <= 80) return "city";
  return "city-fallback";
};

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const watchIdRef = useRef<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState("GPS 대기 중");
  const [textProofs, setTextProofs] = useState<Record<number, string>>({});
  const [uploadingMissionId, setUploadingMissionId] = useState<number | null>(null);
  const [localTick, setLocalTick] = useState(0);

  const { data: todayResponse, isLoading: isTodayLoading } = useTodaySession();
  const { data: currency } = useCurrency();
  const { data: stories = [] } = useFriendStories(6);
  const startSession = useStartSession();
  const recordLocation = useRecordSessionLocation();
  const submitProof = useSubmitSessionMissionProof();
  const finishSession = useFinishSession();
  const exchangeCoupon = useExchangeFriendCoupon();

  const today = isLoggedIn ? todayResponse : guestToday;
  const activeToday = today ?? guestToday;
  const isActive = activeToday.status === "active";
  const isFinished = activeToday.status === "completed" || activeToday.status === "abandoned";
  const completedMissionCount = activeToday.missions.filter((mission) => mission.status === "completed").length;
  const ticketBalance = currency?.tickets ?? user?.tickets ?? 0;
  const couponBalance = currency?.coupons ?? user?.coupons ?? 0;

  const elapsedSeconds = useMemo(() => {
    if (!isActive || !activeToday.startedAt) return activeToday.durationSeconds;
    return activeToday.durationSeconds + localTick;
  }, [activeToday.durationSeconds, activeToday.startedAt, isActive, localTick]);

  useEffect(() => {
    if (!isActive) {
      setLocalTick(0);
      return undefined;
    }

    const timer = window.setInterval(() => setLocalTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isActive]);

  useEffect(
    () => () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
      }
    },
    [],
  );

  if (isLoggedIn && isTodayLoading && !todayResponse) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  const getInitialPosition = async (): Promise<GeoPointPayload | undefined> => {
    if (!navigator.geolocation) {
      setGpsStatus("이 브라우저는 GPS를 지원하지 않아요");
      return undefined;
    }

    setGpsStatus("현재 위치 확인 중");
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const point = pointFromPosition(position);
          setGpsStatus(`GPS 연결됨 · 오차 약 ${point.accuracyMeters ?? "-"}m`);
          resolve(point);
        },
        () => {
          setGpsStatus("GPS 없이 산책 기록을 시작했어요");
          resolve(undefined);
        },
        { enableHighAccuracy: true, timeout: 9000, maximumAge: 5000 },
      );
    });
  };

  const beginLocationWatch = (sessionId: number) => {
    if (!navigator.geolocation) return;
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const point = pointFromPosition(position);
        setGpsStatus(`GPS 기록 중 · 오차 약 ${point.accuracyMeters ?? "-"}m`);
        recordLocation.mutate({ sessionId, point });
      },
      () => setGpsStatus("GPS 신호가 불안정해요. 사진/스크린샷 proof로 이어갈 수 있어요."),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 4000 },
    );
  };

  const handleStart = async () => {
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent("/")}`);
      return;
    }

    if (activeToday.playlistUrl) {
      window.open(activeToday.playlistUrl, "_blank", "noopener,noreferrer");
    }

    const point = await getInitialPosition();
    const data = await startSession.mutateAsync({
      activityType: "walk",
      startLocation: point,
      environmentHint: inferEnvironmentHint(point),
      playlistId: "walk-world-daily",
    });

    if (data.sessionId) {
      beginLocationWatch(data.sessionId);
    }

    toast.success("오늘의 산책이 시작됐어요", {
      description: "미션은 선택이에요. 멈춰도 지금까지의 거리와 인증으로 보상을 받을 수 있습니다.",
    });
  };

  const handleFinish = async () => {
    if (!activeToday.sessionId) return;
    if (watchIdRef.current !== null) {
      navigator.geolocation?.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    const result = await finishSession.mutateAsync(activeToday.sessionId);
    toast.success(result.status === "completed" ? "오늘의 여행 목표를 채웠어요" : "오늘 산책 기록을 저장했어요", {
      description: `티켓 ${result.ticketsEarned}장 · 스탬프 ${result.stampsEarned}개`,
    });
  };

  const handleMissionFile = async (mission: SessionMissionData, file?: File) => {
    if (!activeToday.sessionId || !mission.id || !file) return;
    setUploadingMissionId(mission.id);

    try {
      const uploaded = await uploadImageFile("missions", file);
      await submitProof.mutateAsync({
        sessionId: activeToday.sessionId,
        missionId: mission.id,
        proofType: mission.proofType,
        imageKey: uploaded.key,
      });
      toast.success("사진 미션이 인증됐어요", {
        description: "AI 판정 준비 상태가 없으면 안전하게 fallback 인증으로 저장됩니다.",
      });
    } finally {
      setUploadingMissionId(null);
    }
  };

  const handleTextProof = async (mission: SessionMissionData) => {
    if (!activeToday.sessionId || !mission.id) return;
    const text = textProofs[mission.id]?.trim();
    if (!text) {
      toast.error("한 줄 기록을 입력해주세요");
      return;
    }

    await submitProof.mutateAsync({
      sessionId: activeToday.sessionId,
      missionId: mission.id,
      proofType: mission.proofType,
      text,
    });
    setTextProofs((prev) => ({ ...prev, [mission.id as number]: "" }));
    toast.success("기록 미션이 인증됐어요");
  };

  const handleSessionProof = async (mission: SessionMissionData) => {
    if (!activeToday.sessionId || !mission.id) return;
    await submitProof.mutateAsync({
      sessionId: activeToday.sessionId,
      missionId: mission.id,
      proofType: mission.proofType,
      text: "오늘의 산책 세션 기록으로 인증",
    });
    toast.success("세션 미션이 인증됐어요");
  };

  const handleExchangeCoupon = async () => {
    await exchangeCoupon.mutateAsync();
    toast.success("친구추가 쿠폰 1장을 교환했어요");
  };

  return (
    <AppLayout>
      <div className="relative min-h-[20rem] overflow-hidden">
        <img src={cityTokyoImg} alt="오늘의 산책 여행" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/5" />
        <div className="relative flex min-h-[20rem] flex-col justify-end px-4 pb-8 pt-16 text-white">
          <motion.div {...fade(0)}>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              walk/run session passport
            </div>
            <h1 className="max-w-[19rem] text-3xl font-extrabold leading-tight">
              오늘 1km를 작은 여행으로 바꾸세요
            </h1>
            <p className="mt-3 max-w-[21rem] text-[13px] leading-6 text-white/80">
              산책을 시작하면 GPS 기록, 기분 좋은 사진 미션, 티켓과 스탬프, 친구에게 보여줄 스토리가 함께 열립니다.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 -mt-5 space-y-4 px-4">
        <motion.section {...fade(0.08)} className="rounded-2xl bg-card p-4 shadow-elevated">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-primary">{activeToday.countryFlag} {activeToday.cityName} 오늘의 목표</p>
              <h2 className="mt-1 text-2xl font-extrabold text-card-foreground">
                {formatMeters(activeToday.progressMeters)}
                <span className="text-base text-muted-foreground"> / {formatMeters(activeToday.dailyGoalMeters)}</span>
              </h2>
            </div>
            <div className="rounded-2xl bg-primary/10 px-3 py-2 text-right">
              <p className="font-num text-xl font-extrabold text-primary">{activeToday.progressPercent}%</p>
              <p className="text-[10px] font-bold text-muted-foreground">게이지</p>
            </div>
          </div>

          <div className="mt-4 h-4 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-ocean to-accent transition-all duration-500"
              style={{ width: `${Math.min(100, activeToday.progressPercent)}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-secondary/75 p-3">
              <Route className="mb-2 h-4 w-4 text-ocean" />
              <p className="font-num text-lg font-extrabold">{formatMeters(activeToday.distanceMeters)}</p>
              <p className="text-[10px] text-muted-foreground">GPS 거리</p>
            </div>
            <div className="rounded-xl bg-secondary/75 p-3">
              <Stamp className="mb-2 h-4 w-4 text-accent" />
              <p className="font-num text-lg font-extrabold">+{formatMeters(activeToday.bonusMeters)}</p>
              <p className="text-[10px] text-muted-foreground">미션 보너스</p>
            </div>
            <div className="rounded-xl bg-secondary/75 p-3">
              <Timer className="mb-2 h-4 w-4 text-primary" />
              <p className="font-num text-lg font-extrabold">{formatDuration(elapsedSeconds)}</p>
              <p className="text-[10px] text-muted-foreground">산책 시간</p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            {isActive ? (
              <button
                type="button"
                onClick={() => void handleFinish()}
                disabled={finishSession.isPending}
                className="pressable inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-[13px] font-extrabold text-background disabled:opacity-60"
              >
                {finishSession.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CircleStop className="h-4 w-4" />}
                산책 종료하고 결과 보기
              </button>
            ) : isFinished ? (
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="pressable inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-[13px] font-extrabold text-background"
              >
                <Stamp className="h-4 w-4" />
                여권에 기록 보기
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleStart()}
                disabled={startSession.isPending}
                className="pressable inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-[13px] font-extrabold text-background disabled:opacity-60"
              >
                {startSession.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                오늘의 산책 시작하기
              </button>
            )}
            <a
              href={activeToday.playlistUrl}
              target="_blank"
              rel="noreferrer"
              className="pressable inline-flex w-12 items-center justify-center rounded-xl bg-secondary text-foreground"
              aria-label="플레이리스트 열기"
              title="플레이리스트 열기"
            >
              <Headphones className="h-5 w-5" />
            </a>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2">
            <LocateFixed className="h-4 w-4 shrink-0 text-primary" />
            <p className="text-[11px] leading-5 text-muted-foreground">{gpsStatus}</p>
          </div>
        </motion.section>

        {isFinished && (
          <motion.section {...fade(0.12)} className="rounded-2xl bg-card p-4 shadow-card">
            <p className="text-[11px] font-bold text-primary">오늘의 결과</p>
            <h2 className="mt-1 text-lg font-extrabold text-card-foreground">
              {activeToday.status === "completed" ? "목표를 채운 여행" : "중간에 멈춘 여행도 기록됐어요"}
            </h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-gold/10 p-3">
                <Ticket className="mb-2 h-4 w-4 text-gold" />
                <p className="font-num text-lg font-extrabold">{activeToday.ticketsEarned}</p>
                <p className="text-[10px] text-muted-foreground">획득 티켓</p>
              </div>
              <div className="rounded-xl bg-secondary p-3">
                <Stamp className="mb-2 h-4 w-4 text-accent" />
                <p className="font-num text-lg font-extrabold">{activeToday.stampsEarned}</p>
                <p className="text-[10px] text-muted-foreground">획득 스탬프</p>
              </div>
              <div className="rounded-xl bg-secondary p-3">
                <Timer className="mb-2 h-4 w-4 text-primary" />
                <p className="font-num text-lg font-extrabold">{formatDuration(activeToday.durationSeconds)}</p>
                <p className="text-[10px] text-muted-foreground">총 시간</p>
              </div>
            </div>
          </motion.section>
        )}

        <motion.section {...fade(0.16)} className="rounded-2xl bg-card p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-primary">오늘 가능한 미션 5개</p>
              <h2 className="text-lg font-extrabold text-card-foreground">{completedMissionCount}/5개 완료</h2>
            </div>
            <div className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-muted-foreground">
              선택 미션
            </div>
          </div>

          <div className="space-y-2.5">
            {activeToday.missions.slice(0, 5).map((mission) => {
              const completed = mission.status === "completed";
              const disabled = !isLoggedIn || !activeToday.sessionId || completed;
              return (
                <div key={mission.missionKey} className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${completed ? "bg-success text-success-foreground" : "bg-secondary"}`}>
                      {completed ? <Check className="h-5 w-5" /> : <span className="text-lg">{mission.emoji}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {proofLabel[mission.proofType]} proof
                        </span>
                        <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold">
                          +{mission.bonusMeters}m
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm font-extrabold text-foreground">{mission.title}</p>
                      <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">{mission.description}</p>
                      {mission.status === "completed" && (
                        <p className="mt-1 text-[11px] font-bold text-success">
                          {mission.verificationStatus === "fallback_accepted" ? "사진 제출 기반 인증 완료" : "인증 완료"} · {mission.stampReward}
                        </p>
                      )}
                    </div>
                  </div>

                  {!completed && (
                    <div className="mt-3">
                      {(mission.proofType === "photo" || mission.proofType === "screenshot") && (
                        <label className={`pressable inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-foreground py-2.5 text-[12px] font-bold text-background ${disabled ? "pointer-events-none opacity-50" : ""}`}>
                          {uploadingMissionId === mission.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          사진으로 인증하기
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={disabled}
                            onChange={(event) => void handleMissionFile(mission, event.target.files?.[0])}
                          />
                        </label>
                      )}

                      {(mission.proofType === "text" || mission.proofType === "social") && (
                        <div className="space-y-2">
                          <textarea
                            value={mission.id ? textProofs[mission.id] ?? "" : ""}
                            onChange={(event) =>
                              mission.id && setTextProofs((prev) => ({ ...prev, [mission.id as number]: event.target.value }))
                            }
                            disabled={disabled}
                            maxLength={160}
                            className="min-h-20 w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                            placeholder="오늘 산책에서 좋았던 장면을 한 줄로 남겨보세요"
                          />
                          <button
                            type="button"
                            disabled={disabled || submitProof.isPending}
                            onClick={() => void handleTextProof(mission)}
                            className="pressable inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-2.5 text-[12px] font-bold text-background disabled:opacity-50"
                          >
                            기록으로 인증하기
                          </button>
                        </div>
                      )}

                      {mission.proofType === "session" && (
                        <button
                          type="button"
                          disabled={disabled || submitProof.isPending}
                          onClick={() => void handleSessionProof(mission)}
                          className="pressable inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-2.5 text-[12px] font-bold text-background disabled:opacity-50"
                        >
                          <Navigation className="h-4 w-4" />
                          세션 기록으로 인증하기
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.section>

        <motion.section {...fade(0.22)} className="rounded-2xl bg-card p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-primary">여행 티켓</p>
              <h2 className="text-lg font-extrabold text-card-foreground">{ticketBalance}장 보유 · 쿠폰 {couponBalance}장</h2>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">티켓 3장으로 친구추가 쿠폰 1장을 살 수 있어요.</p>
            </div>
            <Gift className="h-8 w-8 shrink-0 text-gold" />
          </div>
          <button
            type="button"
            onClick={() => void handleExchangeCoupon()}
            disabled={!isLoggedIn || ticketBalance < 3 || exchangeCoupon.isPending}
            className="pressable mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-[13px] font-extrabold text-gold-foreground disabled:opacity-50"
          >
            {exchangeCoupon.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
            친구추가 쿠폰으로 교환
          </button>
        </motion.section>

        <motion.section {...fade(0.28)} className="rounded-2xl bg-card p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-primary">친구들의 산책 스토리</p>
              <h2 className="text-lg font-extrabold text-card-foreground">미션 proof로 보는 오늘의 여행</h2>
            </div>
            <button type="button" onClick={() => navigate("/city")} className="text-[11px] font-bold text-muted-foreground">
              인증 피드
            </button>
          </div>

          {isLoggedIn && stories.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {stories.map((story) => (
                <div key={story.id} className="w-36 shrink-0 overflow-hidden rounded-xl bg-secondary">
                  {story.imageUrl ? (
                    <img src={story.imageUrl} alt={story.missionTitle} className="h-36 w-full object-cover" />
                  ) : (
                    <div className="flex h-36 w-full items-center justify-center bg-gradient-ocean text-white">
                      <Camera className="h-8 w-8" />
                    </div>
                  )}
                  <div className="p-2">
                    <p className="truncate text-[11px] font-extrabold text-foreground">{story.missionTitle}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{story.userName}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-secondary/70 p-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-[12px] leading-5 text-muted-foreground">
                  사진 미션을 완료하면 친구에게만 보이는 산책 스토리로 남습니다. 아직 친구 스토리가 없다면 오늘 첫 proof를 만들어보세요.
                </p>
              </div>
            </div>
          )}
        </motion.section>

        {!isLoggedIn && (
          <motion.button
            {...fade(0.34)}
            type="button"
            onClick={() => navigate(`/login?redirect=${encodeURIComponent("/")}`)}
            className="pressable flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-[13px] font-extrabold text-primary-foreground shadow-glow"
          >
            <LogIn className="h-4 w-4" />
            내 여권으로 오늘 산책 시작하기
          </motion.button>
        )}

        <p className="px-2 pb-2 text-center text-[10px] leading-5 text-muted-foreground">
          GPS가 불안정하면 사진, 기록, 외부 앱 스크린샷 proof로도 오늘의 여행을 완성할 수 있어요.
        </p>
      </div>
    </AppLayout>
  );
};

export default HomePage;
