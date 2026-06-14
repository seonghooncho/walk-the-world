import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { RotateCw } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isLoggedIn) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 text-center shadow-card">
          <p className="text-base font-bold text-foreground">사용자 정보를 불러오지 못했습니다</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            네트워크 상태를 확인한 뒤 다시 시도해주세요. 토큰은 유지되며 새로고침 후 다시 확인합니다.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="pressable mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
          >
            <RotateCw className="h-4 w-4" />
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
