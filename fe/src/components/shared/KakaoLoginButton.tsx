import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const defaultRedirectPath = () => {
  const currentPath = `${window.location.pathname}${window.location.search}` || "/";
  if (window.location.pathname === "/login" || window.location.pathname === "/auth/callback") {
    return "/";
  }
  return currentPath;
};

const KakaoLoginButton = () => {
  const handleClick = () => {
    try {
      const startUrl = new URL("/api/auth/v1/oauth/kakao/start", API_BASE_URL || window.location.origin);
      startUrl.searchParams.set("frontendOrigin", window.location.origin);
      startUrl.searchParams.set("redirectPath", defaultRedirectPath());
      window.location.assign(startUrl.toString());
    } catch {
      toast.error("카카오 로그인 시작에 실패했습니다");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-opacity"
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
  );
};

export default KakaoLoginButton;
