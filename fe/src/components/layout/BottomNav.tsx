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
    <nav className="app-bottom-nav app-layer-navigation fixed bottom-0 left-0 right-0 border-t border-border/70 bg-card/85 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-lg items-center justify-around px-1 pt-1.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="pressable relative flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 transition-colors"
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 h-[3px] w-5 rounded-full bg-primary"
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
