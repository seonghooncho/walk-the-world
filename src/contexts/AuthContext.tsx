import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { isAuthenticated, clearTokens, getAccessToken } from "@/lib/api";
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
  /** 로그인 성공 후 호출 */
  onLoginSuccess: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  isLoading: false,
  showLoginModal: false,
  requireLogin: () => {},
  dismissLoginModal: () => {},
  logout: () => {},
  onLoginSuccess: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [showLoginModal, setShowLoginModal] = useState(false);

  // useMe는 토큰이 있을 때만 실행
  const { data: user, isLoading, error } = useMe();

  // 401 이벤트 수신 → 로그인 모달 표시
  useEffect(() => {
    const handler = () => {
      setIsLoggedIn(false);
      setShowLoginModal(true);
    };
    window.addEventListener("ww:auth:expired", handler);
    return () => window.removeEventListener("ww:auth:expired", handler);
  }, []);

  // 토큰 상태 동기화
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, [user]);

  // 토큰 있는데 API 인증 실패 → 토큰 삭제
  useEffect(() => {
    if (error && getAccessToken()) {
      clearTokens();
      setIsLoggedIn(false);
    }
  }, [error]);

  const logout = useCallback(() => {
    clearTokens();
    setIsLoggedIn(false);
    qc.clear();
  }, [qc]);

  const requireLogin = useCallback(() => {
    setShowLoginModal(true);
  }, []);

  const dismissLoginModal = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  const onLoginSuccess = useCallback(() => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
    qc.invalidateQueries({ queryKey: ["me"] });
  }, [qc]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
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
