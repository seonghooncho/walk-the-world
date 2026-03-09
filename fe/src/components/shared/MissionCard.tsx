import { motion } from "framer-motion";
import { Camera, Utensils, PenLine, Compass, Users, Lock, Check, ChevronRight, Sparkles } from "lucide-react";
import type { Mission, MissionType } from "@/mocks/missionData";

const typeConfig: Record<MissionType, { icon: typeof Camera; color: string }> = {
  photo: { icon: Camera, color: "bg-ocean text-ocean-foreground" },
  food: { icon: Utensils, color: "bg-earth text-earth-foreground" },
  writing: { icon: PenLine, color: "bg-primary text-primary-foreground" },
  explore: { icon: Compass, color: "bg-secondary text-secondary-foreground" },
  social: { icon: Users, color: "bg-city-teal text-city-teal-foreground" },
};

interface MissionCardProps {
  mission: Mission;
  index?: number;
  onClick?: (mission: Mission) => void;
}

const MissionCard = ({ mission, index = 0, onClick }: MissionCardProps) => {
  const config = typeConfig[mission.type];
  const Icon = config.icon;
  const isLocked = mission.status === "locked";
  const isCompleted = mission.status === "completed";

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      onClick={() => !isLocked && onClick?.(mission)}
      disabled={isLocked}
      className={`group relative w-full overflow-hidden rounded-xl text-left transition-all ${
        isLocked
          ? "opacity-40 grayscale"
          : "hover:shadow-elevated active:scale-[0.98]"
      }`}
    >
      {/* Image */}
      <div className="relative h-24 w-full overflow-hidden">
        <img
          src={mission.image}
          alt={mission.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Status */}
        <div className="absolute top-2 right-2">
          {isCompleted ? (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success">
              <Check className="h-3 w-3 text-success-foreground" />
            </div>
          ) : isLocked ? (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/80">
              <Lock className="h-3 w-3 text-muted-foreground" />
            </div>
          ) : (
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
          )}
        </div>

        {/* Type + AI */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <div className={`flex h-6 w-6 items-center justify-center rounded-md ${config.color}`}>
            <Icon className="h-3 w-3" />
          </div>
          {mission.aiComposite && (
            <div className="flex h-5 items-center gap-0.5 rounded-md bg-foreground/80 px-1.5 backdrop-blur-sm">
              <Sparkles className="h-2.5 w-2.5 text-background" />
              <span className="text-[9px] font-bold text-background">AI</span>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="text-[13px] font-semibold text-white leading-tight">
            {mission.emoji} {mission.title}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-card px-2.5 py-2">
        <p className="text-[11px] text-muted-foreground line-clamp-1">{mission.description}</p>
        <div className="mt-1.5 flex items-center justify-between">
          {mission.reward && (
            <span className="text-[10px] font-medium text-primary">
              🏅 {mission.reward}
            </span>
          )}
          {!isLocked && !isCompleted && (
            <div className="ml-auto flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground">
              도전
              <ChevronRight className="h-3 w-3" />
            </div>
          )}
          {isCompleted && (
            <span className="ml-auto text-[10px] font-medium text-success">완료</span>
          )}
        </div>
      </div>
    </motion.button>
  );
};

export default MissionCard;
