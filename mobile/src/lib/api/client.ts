import { readSecureValue, removeSecureValue, writeSecureValue } from "@/src/lib/storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "";
const ACCESS_TOKEN_KEY = "ww_access_token";
const REFRESH_TOKEN_KEY = "ww_refresh_token";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let hydrated = false;
const authExpiredListeners = new Set<() => void>();

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  hasNext?: boolean;
  nextCursor?: string;
}

export interface ApiResponseBody<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
  meta?: ApiMeta;
}

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function hydrateTokens() {
  if (hydrated) {
    return { accessToken, refreshToken };
  }

  accessToken = await readSecureValue(ACCESS_TOKEN_KEY);
  refreshToken = await readSecureValue(REFRESH_TOKEN_KEY);
  hydrated = true;

  return { accessToken, refreshToken };
}

export async function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  hydrated = true;

  await Promise.all([
    writeSecureValue(ACCESS_TOKEN_KEY, access),
    writeSecureValue(REFRESH_TOKEN_KEY, refresh),
  ]);
}

export async function clearTokens() {
  accessToken = null;
  refreshToken = null;
  hydrated = true;

  await Promise.all([
    removeSecureValue(ACCESS_TOKEN_KEY),
    removeSecureValue(REFRESH_TOKEN_KEY),
  ]);
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken;
}

export function isAuthenticated() {
  return Boolean(accessToken);
}

export function isSessionHydrated() {
  return hydrated;
}

export function onAuthExpired(listener: () => void) {
  authExpiredListeners.add(listener);
  return () => {
    authExpiredListeners.delete(listener);
  };
}

function emitAuthExpired() {
  for (const listener of authExpiredListeners) {
    listener();
  }
}

async function refreshAccessToken() {
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/v1/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return false;
    }

    const body: ApiResponseBody<{ accessToken: string; refreshToken: string }> = await response.json();
    if (!body.success || !body.data) {
      return false;
    }

    await setTokens(body.data.accessToken, body.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<ApiResponseBody<T>> {
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...((options.headers as Record<string, string>) || {}),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch<T>(path, options, false);
    }

    await clearTokens();
    emitAuthExpired();
    throw new ApiError("TOKEN_EXPIRED", "인증이 만료되었습니다", 401);
  }

  const body = (await response.json()) as ApiResponseBody<T>;
  if (!body.success && body.error) {
    throw new ApiError(body.error.code, body.error.message, response.status);
  }

  return body;
}
