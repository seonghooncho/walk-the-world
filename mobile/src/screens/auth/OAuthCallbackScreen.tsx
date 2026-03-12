import { useEffect } from "react";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
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
  const params = useLocalSearchParams<{ authResult?: string | string[] }>();
  const url = Linking.useURL();
  const authResult =
    typeof params.authResult === "string"
      ? params.authResult
      : Array.isArray(params.authResult)
        ? params.authResult[0]
        : null;

  useEffect(() => {
    const rawUrl = authResult ?? url;
    if (!rawUrl) {
      return;
    }

    const hash = rawUrl.includes("#") ? rawUrl.slice(rawUrl.indexOf("#") + 1) : "";
    const query = rawUrl.includes("?")
      ? rawUrl.slice(rawUrl.indexOf("?") + 1, rawUrl.includes("#") ? rawUrl.indexOf("#") : undefined)
      : "";
    const searchParams = new URLSearchParams(hash || query);
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const redirectPath = normalizeRedirect(searchParams.get("redirect"));
    const provider = searchParams.get("provider");
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    if (error) {
      toast.error(message || `${provider === "google" ? "Google" : "카카오"} 로그인에 실패했습니다`);
      router.replace("/login");
      return;
    }

    if (!accessToken || !refreshToken) {
      toast.error("소셜 로그인 처리에 실패했습니다");
      router.replace("/login");
      return;
    }

    setTokens(accessToken, refreshToken)
      .then(() => {
        onLoginSuccess();
        toast.success(`${provider === "google" ? "Google" : "카카오"} 로그인 성공!`);
        router.replace(redirectPath as never);
      })
      .catch(() => {
        toast.error("소셜 로그인 처리에 실패했습니다");
        router.replace("/login");
      });
  }, [authResult, onLoginSuccess, toast, url]);

  return (
    <AppScreen centerContent>
      <AppText tone="muted">로그인 정보를 확인하고 있습니다...</AppText>
    </AppScreen>
  );
}
