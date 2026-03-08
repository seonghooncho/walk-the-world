import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useAppStore } from "@/stores/appStore";
import { cityMissions } from "@/data/missionData";
import { cities } from "@/data/mockData";

export interface Badge {
  id: string;
  missionId: string;
  cityId: string;
  title: string;
  emoji: string;
  cityName: string;
  countryFlag: string;
}

const BadgeCollectionPage = () => {
  const navigate = useNavigate();
  const missions = useAppStore((s) => s.missions);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // Collect all earned badges from completed missions that have rewards
  const allBadges: Badge[] = [];
  for (const [cityId, cityMs] of Object.entries(missions)) {
    const city = cities.find((c) => c.id === cityId);
    if (!city) continue;
    for (const m of cityMs) {
      if (m.status === "completed" && m.reward) {
        allBadges.push({
          id: `badge-${m.id}`,
          missionId: m.id,
          cityId,
          title: m.reward,
          emoji: m.emoji,
          cityName: city.name,
          countryFlag: city.countryFlag,
        });
      }
    }
  }

  // All possible badges (for showing locked ones too)
  const allPossibleBadges: (Badge & { earned: boolean })[] = [];
  for (const [cityId, cityMs] of Object.entries(cityMissions)) {
    const city = cities.find((c) => c.id === cityId);
    if (!city) continue;
    for (const m of cityMs) {
      if (m.reward) {
        const earned = allBadges.some((b) => b.missionId === m.id);
        allPossibleBadges.push({
          id: `badge-${m.id}`,
          missionId: m.id,
          cityId,
          title: m.reward,
          emoji: m.emoji,
          cityName: city.name,
          countryFlag: city.countryFlag,
          earned,
        });
      }
    }
  }

  // Group by city
  const cityGroups = cities
    .map((city) => ({
      city,
      badges: allPossibleBadges.filter((b) => b.cityId === city.id),
    }))
    .filter((g) => g.badges.length > 0);

  const totalEarned = allBadges.length;
  const totalPossible = allPossibleBadges.length;

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-bold text-foreground">배지 컬렉션</h1>
        </div>
      </div>

      {/* Stats hero */}
      <div className="bg-gradient-hero px-4 py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur-sm">
            <Award className="h-8 w-8 text-primary-foreground" />
          </div>
          <p className="mt-3 text-3xl font-bold text-primary-foreground">{totalEarned}</p>
          <p className="text-sm text-primary-foreground/80">
            전체 {totalPossible}개 중 {totalEarned}개 획득
          </p>
          {/* Progress bar */}
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

      {/* Badge groups by city */}
      <div className="space-y-2 p-4">
        {cityGroups.map(({ city, badges }, gi) => {
          const earnedCount = badges.filter((b) => b.earned).length;
          const isExpanded = selectedCity === city.id;

          return (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.05 }}
            >
              <button
                onClick={() => setSelectedCity(isExpanded ? null : city.id)}
                className="flex w-full items-center gap-3 rounded-xl bg-card p-3 shadow-card transition-all"
              >
                <span className="text-xl">{city.countryFlag}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-card-foreground">{city.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {earnedCount}/{badges.length}개 획득
                  </p>
                </div>
                {/* Mini badge previews */}
                <div className="flex -space-x-1">
                  {badges.slice(0, 4).map((b) => (
                    <div
                      key={b.id}
                      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-card text-xs ${
                        b.earned ? "bg-primary/10" : "bg-muted grayscale"
                      }`}
                    >
                      {b.emoji}
                    </div>
                  ))}
                  {badges.length > 4 && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[9px] font-bold text-muted-foreground">
                      +{badges.length - 4}
                    </div>
                  )}
                </div>
                <ChevronRight
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
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
                      {badges.map((badge, i) => (
                        <motion.div
                          key={badge.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className={`flex flex-col items-center gap-1.5 rounded-xl p-3 ${
                            badge.earned
                              ? "bg-primary/5 shadow-card"
                              : "bg-muted/30 opacity-50 grayscale"
                          }`}
                        >
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${
                              badge.earned
                                ? "bg-gradient-hero shadow-glow"
                                : "bg-muted"
                            }`}
                          >
                            {badge.emoji}
                          </div>
                          <p className="text-center text-[10px] font-semibold leading-tight text-card-foreground">
                            {badge.title}
                          </p>
                          {!badge.earned && (
                            <span className="text-[9px] text-muted-foreground">미획득</span>
                          )}
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
