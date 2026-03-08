import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Camera, Utensils, PenLine, Compass, Users,
  Check, Sparkles,
} from "lucide-react";
import type { Mission, MissionType } from "@/data/missionData";
import { useAppStore } from "@/stores/appStore";
import ImageUpload from "./ImageUpload";
import LoadingSpinner from "./LoadingSpinner";
import { toast } from "sonner";

const typeLabels: Record<MissionType, { label: string; icon: typeof Camera; action: string }> = {
  photo: { label: "사진 미션", icon: Camera, action: "사진을 업로드하세요" },
  food: { label: "음식 미션", icon: Utensils, action: "음식 사진을 인증하세요" },
  writing: { label: "글쓰기 미션", icon: PenLine, action: "글을 작성하세요" },
  explore: { label: "탐험 미션", icon: Compass, action: "방문 인증을 해주세요" },
  social: { label: "소셜 미션", icon: Users, action: "친구를 맺어보세요" },
};

interface MissionDetailModalProps {
  mission: Mission | null;
  onClose: () => void;
}

const MissionDetailModal = ({ mission, onClose }: MissionDetailModalProps) => {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [compositeResult, setCompositeResult] = useState<string | null>(null);
  const completeMission = useAppStore((s) => s.completeMission);
  const addPost = useAppStore((s) => s.addPost);

  if (!mission) return null;

  const config = typeLabels[mission.type];
  const Icon = config.icon;
  const needsImage = ["photo", "food", "explore"].includes(mission.type);
  const needsText = ["writing"].includes(mission.type);
  const isSocial = mission.type === "social";
  const isAiComposite = mission.aiComposite === true;

  const canSubmit = () => {
    if (needsImage && !image) return false;
    if (needsText && !text.trim()) return false;
    return true;
  };

  const handleComposite = () => {
    if (!image) return;
    setSubmitting(true);
    // mock AI composite — in production this calls the backend
    setTimeout(() => {
      setCompositeResult(image);
      setSubmitting(false);
      toast.success("AI 합성 완료!", { description: "배경이 합성되었어요" });
    }, 1500);
  };

  const handleSubmit = () => {
    if (!canSubmit()) return;
    setSubmitting(true);

    setTimeout(() => {
      completeMission(mission.id, mission.cityId);
      const finalImage = compositeResult || image;
      const postContent = needsText
        ? text
        : `${mission.emoji} "${mission.title}" 미션을 완료했어요!`;
      addPost(postContent, finalImage || undefined, mission.cityId);

      toast.success("미션 완료!", {
        description: mission.reward ? `${mission.reward}을(를) 획득했어요!` : "축하합니다!",
      });
      setSubmitting(false);
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-card shadow-elevated"
      >
        {/* Handle */}
        <div className="sticky top-0 z-10 flex justify-center bg-card pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {/* Hero image */}
        <div className="relative h-48 overflow-hidden">
          <img src={mission.image} alt={mission.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero">
                <Icon className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                {config.label}
              </span>
              {isAiComposite && (
                <span className="flex items-center gap-1 rounded-full bg-accent/80 px-2.5 py-0.5 text-xs font-bold text-accent-foreground backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" /> AI 합성
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white drop-shadow-md">
              {mission.emoji} {mission.title}
            </h2>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <p className="text-sm leading-relaxed text-muted-foreground">{mission.description}</p>

          {/* AI composite explanation */}
          {isAiComposite && (
            <div className="flex items-start gap-3 rounded-xl bg-accent/10 border border-accent/20 p-3">
              <Sparkles className="h-5 w-5 shrink-0 text-accent-foreground mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-card-foreground">AI 사진 합성 미션</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  내 사진을 업로드하면 AI가 "{mission.aiPrompt}" 배경과 합성해줘요!
                </p>
              </div>
            </div>
          )}

          {mission.reward && (
            <div className="flex items-center gap-3 rounded-xl bg-primary/10 p-3">
              <span className="text-2xl">🏅</span>
              <div>
                <p className="text-xs text-muted-foreground">보상</p>
                <p className="text-sm font-bold text-primary">{mission.reward}</p>
              </div>
            </div>
          )}

          {/* Photo upload */}
          {needsImage && (
            <ImageUpload
              image={compositeResult || image}
              onImageChange={(img) => {
                setImage(img);
                setCompositeResult(null);
              }}
              label={isAiComposite ? "합성할 내 사진을 업로드하세요" : config.action}
            />
          )}

          {/* AI composite button */}
          {isAiComposite && image && !compositeResult && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleComposite}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-accent bg-accent/5 py-3 text-sm font-bold text-accent-foreground transition-all hover:bg-accent/10 disabled:opacity-40"
            >
              {submitting ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  AI 배경 합성하기
                </>
              )}
            </motion.button>
          )}

          {/* Composite result */}
          {compositeResult && (
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-3 text-center">
              <p className="text-xs font-semibold text-accent-foreground">AI 합성이 완료되었습니다!</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">아래 버튼을 눌러 미션을 완료하세요</p>
            </div>
          )}

          {/* Writing area */}
          {needsText && (
            <div>
              <p className="mb-2 text-sm font-semibold text-card-foreground">{config.action}</p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="여행의 감상을 자유롭게 적어보세요..."
                className="min-h-[140px] w-full resize-none rounded-2xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-card-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
              />
              <p className="mt-1 text-right text-[10px] text-muted-foreground">{text.length}/500</p>
            </div>
          )}

          {/* Social mission */}
          {isSocial && (
            <div className="rounded-2xl bg-muted/50 p-4 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-primary" />
              <p className="text-sm font-medium text-card-foreground">도시 커뮤니티에서 친구를 맺어보세요</p>
              <p className="mt-1 text-xs text-muted-foreground">친구 탭에서 활동할 수 있어요</p>
            </div>
          )}

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={!canSubmit() || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-hero py-4 text-sm font-bold text-primary-foreground shadow-glow transition-opacity disabled:opacity-40"
          >
            {submitting ? (
              <LoadingSpinner />
            ) : (
              <>
                <Check className="h-5 w-5" />
                {isSocial ? "미션 완료하기" : "인증하고 게시하기"}
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MissionDetailModal;
