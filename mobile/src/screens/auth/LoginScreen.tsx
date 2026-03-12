import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";
import { Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useIdTokenAuthRequest } from "expo-auth-session/providers/google";
import { router } from "expo-router";
import { BrandIcon } from "@/src/components/common/BrandIcon";
import { AppScreen } from "@/src/components/common/AppScreen";
import { AppText } from "@/src/components/common/AppText";
import { PrimaryButton } from "@/src/components/common/PrimaryButton";
import { TextField } from "@/src/components/common/TextField";
import { useAuth } from "@/src/contexts/AuthContext";
import { useGoogleLogin, useLogin, useSignup } from "@/src/hooks/useApi";
import { isValidSignupPassword, normalizePassword, PASSWORD_RULE_MESSAGE } from "@/src/lib/password";
import { palette, radius, spacing } from "@/src/lib/theme";
import { useToast } from "@/src/providers/ToastProvider";

WebBrowser.maybeCompleteAuthSession();

type Mode = "login" | "signup";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "";
const googleConfig = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
};

export function LoginScreen() {
  const toast = useToast();
  const { isLoggedIn, onLoginSuccess } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();
  const signup = useSignup();
  const googleLogin = useGoogleLogin();

  const googleClientIdForPlatform = useMemo(() => {
    if (Platform.OS === "ios") {
      return googleConfig.iosClientId;
    }

    if (Platform.OS === "android") {
      return googleConfig.androidClientId;
    }

    if (Platform.OS === "web") {
      return googleConfig.webClientId;
    }

    return googleConfig.webClientId || googleConfig.iosClientId || googleConfig.androidClientId;
  }, []);
  const googleEnabled = Boolean(googleClientIdForPlatform);
  const [request, response, promptAsync] = useIdTokenAuthRequest({
    webClientId: googleConfig.webClientId,
    iosClientId: googleConfig.iosClientId,
    androidClientId: googleConfig.androidClientId,
  });

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const idToken = response?.type === "success" ? response.params.id_token : null;
    if (!idToken) {
      return;
    }

    googleLogin
      .mutateAsync(idToken)
      .then(() => {
        toast.success("구글 로그인 성공!");
        onLoginSuccess();
        router.replace("/");
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "구글 로그인에 실패했습니다");
      });
  }, [googleLogin, onLoginSuccess, response, toast]);

  const submit = async () => {
    const normalizedEmail = email.trim();
    const normalizedPassword = normalizePassword(password);
    const normalizedName = name.trim();

    if (mode === "signup" && !isValidSignupPassword(normalizedPassword)) {
      toast.error(PASSWORD_RULE_MESSAGE);
      return;
    }

    try {
      if (mode === "login") {
        await login.mutateAsync({ email: normalizedEmail, password: normalizedPassword });
      } else {
        await signup.mutateAsync({ email: normalizedEmail, password: normalizedPassword, name: normalizedName });
      }
      toast.success(mode === "login" ? "로그인 성공!" : "회원가입 완료!");
      onLoginSuccess();
      router.replace("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "오류가 발생했습니다");
    }
  };

  const startKakaoLogin = async () => {
    try {
      const frontendOrigin = Linking.createURL("/");
      const callbackUrl = Linking.createURL("/auth/callback");
      const startUrl = new URL("/api/auth/v1/oauth/kakao/start", API_BASE_URL);
      startUrl.searchParams.set("frontendOrigin", frontendOrigin);
      startUrl.searchParams.set("redirectPath", "/");
      const result = await WebBrowser.openAuthSessionAsync(startUrl.toString(), callbackUrl);
      if (result.type === "success" && result.url) {
        router.replace(`/auth/callback?authResult=${encodeURIComponent(result.url)}` as never);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "카카오 로그인 시작에 실패했습니다");
    }
  };

  return (
    <AppScreen padded>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoWrap}>
          <View style={styles.logoRow}>
            <BrandIcon size={56} />
            <AppText variant="display">걸어서 세계속으로</AppText>
          </View>
          <AppText tone="muted">걸음으로 시간을 잇는 여행을 시작하세요</AppText>
        </View>

        <View style={styles.toggle}>
          {(["login", "signup"] as Mode[]).map((item) => (
            <Pressable key={item} onPress={() => setMode(item)} style={[styles.toggleItem, mode === item && styles.toggleActive]}>
              <AppText variant="bodyBold" tone={mode === item ? "default" : "muted"}>
                {item === "login" ? "로그인" : "회원가입"}
              </AppText>
            </Pressable>
          ))}
        </View>

        <View style={{ gap: spacing.md }}>
          {mode === "signup" ? (
            <TextField value={name} onChangeText={setName} placeholder="이름" icon={User} autoCapitalize="words" />
          ) : null}
          <TextField value={email} onChangeText={setEmail} placeholder="이메일" icon={Mail} keyboardType="email-address" />
          <TextField
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호"
            icon={Lock}
            secureTextEntry={!showPassword}
            note={mode === "signup" ? PASSWORD_RULE_MESSAGE : undefined}
            rightAction={
              <Pressable onPress={() => setShowPassword((current) => !current)}>
                {showPassword ? <EyeOff size={16} color={palette.mutedForeground} /> : <Eye size={16} color={palette.mutedForeground} />}
              </Pressable>
            }
          />
        </View>

        <PrimaryButton
          title={mode === "login" ? "로그인" : "가입하기"}
          onPress={submit}
          loading={login.isPending || signup.isPending}
          style={{ marginTop: spacing.md }}
        />

        <View style={styles.divider}>
          <View style={styles.line} />
          <AppText variant="caption">또는</AppText>
          <View style={styles.line} />
        </View>

        <View style={{ gap: spacing.md }}>
          <Pressable
            disabled={!googleEnabled || !request}
            onPress={() => promptAsync()}
            style={[styles.socialButton, !googleEnabled && { opacity: 0.4 }]}
          >
            <AppText variant="bodyBold">
              {googleEnabled ? "Google로 시작하기" : Platform.OS === "ios" ? "Google iOS 설정 필요" : "Google 설정 필요"}
            </AppText>
          </Pressable>
          <Pressable onPress={startKakaoLogin} style={[styles.socialButton, styles.kakaoButton]}>
            <AppText variant="bodyBold">카카오로 시작하기</AppText>
          </Pressable>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingTop: 32,
    paddingBottom: 120,
    gap: spacing.xl,
    justifyContent: "center",
  },
  logoWrap: {
    alignItems: "center",
    gap: spacing.sm,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: palette.secondary,
    padding: 4,
    borderRadius: radius.lg,
  },
  toggleItem: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  toggleActive: {
    backgroundColor: palette.card,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: palette.border,
  },
  socialButton: {
    minHeight: 52,
    borderRadius: radius.xl,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: "center",
    justifyContent: "center",
  },
  kakaoButton: {
    backgroundColor: "#FEE500",
    borderColor: "#FEE500",
  },
});
