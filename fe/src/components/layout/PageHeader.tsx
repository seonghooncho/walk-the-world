import { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useLocation, useNavigate, type To } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: To;
  rightElement?: ReactNode;
  className?: string;
}

const PageHeader = ({ title, subtitle, showBack = false, backTo = "/", rightElement, className }: PageHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    const historyState = window.history.state as { idx?: number } | null;
    const canGoBackWithinApp = location.key !== "default" && typeof historyState?.idx === "number" && historyState.idx > 0;

    if (canGoBackWithinApp) {
      navigate(-1);
      return;
    }

    navigate(backTo, { replace: true });
  };

  return (
    <header className={cn("app-layer-header sticky top-0 border-b border-border/60 bg-card/85 backdrop-blur-xl", className)}>
      <div className="flex min-h-14 items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              className="pressable -ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="이전 페이지로 이동"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-[17px] font-bold text-foreground">{title}</h1>
            {subtitle && <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {rightElement && <div className="shrink-0">{rightElement}</div>}
      </div>
    </header>
  );
};

export default PageHeader;
