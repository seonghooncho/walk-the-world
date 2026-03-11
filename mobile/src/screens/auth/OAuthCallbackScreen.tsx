import { useEffect } from "react";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { AppScreen } from "@/src/components/common/AppScreen";
import { AppText } from "@/src/components/common/AppText";
import { useAuth } from "@/src/contexts/AuthContext";
import { setTokens } from "@/src/lib/api";
import { useToast } from "@/src/providers/ToastProvider";

function normalizeRedirect(redirectPath: string | null) {
  if (!redirectPath || !redirectPath.startsWith("/") || redirectPath.startsWith("//")) {
    return "/";
  }
  return redirectPath;
}

export function OAuthCallbackScreen() {
  const toast = useToast();
  const { onLoginSuccess } = useAuth();
  const url = Linking.useURL();

  useEffect(() => {
    if (!url) {
      return;
    }

    const hash = url.includes("#") ? url.slice(url.indexOf("#") + 1) : "";
    const query = url.includes("?") ? url.slice(url.indexOf("?") + 1, url.includes("#") ? url.indexOf("#") : undefined) : "";
    const params = new URLSearchParams(hash || query);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const redirectPath = normalizeRedirect(params.get("redirect"));

    if (!accessToken || !refreshToken) {
      toast.error("소셜 로그인 처리에 실패했습니다");
      router.replace("/login");
      return;
    }

    setTokens(accessToken, refreshToken)
      .then(() => {
        onLoginSuccess();
        toast.success("카카오 로그인 성공!");
        router.replace(redirectPath as never);
      })
      .catch(() => {
        toast.error("소셜 로그인 처리에 실패했습니다");
        router.replace("/login");
      });
  }, [onLoginSuccess, toast, url]);

  return (
    <AppScreen centerContent>
      <AppText tone="muted">로그인 정보를 확인하고 있습니다...</AppText>
    </AppScreen>
  );
}
