import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Lock, ChevronDown, Target } from "lucide-react";
import type { UiCity, UiMission } from "@/lib/city-utils";
import { formatSteps } from "@/lib/city-utils";
import MissionCard from "./MissionCard";

interface CityCardProps {
  city: UiCity;
  missions: UiMission[];
  isUnlocked: boolean;
  isCurrent: boolean;
  index: number;
  defaultExpanded?: boolean;
  onMissionClick?: (mission: UiMission) => void;
}

const CityCard = ({
  city,
  missions,
  isUnlocked,
  isCurrent,
  index,
  defaultExpanded = false,
  onMissionClick,
}: CityCardProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasMissions = missions.length > 0;

  const completed = missions.filter((m) => m.status === "completed").length;
  const total = missions.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      {/* City header row */}
      <button
        onClick={() => isUnlocked && hasMissions && setExpanded(!expanded)}
        className={`relative flex w-full items-center gap-3 rounded-xl p-3 transition-all ${
          isCurrent
            ? "bg-gradient-hero shadow-glow"
            : isUnlocked
            ? "bg-card shadow-card hover:shadow-elevated"
            : "bg-muted opacity-60"
        } ${expanded && isUnlocked ? "rounded-b-none" : ""}`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${
            isCurrent ? "" : isUnlocked ? "bg-muted" : "bg-border"
          }`}
        >
          {isUnlocked ? city.countryFlag : <Lock className="h-4 w-4 text-muted-foreground" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-sm font-semibold ${
                isCurrent ? "text-primary-foreground" : "text-card-foreground"
              }`}
            >
              {city.name}
            </span>
            {isCurrent && <MapPin className="h-3.5 w-3.5 text-primary-foreground" />}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs ${
                isCurrent ? "text-primary-foreground/80" : "text-muted-foreground"
              }`}
            >
              {city.country}
            </span>
            {isUnlocked && hasMissions && (
              <span
                className={`text-[10px] font-medium ${
                  isCurrent ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                • 미션 {completed}/{total}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium ${
              isCurrent ? "text-primary-foreground/90" : "text-muted-foreground"
            }`}
          >
            {formatSteps(city.stepsRequired)} 보
          </span>
          {isUnlocked && hasMissions && (
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              } ${isCurrent ? "text-primary-foreground/70" : "text-muted-foreground"}`}
            />
          )}
        </div>
      </button>

      {/* Expandable missions */}
      <AnimatePresence>
        {expanded && isUnlocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className={`rounded-b-xl border-t px-3 pb-3 pt-3 ${
                isCurrent
                  ? "border-primary-foreground/10 bg-gradient-hero"
                  : "border-border bg-card shadow-card"
              }`}
            >
              {/* Mission progress bar */}
              <div className="mb-3 flex items-center gap-2">
                <Target className={`h-3.5 w-3.5 ${isCurrent ? "text-primary-foreground/80" : "text-primary"}`} />
                <div className="flex-1">
                  <div className={`h-1.5 rounded-full ${isCurrent ? "bg-primary-foreground/20" : "bg-muted"}`}>
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCurrent ? "bg-primary-foreground" : "bg-primary"
                      }`}
                      style={{ width: total > 0 ? `${(completed / total) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold ${
                    isCurrent ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}
                >
                  {completed}/{total}
                </span>
              </div>

              {/* Mission cards grid */}
              <div className="grid grid-cols-2 gap-2">
                {missions.map((mission, i) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    index={i}
                    onClick={onMissionClick}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CityCard;
