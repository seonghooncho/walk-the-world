import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { AppState, PermissionsAndroid, Platform } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { Pedometer } from "expo-sensors";
import { useAuth } from "@/src/contexts/AuthContext";
import { stepsApi } from "@/src/lib/api";
import { readSecureValue, writeSecureValue } from "@/src/lib/storage";

const STEP_SYNC_STATE_KEY = "ww_step_sync_state_v1";
const STEP_POLL_INTERVAL_MS = 60_000;

interface StepSyncState {
  userId: number;
  date: string;
  steps: number;
}

function getTodayKey(now: Date) {
  return now.toISOString().slice(0, 10);
}

function getStartOfToday(now: Date) {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  return date;
}

async function readStepSyncState() {
  const raw = await readSecureValue(STEP_SYNC_STATE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StepSyncState>;
    if (typeof parsed.userId !== "number" || typeof parsed.date !== "string" || typeof parsed.steps !== "number") {
      return null;
    }
    return parsed as StepSyncState;
  } catch {
    return null;
  }
}

async function writeStepSyncState(state: StepSyncState) {
  await writeSecureValue(STEP_SYNC_STATE_KEY, JSON.stringify(state));
}

async function requestActivityPermission() {
  if (Platform.OS !== "android" || Platform.Version < 29) {
    return true;
  }

  const permission = PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION;
  const alreadyGranted = await PermissionsAndroid.check(permission);
  if (alreadyGranted) {
    return true;
  }

  const result = await PermissionsAndroid.request(permission, {
    title: "걸음 수 접근 권한",
    message: "실제 걸음 수를 여행 진행도에 반영하려면 활동 인식 권한이 필요합니다.",
    buttonPositive: "허용",
    buttonNegative: "나중에",
  });

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export function StepSyncProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { isLoggedIn, isReady, user } = useAuth();
  const isSyncingRef = useRef(false);
  const permissionGrantedRef = useRef(false);
  const availabilityCheckedRef = useRef(false);
  const pedometerAvailableRef = useRef(false);

  const syncTodaySteps = useCallback(async () => {
    if (!isLoggedIn || !isReady || !user?.id || Platform.OS === "web" || isSyncingRef.current) {
      return;
    }

    if (!permissionGrantedRef.current || (availabilityCheckedRef.current && !pedometerAvailableRef.current)) {
      return;
    }

    isSyncingRef.current = true;

    try {
      const now = new Date();
      const todayKey = getTodayKey(now);
      const stepCount = await Pedometer.getStepCountAsync(getStartOfToday(now), now);
      const currentSteps = Math.max(stepCount.steps ?? 0, 0);
      const previousState = await readStepSyncState();
      let previousSteps = 0;
      if (previousState?.userId === user.id && previousState.date === todayKey) {
        previousSteps = previousState.steps;
      } else if (previousState && previousState.userId !== user.id) {
        previousSteps = currentSteps;
      }
      const delta = Math.max(currentSteps - previousSteps, 0);

      if (delta > 0) {
        await stepsApi.sync(delta);
        await queryClient.invalidateQueries({ queryKey: ["steps"] });
        await queryClient.invalidateQueries({ queryKey: ["me"] });
        await queryClient.invalidateQueries({ queryKey: ["badges"] });
      }

      await writeStepSyncState({ userId: user.id, date: todayKey, steps: currentSteps });
    } catch {
      // Permission revocation and unsupported devices should fail silently.
    } finally {
      isSyncingRef.current = false;
    }
  }, [isLoggedIn, isReady, queryClient, user?.id]);

  useEffect(() => {
    if (!isReady || !isLoggedIn || !user?.id || Platform.OS === "web") {
      permissionGrantedRef.current = false;
      availabilityCheckedRef.current = false;
      pedometerAvailableRef.current = false;
      return;
    }

    let cancelled = false;
    let subscription: { remove: () => void } | null = null;
    const interval = setInterval(() => {
      if (AppState.currentState === "active") {
        void syncTodaySteps();
      }
    }, STEP_POLL_INTERVAL_MS);

    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void syncTodaySteps();
      }
    });

    const start = async () => {
      const permissionGranted = await requestActivityPermission();
      if (cancelled || !permissionGranted) {
        permissionGrantedRef.current = permissionGranted;
        return;
      }

      permissionGrantedRef.current = true;
      const pedometerAvailable = await Pedometer.isAvailableAsync();
      availabilityCheckedRef.current = true;
      pedometerAvailableRef.current = pedometerAvailable;

      if (cancelled || !pedometerAvailable) {
        return;
      }

      await syncTodaySteps();
      subscription = Pedometer.watchStepCount(() => {
        void syncTodaySteps();
      });
    };

    void start();

    return () => {
      cancelled = true;
      subscription?.remove();
      appStateSubscription.remove();
      clearInterval(interval);
    };
  }, [isLoggedIn, isReady, syncTodaySteps, user?.id]);

  return children;
}
