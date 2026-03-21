import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearTokens, getAccessToken, hydrateTokens, isAuthenticated, onAuthExpired } from "@/src/lib/api";
import { useMe } from "@/src/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import type { UserProfile } from "@/src/lib/api";

interface AuthContextValue {
  isReady: boolean;
  isLoggedIn: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  showLoginPrompt: boolean;
  requireLogin: () => void;
  dismissLoginPrompt: () => void;
  onLoginSuccess: () => void;
  logoutLocally: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isReady: false,
  isLoggedIn: false,
  user: null,
  isLoading: false,
  showLoginPrompt: false,
  requireLogin: () => {},
  dismissLoginPrompt: () => {},
  onLoginSuccess: () => {},
  logoutLocally: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { data: user, isLoading, error } = useMe();

  useEffect(() => {
    hydrateTokens()
      .then(() => setIsLoggedIn(isAuthenticated()))
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    return onAuthExpired(() => {
      setIsLoggedIn(false);
      setShowLoginPrompt(true);
    });
  }, []);

  useEffect(() => {
    if (isReady) {
      setIsLoggedIn(isAuthenticated());
    }
  }, [isReady, user]);

  useEffect(() => {
    if (error && getAccessToken()) {
      void clearTokens().finally(() => setIsLoggedIn(false));
    }
  }, [error]);

  const requireLogin = useCallback(() => setShowLoginPrompt(true), []);
  const dismissLoginPrompt = useCallback(() => setShowLoginPrompt(false), []);

  const onLoginSuccess = useCallback(() => {
    setIsLoggedIn(true);
    setShowLoginPrompt(false);
    queryClient.invalidateQueries({ queryKey: ["me"] });
  }, [queryClient]);

  const logoutLocally = useCallback(async () => {
    await clearTokens();
    setIsLoggedIn(false);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(
    () => ({
      isReady,
      isLoggedIn,
      user: user ?? null,
      isLoading,
      showLoginPrompt,
      requireLogin,
      dismissLoginPrompt,
      onLoginSuccess,
      logoutLocally,
    }),
    [dismissLoginPrompt, isLoading, isLoggedIn, isReady, logoutLocally, onLoginSuccess, requireLogin, showLoginPrompt, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
