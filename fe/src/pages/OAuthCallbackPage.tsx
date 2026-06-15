import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, setTokens } from "@/lib/api";

const normalizeRedirect = (redirectPath: string | null) => {
  if (!redirectPath || !redirectPath.startsWith("/") || redirectPath.startsWith("//")) {
    return "/";
  }
  return redirectPath;
};

const AUTH_READY_TIMEOUT_MESSAGE = "AUTH_READY_TIMEOUT";

const withAuthReadyTimeout = async <T,>(promise: Promise<T>, timeoutMs = 9000) => {
  let timeoutId: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(AUTH_READY_TIMEOUT_MESSAGE)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
};

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const { onLoginSuccess } = useAuth();
  const handledRef = useRef(false);
  const [status, setStatus] = useState("소셜 로그인 응답을 확인하고 있어요");

  useEffect(() => {
    if (handledRef.current) {
      return;
    }
    handledRef.current = true;

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const searchParams = new URLSearchParams(window.location.search);
    const params = Array.from(hashParams.keys()).length > 0 ? hashParams : searchParams;
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const redirectPath = normalizeRedirect(params.get("redirect"));
    const error = searchParams.get("error") ?? hashParams.get("error");

    if (error) {
      setStatus("소셜 로그인 제공자가 오류를 반환했어요");
      toast.error("소셜 로그인 처리에 실패했습니다");
      navigate(`/login?redirect=${encodeURIComponent(redirectPath)}&error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }

    if (!accessToken || !refreshToken) {
      setStatus("로그인 토큰을 찾지 못했어요");
      toast.error("로그인 토큰을 확인하지 못했습니다");
      navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`, { replace: true });
      return;
    }

    const complete = async () => {
      setStatus("토큰 저장 완료 · 여권 정보를 확인하고 있어요");
      setTokens(accessToken, refreshToken);

      try {
        await withAuthReadyTimeout(onLoginSuccess());
        setStatus("여권 확인 완료 · 이동합니다");
        toast.success("소셜 로그인 성공!");
      } catch (authError) {
        if (authError instanceof Error && authError.message === AUTH_READY_TIMEOUT_MESSAGE) {
          setStatus("로그인은 완료됐고 여권 정보가 조금 늦게 도착하고 있어요");
          toast.success("로그인은 완료됐어요", {
            description: "앱으로 이동한 뒤 여권 정보를 다시 확인합니다.",
          });
        } else {
          setStatus("여권 확인에 실패했어요");
          if (authError instanceof ApiError && authError.status === 401) {
            toast.error("로그인 토큰이 만료됐거나 유효하지 않습니다");
            navigate(`/login?redirect=${encodeURIComponent(redirectPath)}&error=token`, { replace: true });
            return;
          }
          toast.error(authError instanceof Error ? authError.message : "소셜 로그인 확인에 실패했습니다");
          navigate(`/login?redirect=${encodeURIComponent(redirectPath)}&error=profile`, { replace: true });
          return;
        }
      }

      navigate(redirectPath, { replace: true });
    };

    void complete();
  }, [navigate, onLoginSuccess]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-xs rounded-2xl bg-card p-5 text-center shadow-card">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm font-extrabold text-foreground">로그인 정보를 확인하고 있습니다</p>
        <p className="mt-2 text-[12px] leading-5 text-muted-foreground">{status}</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
