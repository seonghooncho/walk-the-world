import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Check,
  ChevronRight,
  CircleStop,
  Gift,
  Headphones,
  Loader2,
  LocateFixed,
  LogIn,
  MapPin,
  Navigation,
  Pause,
  Plane,
  Play,
  Route,
  Sparkles,
  Stamp,
  Ticket,
  Timer,
  Upload,
  X,
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
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
});

const proofLabel: Record<SessionMissionData["proofType"], string> = {
  photo: "사진",
  text: "기록",
  session: "세션",
  screenshot: "스크린샷",
  social: "소셜",
};

type TravelStage = "home" | "departing" | "arrived" | "mission";

interface DestinationProfile {
  arrivalName: string;
  countryLine: string;
  facts: string[];
  musicLabel: string;
  musicUrl: string;
  notes: number[];
  accent: string;
}

interface MissionCopy {
  title: string;
  prompt: string;
}

const destinationProfiles: Record<string, DestinationProfile> = {
  seoul: {
    arrivalName: "서울",
    countryLine: "한강, 골목, 편의점 불빛이 한 번에 이어지는 도시 산책지예요.",
    facts: ["궁궐 담장과 높은 빌딩이 가까이 있어요.", "한강 근처에서는 하늘이 크게 열립니다.", "골목마다 작은 간식 탐험이 잘 어울려요."],
    musicLabel: "저작권 안전 K-walk lo-fi",
    musicUrl: "https://pixabay.com/music/search/korea%20lofi/",
    notes: [523, 659, 784, 659],
    accent: "from-primary via-ocean to-success",
  },
  tokyo: {
    arrivalName: "도쿄",
    countryLine: "작은 골목, 횡단보도, 네온 색감이 산책 미션과 잘 맞는 도시예요.",
    facts: ["붉은 간판과 작은 편의점 불빛이 도시 리듬을 만들어요.", "횡단보도와 전철역 주변은 여행자의 장면이 많아요.", "하늘, 표식, 간식만 찾아도 도쿄 산책처럼 느껴집니다."],
    musicLabel: "저작권 안전 Tokyo city pop",
    musicUrl: "https://pixabay.com/music/search/japan%20city%20pop/",
    notes: [587, 740, 880, 740],
    accent: "from-accent via-gold to-primary",
  },
  busan: {
    arrivalName: "부산",
    countryLine: "바다 바람, 언덕길, 시장 간식이 산책을 여행처럼 만드는 도시예요.",
    facts: ["바닷가 근처에서는 넓은 하늘 사진이 잘 어울려요.", "언덕과 골목은 짧은 산책에도 여행감을 줍니다.", "시장과 편의점 간식 미션을 붙이기 좋아요."],
    musicLabel: "저작권 안전 seaside walk",
    musicUrl: "https://pixabay.com/music/search/seaside%20walk/",
    notes: [440, 554, 659, 554],
    accent: "from-ocean via-primary to-gold",
  },
  osaka: {
    arrivalName: "오사카",
    countryLine: "간판, 강변, 간식 탐험이 경쾌하게 이어지는 도시예요.",
    facts: ["화려한 표식과 간식 미션이 자연스럽게 이어져요.", "강변 산책은 15분 세션 목표와 잘 맞습니다.", "빨간 표식 찾기는 오사카 골목 분위기와 닮았어요."],
    musicLabel: "저작권 안전 Osaka groove",
    musicUrl: "https://pixabay.com/music/search/japan%20groove/",
    notes: [494, 622, 740, 622],
    accent: "from-gold via-accent to-primary",
  },
  paris: {
    arrivalName: "파리",
    countryLine: "가로수, 횡단보도, 카페 앞 장면이 산책 증거로 남기 좋은 도시예요.",
    facts: ["가로수와 건물 사이 하늘을 찾기 좋아요.", "작은 표식 하나도 엽서 같은 장면이 됩니다.", "짧은 산책 기록이 여권의 한 칸이 됩니다."],
    musicLabel: "저작권 안전 Paris walk",
    musicUrl: "https://pixabay.com/music/search/paris%20walk/",
    notes: [392, 494, 587, 494],
    accent: "from-earth via-gold to-ocean",
  },
  london: {
    arrivalName: "런던",
    countryLine: "횡단보도, 공원, 붉은 표식이 오늘의 미션을 또렷하게 만들어줘요.",
    facts: ["빨간 표식 찾기 미션과 잘 맞는 도시예요.", "공원 근처에서는 나무 여러 그루를 한 프레임에 담기 좋아요.", "흐린 하늘도 오늘의 여행 기록이 됩니다."],
    musicLabel: "저작권 안전 London stroll",
    musicUrl: "https://pixabay.com/music/search/london%20stroll/",
    notes: [349, 440, 523, 440],
    accent: "from-primary via-earth to-accent",
  },
  newyork: {
    arrivalName: "뉴욕",
    countryLine: "블록마다 표식과 횡단보도가 이어지는 빠른 리듬의 도시예요.",
    facts: ["횡단보도, 간판, 하늘 틈이 미션 proof가 됩니다.", "짧은 러닝 세션도 여행 티켓으로 쌓여요.", "친구 스토리에 올리기 좋은 도시 장면이 많아요."],
    musicLabel: "저작권 안전 city running beat",
    musicUrl: "https://pixabay.com/music/search/city%20running/",
    notes: [659, 784, 988, 784],
    accent: "from-ocean via-accent to-gold",
  },
};

const fallbackProfile = (cityName: string): DestinationProfile => ({
  arrivalName: cityName,
  countryLine: `${cityName}의 거리 장면을 오늘 산책 미션으로 가볍게 수집해요.`,
  facts: [`${cityName}에서 보이는 하늘, 표식, 간식이 오늘의 여권 조각이 됩니다.`, "GPS가 완벽하지 않아도 proof 미션으로 여행을 남길 수 있어요.", "미션은 선택이에요. 지나치고 계속 걸어도 기록은 남습니다."],
  musicLabel: "저작권 안전 travel walk",
  musicUrl: "https://pixabay.com/music/search/travel%20walk/",
  notes: [440, 523, 659, 523],
  accent: "from-primary via-ocean to-gold",
});

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
  playlistUrl: "https://pixabay.com/music/search/travel%20walk/",
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

const getMissionCopy = (mission: SessionMissionData, profile: DestinationProfile, cityName: string): MissionCopy => {
  switch (mission.missionKey) {
    case "open_sky":
      return {
        title: "도착 첫 하늘",
        prompt: `${profile.arrivalName}에 막 도착한 느낌으로 뻥 뚫린 하늘을 한 장 남겨보세요.`,
      };
    case "crosswalk":
      return {
        title: "여행자의 횡단보도",
        prompt: `${cityName} 거리를 건너는 기분으로 횡단보도나 보행자 표식을 안전하게 찍어보세요.`,
      };
    case "three_trees":
      return {
        title: "초록 골목 발견",
        prompt: "한 프레임 안에 나무가 여러 그루 들어오게 담아보세요. 공원길이면 더 좋아요.",
      };
    case "snack_find":
      return {
        title: "현지 간식 탐색",
        prompt: "편의점이나 작은 가게에서 여행 중 만난 것 같은 간식 하나를 찾아보세요.",
      };
    case "walk_15":
      return {
        title: "15분 도시 산책",
        prompt: "걷는 리듬을 15분만 이어가면 세션 기록으로 바로 인증할 수 있어요.",
      };
    case "red_sign":
      return {
        title: "붉은 네온 찾기",
        prompt: `${profile.arrivalName}의 밤거리처럼 빨간 간판, 표식, 물건을 한 장 찍어보세요.`,
      };
    default:
      return {
        title: mission.title,
        prompt: mission.description,
      };
  }
};

const playTravelCue = (notes: number[]) => {
  if (typeof window === "undefined") return;
  const audioWindow = window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };
  const AudioContextConstructor = audioWindow.AudioContext || audioWindow.webkitAudioContext;
  if (!AudioContextConstructor) return;

  const context = new AudioContextConstructor();
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.connect(context.destination);

  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const start = context.currentTime + index * 0.13;
    const end = start + 0.18;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.connect(gain);
    gain.gain.exponentialRampToValueAtTime(0.04, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.start(start);
    oscillator.stop(end);
  });

  window.setTimeout(() => {
    void context.close();
  }, notes.length * 150 + 350);
};

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const watchIdRef = useRef<number | null>(null);
  const startedInViewRef = useRef(false);
  const [gpsStatus, setGpsStatus] = useState("GPS 대기 중");
  const [textProofs, setTextProofs] = useState<Record<number, string>>({});
  const [uploadingMissionId, setUploadingMissionId] = useState<number | null>(null);
  const [localTick, setLocalTick] = useState(0);
  const [travelStage, setTravelStage] = useState<TravelStage>("home");
  const [missionIndex, setMissionIndex] = useState(0);
  const [skippedMissionKeys, setSkippedMissionKeys] = useState<string[]>([]);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [lastCompletedStamp, setLastCompletedStamp] = useState<string | null>(null);

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
  const profile = destinationProfiles[activeToday.cityId] ?? fallbackProfile(activeToday.cityName);
  const isActive = activeToday.status === "active";
  const isFinished = activeToday.status === "completed" || activeToday.status === "abandoned";
  const visibleMissions = activeToday.missions.slice(0, 5);
  const completedMissionCount = visibleMissions.filter((mission) => mission.status === "completed").length;
  const skippedMissionCount = visibleMissions.filter((mission) => skippedMissionKeys.includes(mission.missionKey)).length;
  const missionProgressLabel = `${completedMissionCount}/5개 완료`;
  const ticketBalance = currency?.tickets ?? user?.tickets ?? 0;
  const couponBalance = currency?.coupons ?? user?.coupons ?? 0;
  const currentMission = visibleMissions[missionIndex] ?? visibleMissions[visibleMissions.length - 1];
  const currentMissionCopy = currentMission ? getMissionCopy(currentMission, profile, activeToday.cityName) : null;

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

  useEffect(() => {
    if (travelStage === "departing") {
      const timer = window.setTimeout(() => setTravelStage("arrived"), 1500);
      return () => window.clearTimeout(timer);
    }

    if (travelStage === "arrived") {
      const timer = window.setTimeout(() => setTravelStage("mission"), 2300);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [travelStage]);

  useEffect(() => {
    if (travelStage === "home") return undefined;
    const timer = window.setInterval(() => {
      setFactIndex((value) => (value + 1) % profile.facts.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [profile.facts.length, travelStage]);

  useEffect(() => {
    if (!isLoggedIn || !isActive || travelStage !== "home" || startedInViewRef.current || !activeToday.sessionId) {
      return;
    }

    const key = `ww_resume_prompt_${activeToday.sessionId}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "seen");
    setShowResumePrompt(true);
  }, [activeToday.sessionId, isActive, isLoggedIn, travelStage]);

  useEffect(() => {
    if (currentMission?.status === "completed" && missionIndex < visibleMissions.length - 1) {
      const timer = window.setTimeout(() => setMissionIndex((value) => Math.min(value + 1, visibleMissions.length - 1)), 450);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [currentMission?.status, missionIndex, visibleMissions.length]);

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

  const enterTravelFlow = () => {
    setFactIndex(0);
    setLastCompletedStamp(null);
    const firstAvailableIndex = visibleMissions.findIndex((mission) => mission.status !== "completed" && !skippedMissionKeys.includes(mission.missionKey));
    setMissionIndex(firstAvailableIndex >= 0 ? firstAvailableIndex : 0);
    setTravelStage("departing");
    setShowResumePrompt(false);
    playTravelCue(profile.notes);
  };

  const handleStart = async () => {
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent("/")}`);
      return;
    }

    if (isActive && activeToday.sessionId) {
      startedInViewRef.current = true;
      beginLocationWatch(activeToday.sessionId);
      enterTravelFlow();
      toast.success("잠시 멈춘 여행을 이어갑니다", {
        description: "이전 미션 상태를 유지했어요.",
      });
      return;
    }

    startedInViewRef.current = true;
    enterTravelFlow();
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

    toast.success("오늘의 여행 산책이 시작됐어요", {
      description: "미션은 선택이에요. 중간에 멈춰도 거리와 인증으로 보상을 받을 수 있습니다.",
    });
  };

  const handlePause = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation?.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTravelStage("home");
    setGpsStatus("잠시 멈춤 · 다시 시작하면 이전 미션을 이어갈 수 있어요");
    toast.info("여행을 잠시 멈췄어요", {
      description: "오늘 산책 끝내기를 누르기 전까지 미션을 이어갈 수 있습니다.",
    });
  };

  const handleFinish = async () => {
    if (!activeToday.sessionId) return;
    if (watchIdRef.current !== null) {
      navigator.geolocation?.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    const result = await finishSession.mutateAsync(activeToday.sessionId);
    setTravelStage("home");
    toast.success(result.status === "completed" ? "오늘의 여행 목표를 채웠어요" : "오늘 산책 기록을 저장했어요", {
      description: `티켓 ${result.ticketsEarned}장 · 스탬프 ${result.stampsEarned}개`,
    });
  };

  const goNextMission = () => {
    setMissionIndex((value) => Math.min(value + 1, visibleMissions.length - 1));
  };

  const handleSkipMission = () => {
    if (!currentMission) return;
    setLastCompletedStamp(null);
    setSkippedMissionKeys((prev) => (prev.includes(currentMission.missionKey) ? prev : [...prev, currentMission.missionKey]));
    if (missionIndex < visibleMissions.length - 1) {
      goNextMission();
      toast.info("이번 미션은 넘겼어요", {
        description: "산책 흐름이 먼저예요. 다음 미션으로 이어갑니다.",
      });
      return;
    }

    toast.info("오늘의 미션 제안을 모두 지나왔어요", {
      description: "그만 걷고 싶으면 결과를 저장해도 됩니다.",
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
        description: "친구에게 보여줄 산책 스토리 proof로 저장됩니다.",
      });
      setLastCompletedStamp(mission.stampReward);
      goNextMission();
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
    setLastCompletedStamp(mission.stampReward);
    goNextMission();
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
    setLastCompletedStamp(mission.stampReward);
    goNextMission();
  };

  const handleExchangeCoupon = async () => {
    await exchangeCoupon.mutateAsync();
    toast.success("친구추가 쿠폰 1장을 교환했어요");
  };

  const renderMissionAction = (mission: SessionMissionData, compact = false) => {
    const completed = mission.status === "completed";
    const disabled = !isLoggedIn || !activeToday.sessionId || completed;

    if (completed) {
      return (
        <div className="rounded-xl bg-success/10 px-3 py-2 text-[12px] font-extrabold text-success">
          인증 완료 · {mission.stampReward}
        </div>
      );
    }

    if (mission.proofType === "photo" || mission.proofType === "screenshot") {
      return (
        <label
          className={`pressable inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-[13px] font-extrabold text-background ${
            disabled ? "pointer-events-none opacity-50" : ""
          }`}
        >
          {uploadingMissionId === mission.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {compact ? "사진 인증" : "사진으로 인증하기"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={disabled}
            onChange={(event) => void handleMissionFile(mission, event.target.files?.[0])}
          />
        </label>
      );
    }

    if (mission.proofType === "text" || mission.proofType === "social") {
      return (
        <div className="space-y-2">
          <textarea
            value={mission.id ? textProofs[mission.id] ?? "" : ""}
            onChange={(event) => mission.id && setTextProofs((prev) => ({ ...prev, [mission.id as number]: event.target.value }))}
            disabled={disabled}
            maxLength={160}
            className="min-h-20 w-full resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="오늘 산책에서 좋았던 장면을 한 줄로 남겨보세요"
          />
          <button
            type="button"
            disabled={disabled || submitProof.isPending}
            onClick={() => void handleTextProof(mission)}
            className="pressable inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-[13px] font-extrabold text-background disabled:opacity-50"
          >
            기록으로 인증하기
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        disabled={disabled || submitProof.isPending}
        onClick={() => void handleSessionProof(mission)}
        className="pressable inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-[13px] font-extrabold text-background disabled:opacity-50"
      >
        {submitProof.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
        세션 기록으로 인증하기
      </button>
    );
  };

  const allMissionsPassed = missionIndex >= visibleMissions.length - 1 && Boolean(currentMission && (currentMission.status === "completed" || skippedMissionKeys.includes(currentMission.missionKey)));

  return (
    <AppLayout>
      <div className="relative min-h-[18rem] overflow-hidden">
        <img src={cityTokyoImg} alt="오늘의 여행 산책" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
        <div className="relative flex min-h-[18rem] flex-col justify-end px-4 pb-7 pt-14 text-white">
          <motion.div {...fade(0)}>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold backdrop-blur">
              <Plane className="h-3.5 w-3.5" />
              오늘 여행 인덱스
            </div>
            <h1 className="max-w-[20rem] text-3xl font-extrabold leading-tight">
              {activeToday.countryFlag} {activeToday.cityName}로 떠나는 오늘 산책
            </h1>
            <p className="mt-3 max-w-[22rem] text-[13px] leading-6 text-white/80">
              1km 게이지를 채우고, 5개의 가벼운 proof 미션으로 티켓과 스탬프를 모아요.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 -mt-5 space-y-4 px-4">
        <motion.section {...fade(0.08)} className="rounded-2xl bg-card p-4 shadow-elevated">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold text-primary">오늘의 목적지</p>
              <h2 className="mt-1 truncate text-2xl font-extrabold text-card-foreground">
                {activeToday.countryFlag} {profile.arrivalName}
              </h2>
              <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-muted-foreground">{profile.countryLine}</p>
            </div>
            <div className="shrink-0 rounded-2xl bg-primary/10 px-3 py-2 text-right">
              <p className="font-num text-xl font-extrabold text-primary">{activeToday.progressPercent}%</p>
              <p className="text-[10px] font-bold text-muted-foreground">오늘 게이지</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground">오늘 목표 1km</p>
                <p className="font-num text-2xl font-extrabold text-foreground">
                  {formatMeters(activeToday.progressMeters)}
                  <span className="text-sm text-muted-foreground"> / {formatMeters(activeToday.dailyGoalMeters)}</span>
                </p>
              </div>
              <p className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-muted-foreground">
                미션 보너스 +{formatMeters(activeToday.bonusMeters)}
              </p>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${profile.accent} transition-all duration-500`}
                style={{ width: `${Math.min(100, activeToday.progressPercent)}%` }}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-secondary/75 p-3">
              <Route className="mb-2 h-4 w-4 text-ocean" />
              <p className="font-num text-lg font-extrabold">{formatMeters(activeToday.distanceMeters)}</p>
              <p className="text-[10px] text-muted-foreground">오늘 거리</p>
            </div>
            <div className="rounded-xl bg-secondary/75 p-3">
              <Timer className="mb-2 h-4 w-4 text-primary" />
              <p className="font-num text-lg font-extrabold">{formatDuration(elapsedSeconds)}</p>
              <p className="text-[10px] text-muted-foreground">산책 시간</p>
            </div>
            <div className="rounded-xl bg-secondary/75 p-3">
              <Stamp className="mb-2 h-4 w-4 text-accent" />
              <p className="font-num text-lg font-extrabold">{completedMissionCount}/5</p>
              <p className="text-[10px] text-muted-foreground">미션 완료</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2">
            <LocateFixed className="h-4 w-4 shrink-0 text-primary" />
            <p className="text-[11px] leading-5 text-muted-foreground">{gpsStatus}</p>
          </div>

          <div className="mt-4 flex gap-2">
            {isFinished ? (
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
                {startSession.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isActive ? <Play className="h-4 w-4 fill-current" /> : <Plane className="h-4 w-4" />}
                {isActive ? "여행 계속하기" : "오늘의 산책 시작하기"}
              </button>
            )}
            <a
              href={profile.musicUrl}
              target="_blank"
              rel="noreferrer"
              className="pressable inline-flex w-12 items-center justify-center rounded-xl bg-secondary text-foreground"
              aria-label="산책 음악 열기"
              title={profile.musicLabel}
            >
              <Headphones className="h-5 w-5" />
            </a>
          </div>
        </motion.section>

        <motion.section {...fade(0.14)} className="rounded-2xl bg-card p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-primary">오늘 미션</p>
              <h2 className="text-lg font-extrabold text-card-foreground">{missionProgressLabel}</h2>
            </div>
            <div className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-muted-foreground">
              건너뜀 {skippedMissionCount}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {visibleMissions.map((mission, index) => {
              const completed = mission.status === "completed";
              const skipped = skippedMissionKeys.includes(mission.missionKey);
              return (
                <button
                  key={mission.missionKey}
                  type="button"
                  onClick={() => {
                    setMissionIndex(index);
                    if (isActive) setTravelStage("mission");
                  }}
                  className={`h-20 w-[4.8rem] shrink-0 rounded-xl border px-2 py-2 text-left transition ${
                    completed
                      ? "border-success/30 bg-success/10 text-success"
                      : skipped
                        ? "border-border bg-muted text-muted-foreground"
                        : "border-border bg-secondary/70 text-foreground"
                  }`}
                  aria-label={`${index + 1}번 미션 ${mission.title}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{mission.emoji}</span>
                    {completed ? <Check className="h-4 w-4" /> : skipped ? <X className="h-4 w-4" /> : <span className="font-num text-[11px] font-bold">{index + 1}</span>}
                  </div>
                  <p className="mt-2 truncate text-[11px] font-extrabold">{getMissionCopy(mission, profile, activeToday.cityName).title}</p>
                  <p className="mt-0.5 text-[10px] font-bold opacity-70">{proofLabel[mission.proofType]}</p>
                </button>
              );
            })}
          </div>
        </motion.section>

        {isFinished && (
          <motion.section {...fade(0.18)} className="rounded-2xl bg-card p-4 shadow-card">
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
                  사진 미션을 완료하면 친구에게만 보이는 산책 스토리로 남습니다. 오늘의 proof를 만들고 여권에 붙일 장면을 남겨보세요.
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
            내 여권으로 여행 시작하기
          </motion.button>
        )}

        <p className="px-2 pb-2 text-center text-[10px] leading-5 text-muted-foreground">
          자동 걸음 수가 없어도 괜찮아요. GPS, 사진, 기록, 외부 앱 스크린샷 proof로 오늘의 여행을 완성할 수 있습니다.
        </p>
      </div>

      {showResumePrompt && (
        <div className="fixed inset-x-0 bottom-[calc(var(--app-bottom-nav-height)+0.75rem)] z-[90] mx-auto w-full max-w-lg px-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-elevated">
            <p className="text-[11px] font-bold text-primary">잠시 멈춘 여행</p>
            <h2 className="mt-1 text-lg font-extrabold text-card-foreground">이전 미션을 유지하시겠습니까?</h2>
            <p className="mt-1 text-[12px] leading-5 text-muted-foreground">오늘 끝내지 않은 세션이 있어요. 같은 목적지와 미션 순서로 이어갈 수 있습니다.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowResumePrompt(false)}
                className="pressable rounded-xl bg-secondary py-3 text-[13px] font-extrabold text-foreground"
              >
                나중에
              </button>
              <button
                type="button"
                onClick={() => void handleStart()}
                className="pressable rounded-xl bg-foreground py-3 text-[13px] font-extrabold text-background"
              >
                이어가기
              </button>
            </div>
          </div>
        </div>
      )}

      {travelStage !== "home" && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm">
          <motion.div
            key={travelStage}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-background shadow-elevated"
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${profile.accent}`} />

            {travelStage === "departing" && (
              <div className="min-h-[31rem] px-5 py-6">
                <div className="mb-6 flex items-center justify-between">
                  <p className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-muted-foreground">walk2world air</p>
                  <button type="button" onClick={handlePause} className="rounded-full bg-secondary p-2 text-muted-foreground" aria-label="여행 닫기">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="relative h-48 overflow-hidden rounded-2xl bg-gradient-to-br from-ocean/20 via-card to-gold/20">
                  <div className="absolute left-8 right-8 top-1/2 h-0.5 border-t border-dashed border-primary/35" />
                  <motion.div
                    className="absolute left-4 top-[42%] flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-elevated"
                    animate={{ x: [0, 250], y: [0, -20, 2], rotate: [0, 10, 0] }}
                    transition={{ duration: 1.35, ease: "easeInOut", repeat: Infinity }}
                  >
                    <Plane className="h-7 w-7" />
                  </motion.div>
                  <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-[11px] font-extrabold text-muted-foreground">
                    <span>내 동네</span>
                    <span>{profile.arrivalName}</span>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-[12px] font-extrabold text-primary">여행 출발 중</p>
                  <h2 className="mt-2 text-3xl font-extrabold leading-tight text-foreground">산책길 공항에서 이륙합니다</h2>
                  <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
                    GPS를 켜고, 짧은 여행 사운드를 재생했어요. 잠시 후 오늘의 목적지에 도착합니다.
                  </p>
                </div>
              </div>
            )}

            {travelStage === "arrived" && (
              <div className="min-h-[31rem] px-5 py-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-extrabold text-primary">{activeToday.countryFlag} ARRIVED</div>
                  <a
                    href={profile.musicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-foreground"
                  >
                    <Headphones className="h-3.5 w-3.5" />
                    음악
                  </a>
                </div>
                <div className={`rounded-2xl bg-gradient-to-br ${profile.accent} p-5 text-white`}>
                  <p className="text-[12px] font-extrabold text-white/80">오늘의 여행지</p>
                  <h2 className="mt-2 text-3xl font-extrabold leading-tight">{profile.arrivalName}에 도착했어요</h2>
                  <p className="mt-3 text-[13px] leading-6 text-white/85">{profile.countryLine}</p>
                </div>
                <div className="mt-4 rounded-2xl bg-card p-4 shadow-card">
                  <p className="text-[11px] font-bold text-primary">도착 브리핑</p>
                  <p className="mt-2 min-h-[3rem] text-[14px] font-extrabold leading-6 text-foreground">{profile.facts[factIndex]}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTravelStage("mission")}
                  className="pressable mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-[13px] font-extrabold text-background"
                >
                  미션 시작하기
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {travelStage === "mission" && currentMission && currentMissionCopy && (
              <div className="max-h-[88vh] overflow-y-auto px-5 py-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-extrabold text-primary">{profile.arrivalName} 여행 미션</p>
                    <h2 className="mt-1 text-2xl font-extrabold leading-tight text-foreground">미션 {missionIndex + 1} / 5</h2>
                  </div>
                  <button type="button" onClick={handlePause} className="rounded-full bg-secondary p-2 text-muted-foreground" aria-label="잠시 멈추기">
                    <Pause className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-4 flex gap-1.5">
                  {visibleMissions.map((mission, index) => {
                    const isDone = mission.status === "completed";
                    const isSkipped = skippedMissionKeys.includes(mission.missionKey);
                    return (
                      <div
                        key={mission.missionKey}
                        className={`h-2 flex-1 rounded-full ${
                          isDone ? "bg-success" : isSkipped ? "bg-muted-foreground/30" : index === missionIndex ? "bg-primary" : "bg-secondary"
                        }`}
                      />
                    );
                  })}
                </div>

                <div className="rounded-2xl bg-card p-4 shadow-card">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl">{currentMission.emoji}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {proofLabel[currentMission.proofType]} proof
                        </span>
                        <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold">
                          +{currentMission.bonusMeters}m
                        </span>
                      </div>
                      <h3 className="mt-2 text-xl font-extrabold text-foreground">{currentMissionCopy.title}</h3>
                      <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{currentMissionCopy.prompt}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-secondary/70 px-3 py-2">
                    <p className="text-[11px] font-bold text-muted-foreground">
                      현재 게이지 {formatMeters(activeToday.progressMeters)} / {formatMeters(activeToday.dailyGoalMeters)} · {missionProgressLabel}
                    </p>
                  </div>

                  {lastCompletedStamp && (
                    <div className="mt-3 rounded-xl bg-success/10 px-3 py-2 text-[12px] font-extrabold text-success">
                      인증 완료 · {lastCompletedStamp}
                    </div>
                  )}

                  <div className="mt-4">{renderMissionAction(currentMission)}</div>
                </div>

                {allMissionsPassed && (
                  <div className="mt-3 rounded-2xl bg-success/10 p-4">
                    <p className="text-[12px] font-extrabold text-success">오늘의 여행 미션을 모두 지나왔어요</p>
                    <p className="mt-1 text-[12px] leading-5 text-muted-foreground">더 걸어도 좋고, 지금까지 기록으로 결과를 받을 수도 있어요.</p>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleSkipMission}
                    className="pressable rounded-xl bg-secondary py-3 text-[13px] font-extrabold text-foreground"
                  >
                    미션 넘어가기
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleFinish()}
                    disabled={finishSession.isPending || !activeToday.sessionId}
                    className="pressable inline-flex items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-[13px] font-extrabold text-background disabled:opacity-50"
                  >
                    {finishSession.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CircleStop className="h-4 w-4" />}
                    오늘 산책 끝내기
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handlePause}
                  className="pressable mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-[13px] font-extrabold text-foreground"
                >
                  <Pause className="h-4 w-4" />
                  중지하고 나가기
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AppLayout>
  );
};

export default HomePage;
