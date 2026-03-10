import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { setTokens } from "@/lib/api";

const normalizeRedirect = (redirectPath: string | null) => {
  if (!redirectPath || !redirectPath.startsWith("/") || redirectPath.startsWith("//")) {
    return "/";
  }
  return redirectPath;
};

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const { onLoginSuccess } = useAuth();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) {
      return;
    }
    handledRef.current = true;

    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const redirectPath = normalizeRedirect(params.get("redirect"));

    if (!accessToken || !refreshToken) {
      toast.error("소셜 로그인 처리에 실패했습니다");
      navigate("/login", { replace: true });
      return;
    }

    setTokens(accessToken, refreshToken);
    onLoginSuccess();
    toast.success("카카오 로그인 성공!");
    navigate(redirectPath, { replace: true });
  }, [navigate, onLoginSuccess]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <p className="text-sm text-muted-foreground">로그인 정보를 확인하고 있습니다...</p>
    </div>
  );
};

export default OAuthCallbackPage;
