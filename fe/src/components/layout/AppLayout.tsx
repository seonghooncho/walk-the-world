import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
  className?: string;
  contentClassName?: string;
}

const AppLayout = ({ children, hideNav = false, className, contentClassName }: AppLayoutProps) => {
  return (
    <div className={cn("relative mx-auto min-h-screen w-full max-w-lg overflow-x-hidden bg-background", className)}>
      <main className={cn("min-w-0", !hideNav && "app-content-with-nav", contentClassName)}>{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  );
};

export default AppLayout;
