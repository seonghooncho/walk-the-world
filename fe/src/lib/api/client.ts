const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

let accessToken: string | null = localStorage.getItem("ww_access_token");
let refreshToken: string | null = localStorage.getItem("ww_refresh_token");

const dispatchTokenChange = () => {
  window.dispatchEvent(new CustomEvent("ww:auth:tokens-changed", { detail: { authenticated: !!accessToken } }));
};

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

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem("ww_access_token", access);
  localStorage.setItem("ww_refresh_token", refresh);
  dispatchTokenChange();
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem("ww_access_token");
  localStorage.removeItem("ww_refresh_token");
  dispatchTokenChange();
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken;
}

export function isAuthenticated() {
  return !!accessToken;
}

async function refreshAccessToken(): Promise<boolean> {
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

    setTokens(body.data.accessToken, body.data.refreshToken);
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
    "Content-Type": "application/json",
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

    clearTokens();
    window.dispatchEvent(new CustomEvent("ww:auth:expired"));
    throw new ApiError("TOKEN_EXPIRED", "인증이 만료되었습니다", 401);
  }

  const body: ApiResponseBody<T> = await response.json();
  if (!body.success && body.error) {
    throw new ApiError(body.error.code, body.error.message, response.status);
  }

  return body;
}
