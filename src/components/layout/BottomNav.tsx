import { useLocation, useNavigate } from "react-router-dom";
import { Home, Map, Users, MessageSquare, User } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { path: "/", icon: Home, label: "홈" },
  { path: "/map", icon: Map, label: "노선도" },
  { path: "/city", icon: Users, label: "도시" },
  { path: "/feed", icon: MessageSquare, label: "채팅" },
  { path: "/profile", icon: User, label: "프로필" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-around py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-[7px] h-[3px] w-5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                />
              )}
              <item.icon
                className={`h-[18px] w-[18px] transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span
                className={`text-[10px] transition-colors ${
                  isActive ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
