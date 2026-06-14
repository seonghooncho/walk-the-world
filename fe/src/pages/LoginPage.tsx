import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLogin, useSignup } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import GoogleLoginButton from "@/components/shared/GoogleLoginButton";
import KakaoLoginButton from "@/components/shared/KakaoLoginButton";
import { isValidSignupPassword, normalizePassword, PASSWORD_RULE_MESSAGE } from "@/lib/password";

type Mode = "login" | "signup";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, onLoginSuccess } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);

  const login = useLogin();
  const signup = useSignup();
  const isLoading = login.isPending || signup.isPending;

  const getErrorMessage = (error: unknown) => {
    return error instanceof Error ? error.message : "오류가 발생했습니다";
  };

  const redirectPath = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get("redirect");
    if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
      return "/";
    }
    if (redirect.startsWith("/login") || redirect.startsWith("/auth/callback")) {
      return "/";
    }
    return redirect;
  }, [location.search]);

  useEffect(() => {
    if (isLoggedIn) {
      navigate(redirectPath, { replace: true });
    }
  }, [isLoggedIn, navigate, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      navigate(redirectPath, { replace: true });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3">
            <img src="/brand-icon.svg" alt="걸어서 세계속으로 아이콘" className="h-12 w-12" />
            <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">걸어서 세계속으로</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            걸음으로 시간을 잇는 여행을 시작하세요
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-xl bg-secondary p-1">
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                mode === m
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {m === "login" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름"
                required
                className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              required
              className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              required
              className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {mode === "signup" && (
            <p className="px-1 text-xs text-muted-foreground">{PASSWORD_RULE_MESSAGE}</p>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-opacity disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <>
                {mode === "login" ? "로그인" : "가입하기"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-xs text-muted-foreground">또는</span>
          </div>
        </div>

        {/* Social logins */}
        <div className="space-y-2.5">
          <GoogleLoginButton onSuccess={onLoginSuccess} />
          <KakaoLoginButton />
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
