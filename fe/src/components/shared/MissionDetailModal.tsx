import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Camera,
  PenLine,
  Users,
  Check,
  Sparkles,
  ImagePlus,
  Loader2,
  Timer,
  Smartphone,
  Ticket,
} from "lucide-react";
import type { UiMission, UiMissionType } from "@/lib/city-utils";
import { missionsApi } from "@/lib/api";
import { useCompleteMission } from "@/hooks/useApi";
import { uploadImageFile } from "@/lib/upload-file";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const typeLabels: Record<UiMissionType, { label: string; icon: typeof Camera; action: string }> = {
  photo: { label: "사진 증명", icon: Camera, action: "사진을 업로드하세요" },
  text: { label: "텍스트 증명", icon: PenLine, action: "짧은 기록을 남기세요" },
  session: { label: "세션 증명", icon: Timer, action: "세션 완료를 기록하세요" },
  screenshot: { label: "스크린샷 증명", icon: Smartphone, action: "외부 앱 기록을 업로드하세요" },
  social: { label: "소셜 증명", icon: Users, action: "다른 여행자의 인증을 확인하세요" },
};

interface MissionDetailModalProps {
  mission: UiMission | null;
  onClose: () => void;
}

const MissionDetailModal = ({ mission, onClose }: MissionDetailModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const completeMission = useCompleteMission();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [compositeRequested, setCompositeRequested] = useState(false);
  const [uploadedImageKey, setUploadedImageKey] = useState<string | null>(null);

  if (!mission) {
    return null;
  }

  const config = typeLabels[mission.type];
  const Icon = config.icon;
  const needsImage = mission.proofType === "photo" || mission.proofType === "screenshot";
  const needsText = mission.proofType === "text";
  const isSessionProof = mission.proofType === "session";
  const isSocial = mission.type === "social";
  const isAiComposite = mission.aiComposite;
  const hasFriendForSocialMission = !isSocial || (user?.friendCount ?? 0) >= 0;

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setUploadedImageKey(null);
    setCompositeRequested(false);

    if (!file) {
      setImagePreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const canSubmit = () => {
    if (needsImage && !selectedFile) {
      return false;
    }
    if (needsText && !text.trim()) {
      return false;
    }
    if (isSocial && !hasFriendForSocialMission) {
      return false;
    }
    return true;
  };

  const ensureUploadedImage = async () => {
    if (!selectedFile) {
      return undefined;
    }
    if (uploadedImageKey) {
      return uploadedImageKey;
    }
    const uploaded = await uploadImageFile(isAiComposite ? "composite" : "missions", selectedFile);
    setUploadedImageKey(uploaded.key);
    return uploaded.key;
  };

  const handleComposite = async () => {
    if (!selectedFile) {
      return;
    }

    setSubmitting(true);
    try {
      const imageKey = await ensureUploadedImage();
      if (!imageKey) {
        throw new Error("이미지를 업로드하지 못했습니다");
      }
      const response = await missionsApi.composite(mission.id, imageKey);
      setUploadedImageKey(response.data.compositeImage.key);
      setImagePreview(response.data.compositeImage.url);
      setCompositeRequested(true);
      toast.success("AI 합성이 완료되었습니다");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI 합성 요청에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      return;
    }

    setSubmitting(true);
    try {
      const imageKey = needsImage ? await ensureUploadedImage() : undefined;

      await completeMission.mutateAsync({
        missionId: mission.id,
        imageKey,
        text: needsText ? text.trim() : undefined,
        autoPost: !isSocial,
      });

      toast.success("미션 완료!", {
        description: `${mission.stampReward} 스탬프${mission.ticketReward > 0 ? `와 티켓 ${mission.ticketReward}장` : ""}을 획득했어요.`,
      });
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "미션 완료에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
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
        <div className="sticky top-0 z-10 flex justify-center bg-card pb-1 pt-3">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="relative h-48 overflow-hidden">
          <img src={mission.image} alt={mission.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white"
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

        <div className="space-y-5 p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">{mission.description}</p>

          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              <p className="text-sm font-bold text-card-foreground">{mission.verificationLabel}</p>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {mission.proofExamples.map((example) => (
                <div key={example} className="flex items-start gap-2 text-[12px] leading-5 text-muted-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                  <span>{example}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 rounded-xl bg-secondary px-3 py-2 text-[11px] leading-5 text-muted-foreground">
              PWA에서는 백그라운드 추적이 끊길 수 있어요. 세션 완료, 사진, 텍스트, 외부 앱 스크린샷 중 가능한 증명으로 이어가면 됩니다.
            </p>
          </div>

          {isAiComposite && (
            <div className="flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/10 p-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
              <div>
                <p className="text-xs font-semibold text-card-foreground">AI 사진 합성 미션</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  이미지를 업로드하면 백엔드에 합성 요청을 전송합니다.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center gap-3 rounded-xl bg-primary/10 p-3">
              <span className="text-2xl">🏷️</span>
              <div>
                <p className="text-xs text-muted-foreground">스탬프</p>
                <p className="text-sm font-bold text-primary">{mission.stampReward}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-gold/10 p-3">
              <Ticket className="h-6 w-6 text-gold" />
              <div>
                <p className="text-xs text-muted-foreground">티켓</p>
                <p className="text-sm font-bold text-gold">{mission.ticketReward}장</p>
              </div>
            </div>
          </div>

          {needsImage && (
            <div>
              <p className="mb-2 text-sm font-semibold text-card-foreground">{config.action}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
              />

              {imagePreview ? (
                <div className="overflow-hidden rounded-2xl">
                  <img src={imagePreview} alt="업로드 미리보기" className="w-full rounded-2xl object-cover" />
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border py-10 transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <ImagePlus className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-card-foreground">사진 업로드</p>
                    <p className="text-xs text-muted-foreground">탭하여 사진을 선택하세요</p>
                  </div>
                </button>
              )}
            </div>
          )}

          {isAiComposite && selectedFile && !compositeRequested && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleComposite}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-accent bg-accent/5 py-3 text-sm font-bold text-accent-foreground transition-all hover:bg-accent/10 disabled:opacity-40"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              AI 배경 합성 요청
            </motion.button>
          )}

          {compositeRequested && (
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-3 text-center">
              <p className="text-xs font-semibold text-accent-foreground">AI 합성 요청이 접수되었습니다</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">이제 아래 버튼으로 미션을 완료할 수 있습니다</p>
            </div>
          )}

          {needsText && (
            <div>
              <p className="mb-2 text-sm font-semibold text-card-foreground">{config.action}</p>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="여행의 감상을 자유롭게 적어보세요..."
                className="min-h-[140px] w-full resize-none rounded-2xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-card-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
              />
              <p className="mt-1 text-right text-[10px] text-muted-foreground">{text.length}/500</p>
            </div>
          )}

          {isSessionProof && (
            <div className="rounded-2xl bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <Timer className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-bold text-card-foreground">{mission.sessionHint}</p>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                    세션 타이머, 수동 입력, 외부 앱 기록 중 하나로 완료할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isSocial && (
            <div className="rounded-2xl bg-muted/50 p-4 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-primary" />
              <p className="text-sm font-medium text-card-foreground">
                {hasFriendForSocialMission ? "미션 피드를 둘러볼 준비가 됐습니다" : "미션 피드에서 다른 여행자를 확인해보세요"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {hasFriendForSocialMission
                  ? "같은 미션 피드에서 다른 여행자의 인증을 보고 여행 반응을 남겨보세요"
                  : "도시 피드에서 다른 여행자의 인증을 먼저 확인해보세요"}
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/city");
                }}
                className="mt-3 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
              >
                미션 피드 보기
              </button>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={!canSubmit() || submitting || completeMission.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-hero py-4 text-sm font-bold text-primary-foreground shadow-glow transition-opacity disabled:opacity-40"
          >
            {submitting || completeMission.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Check className="h-5 w-5" />
                {isSocial ? "소셜 미션 완료" : isSessionProof ? "세션 완료 기록하기" : "인증하고 게시하기"}
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MissionDetailModal;
