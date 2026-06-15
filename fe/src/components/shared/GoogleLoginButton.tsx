import { useEffect, useRef, useCallback, useState } from "react";
import { useGoogleLogin } from "@/hooks/useApi";
import { toast } from "sonner";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

interface Props {
  onSuccess: () => Promise<void>;
}

const GoogleLoginButton = ({ onSuccess }: Props) => {
  const btnRef = useRef<HTMLDivElement>(null);
  const googleLogin = useGoogleLogin();
  const [status, setStatus] = useState<string | null>(null);

  const getErrorMessage = (error: unknown) => {
    return error instanceof Error ? error.message : "구글 로그인에 실패했습니다";
  };

  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      setStatus("Google 계정 확인 중");
      const slowTimer = window.setTimeout(() => {
        setStatus("응답이 느려요 · 로그인 토큰을 계속 확인하고 있습니다");
      }, 3500);

      try {
        const result = await googleLogin.mutateAsync(response.credential);
        setStatus("여권 정보를 여는 중");
        toast.success(result.restored ? "계정이 복구되었습니다" : "구글 로그인 성공!");
        await onSuccess();
      } catch (error: unknown) {
        toast.error(getErrorMessage(error));
        setStatus(null);
      } finally {
        window.clearTimeout(slowTimer);
      }
    },
    [googleLogin, onSuccess]
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      if (btnRef.current) {
        window.google?.accounts.id.renderButton(btnRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          width: btnRef.current.offsetWidth,
          text: "signin_with",
          shape: "pill",
          logo_alignment: "center",
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [handleCredentialResponse]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        onClick={() => toast.info("Google Client ID가 설정되지 않았습니다. VITE_GOOGLE_CLIENT_ID 환경변수를 설정해주세요.")}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-bold text-card-foreground transition-colors hover:bg-secondary"
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92a8.78 8.78 0 0 0 2.68-6.62z" fill="#4285F4" />
          <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18z" fill="#34A853" />
          <path d="M3.96 10.71A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3-2.33z" fill="#FBBC05" />
          <path d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z" fill="#EA4335" />
        </svg>
        Google로 시작하기
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={btnRef} className="w-full" />
      {status && (
        <div className="rounded-xl bg-secondary px-3 py-2 text-center text-[12px] font-bold text-muted-foreground">
          {status}
        </div>
      )}
    </div>
  );
};

// Type declaration for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

export default GoogleLoginButton;
