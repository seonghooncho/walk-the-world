import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, X } from "lucide-react";
import { useLogin, useSignup } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import GoogleLoginButton from "@/components/shared/GoogleLoginButton";

type Mode = "login" | "signup";

const LoginModal = () => {
  const { showLoginModal, dismissLoginModal, onLoginSuccess } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        await login.mutateAsync({ email, password });
      } else {
        await signup.mutateAsync({ email, password, name });
      }
      toast.success(mode === "login" ? "로그인 성공!" : "회원가입 완료!");
      onLoginSuccess();
      setEmail("");
      setPassword("");
      setName("");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleKakaoLogin = () => {
    toast.info("카카오 로그인은 카카오 개발자 앱 설정 후 사용 가능합니다");
  };

  return (
    <AnimatePresence>
      {showLoginModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && dismissLoginModal()}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-card p-6 pb-safe shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-card-foreground">
                  로그인이 필요합니다
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  계속하려면 로그인해주세요
                </p>
              </div>
              <button
                onClick={dismissLoginModal}
                className="rounded-full p-1.5 hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Mode toggle */}
            <div className="flex rounded-xl bg-secondary p-1 mb-4">
              {(["login", "signup"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                    mode === m
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  {m === "login" ? "로그인" : "회원가입"}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름"
                    required
                    className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                  className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                  minLength={6}
                  pattern="^(?=.*[A-Za-z])(?=.*\\d).{6,100}$"
                  title="비밀번호는 영문과 숫자를 포함해 6자 이상이어야 합니다"
                  className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-opacity disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>
                    {mode === "login" ? "로그인" : "가입하기"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs text-muted-foreground">또는</span>
              </div>
            </div>

            {/* Social logins */}
            <div className="space-y-2.5">
              <GoogleLoginButton onSuccess={onLoginSuccess} />

              <button
                onClick={handleKakaoLogin}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-opacity"
                style={{ backgroundColor: "#FEE500", color: "#191919" }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 1C4.58 1 1 3.79 1 7.21c0 2.15 1.43 4.04 3.58 5.12l-.91 3.37c-.08.29.25.52.5.35l3.94-2.63c.29.03.58.05.89.05 4.42 0 8-2.79 8-6.26S13.42 1 9 1z"
                    fill="#191919"
                  />
                </svg>
                카카오로 시작하기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
