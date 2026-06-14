import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, Stamp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useBadges } from "@/hooks/useApi";
import { getStaticCities, toBadgeGroups } from "@/lib/city-utils";

const BadgeCollectionPage = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const { data: badgesResponse, isLoading: isBadgesLoading } = useBadges();
  const cities = getStaticCities();
  const badges = badgesResponse?.badges ?? [];
  const cityGroups = toBadgeGroups(badges, cities);
  const totalEarned = badgesResponse?.totalEarned ?? 0;
  const totalPossible = badgesResponse?.totalPossible ?? 0;

  if (isBadgesLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-bold text-foreground">스탬프 컬렉션</h1>
        </div>
      </div>

      <div className="bg-gradient-hero px-4 py-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur-sm">
            <Stamp className="h-8 w-8 text-primary-foreground" />
          </div>
          <p className="mt-3 text-3xl font-bold text-primary-foreground">{totalEarned}</p>
          <p className="text-sm text-primary-foreground/80">전체 {totalPossible}개 중 {totalEarned}개 스탬프 획득</p>
          <div className="mt-3 h-2 w-48 rounded-full bg-primary-foreground/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: totalPossible > 0 ? `${(totalEarned / totalPossible) * 100}%` : "0%" }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-primary-foreground"
            />
          </div>
        </motion.div>
      </div>

      <div className="space-y-2 p-4">
        {cityGroups.map(({ city, badges: cityBadges }, groupIndex) => {
          const earnedCount = cityBadges.filter((badge) => badge.earned).length;
          const isExpanded = selectedCity === city.id;

          return (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.05 }}
            >
              <button
                onClick={() => setSelectedCity(isExpanded ? null : city.id)}
                className="flex w-full items-center gap-3 rounded-xl bg-card p-3 shadow-card transition-all"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-extrabold text-primary">
                  {city.name.slice(0, 1)}
                </span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-card-foreground">{city.name}</p>
                  <p className="text-xs text-muted-foreground">{earnedCount}/{cityBadges.length}개 획득</p>
                </div>
                <div className="flex -space-x-1">
                  {cityBadges.slice(0, 4).map((badge) => (
                    <div
                      key={badge.id}
                      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-card text-xs ${
                        badge.earned ? "bg-primary/10" : "bg-muted grayscale"
                      }`}
                    >
                      {badge.emoji}
                    </div>
                  ))}
                  {cityBadges.length > 4 && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[9px] font-bold text-muted-foreground">
                      +{cityBadges.length - 4}
                    </div>
                  )}
                </div>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-3 gap-2 px-2 pb-2 pt-2">
                      {cityBadges.map((badge, badgeIndex) => (
                        <motion.div
                          key={badge.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: badgeIndex * 0.05 }}
                          className={`flex flex-col items-center gap-1.5 rounded-xl p-3 ${
                            badge.earned ? "bg-primary/5 shadow-card" : "bg-muted/30 opacity-50 grayscale"
                          }`}
                        >
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${
                              badge.earned ? "bg-gradient-hero shadow-glow" : "bg-muted"
                            }`}
                          >
                            {badge.emoji}
                          </div>
                          <p className="text-center text-[10px] font-semibold leading-tight text-card-foreground">{badge.title}</p>
                          {!badge.earned && <span className="text-[9px] text-muted-foreground">미획득</span>}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default BadgeCollectionPage;
