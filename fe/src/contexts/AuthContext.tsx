import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { ApiError, isAuthenticated, clearTokens } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useMe } from "@/hooks/useApi";
import type { UserProfile } from "@/lib/api";

interface AuthContextType {
  /** 토큰이 존재하는지 (로그인 상태) */
  isLoggedIn: boolean;
  /** API에서 가져온 유저 정보 (데모 모드에서는 null) */
  user: UserProfile | null;
  isLoading: boolean;
  /** 로그인 모달 표시 여부 */
  showLoginModal: boolean;
  /** 로그인 모달을 여는 함수 */
  requireLogin: () => void;
  /** 로그인 모달을 닫는 함수 */
  dismissLoginModal: () => void;
  /** 로그아웃: 토큰 삭제 + 쿼리 캐시 초기화 */
  logout: () => void;
  /** 로그인 성공 후 토큰 상태와 프로필 캐시를 동기화 */
  onLoginSuccess: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  isLoading: false,
  showLoginModal: false,
  requireLogin: () => {},
  dismissLoginModal: () => {},
  logout: () => {},
  onLoginSuccess: async () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [hasToken, setHasToken] = useState(isAuthenticated());
  const [showLoginModal, setShowLoginModal] = useState(false);

  // useMe는 토큰이 있을 때만 실행한다. 토큰 저장과 프로필 조회 성공은 별도 상태로 본다.
  const { data: user, isLoading, error, refetch } = useMe({ enabled: hasToken });

  // 401 이벤트 수신 → 로그인 모달 표시
  useEffect(() => {
    const handler = () => {
      setHasToken(false);
      setShowLoginModal(true);
    };
    window.addEventListener("ww:auth:expired", handler);
    return () => window.removeEventListener("ww:auth:expired", handler);
  }, []);

  // 토큰 상태 동기화
  useEffect(() => {
    const syncTokenState = () => {
      setHasToken(isAuthenticated());
    };
    window.addEventListener("ww:auth:tokens-changed", syncTokenState);
    window.addEventListener("storage", syncTokenState);
    return () => {
      window.removeEventListener("ww:auth:tokens-changed", syncTokenState);
      window.removeEventListener("storage", syncTokenState);
    };
  }, []);

  // 인증이 명확히 거부된 경우에만 토큰을 삭제한다. 일시적인 네트워크/서버 오류는 복구 UI가 처리한다.
  useEffect(() => {
    if (error instanceof ApiError && error.status === 401) {
      clearTokens();
      setHasToken(false);
    }
  }, [error]);

  const logout = useCallback(() => {
    clearTokens();
    setHasToken(false);
    qc.clear();
  }, [qc]);

  const requireLogin = useCallback(() => {
    setShowLoginModal(true);
  }, []);

  const dismissLoginModal = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  const onLoginSuccess = useCallback(async () => {
    setHasToken(isAuthenticated());
    setShowLoginModal(false);
    qc.invalidateQueries({ queryKey: ["me"] });
    const result = await refetch();
    if (result.error) {
      throw result.error;
    }
    return result.data ?? null;
  }, [qc, refetch]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: hasToken,
        user: user ?? null,
        isLoading,
        showLoginModal,
        requireLogin,
        dismissLoginModal,
        logout,
        onLoginSuccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
