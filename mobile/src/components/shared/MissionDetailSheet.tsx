import { Image } from "expo-image";
import { Check, ImagePlus, Loader2, Sparkles, Users } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useState } from "react";
import { BottomSheet } from "@/src/components/shared/BottomSheet";
import { AppText } from "@/src/components/common/AppText";
import { TextField } from "@/src/components/common/TextField";
import type { UiMission } from "@/src/lib/city-utils";
import { missionsApi } from "@/src/lib/api";
import { useCompleteMission } from "@/src/hooks/useApi";
import { uploadImageAsset } from "@/src/lib/upload-image";
import { gradients, palette, radius, spacing } from "@/src/lib/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useToast } from "@/src/providers/ToastProvider";

export function MissionDetailSheet({ mission, onClose }: { mission: UiMission | null; onClose: () => void }) {
  const toast = useToast();
  const completeMission = useCompleteMission();
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadedImageKey, setUploadedImageKey] = useState<string | null>(null);
  const [compositeRequested, setCompositeRequested] = useState(false);

  if (!mission) {
    return null;
  }

  const needsImage = ["photo", "food", "explore"].includes(mission.type);
  const needsText = mission.type === "writing";
  const isSocial = mission.type === "social";

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.92 });
    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setPreviewUrl(result.assets[0].uri);
      setCompositeRequested(false);
      setUploadedImageKey(null);
    }
  };

  const ensureUploadedImage = async () => {
    if (!selectedImage) {
      return undefined;
    }
    if (uploadedImageKey) {
      return uploadedImageKey;
    }
    const uploaded = await uploadImageAsset(mission.aiComposite ? "composite" : "missions", {
      uri: selectedImage.uri,
      fileName: selectedImage.fileName,
      mimeType: selectedImage.mimeType,
    });
    setUploadedImageKey(uploaded.key);
    return uploaded.key;
  };

  const requestComposite = async () => {
    if (!selectedImage) return;
    setSubmitting(true);
    try {
      const imageKey = await ensureUploadedImage();
      if (!imageKey) {
        throw new Error("이미지를 업로드하지 못했습니다");
      }
      const response = await missionsApi.composite(mission.id, imageKey);
      setUploadedImageKey(response.data.compositeImage.key);
      setPreviewUrl(response.data.compositeImage.url);
      setCompositeRequested(true);
      toast.success("AI 합성이 완료되었습니다");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI 합성에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  const complete = async () => {
    if (needsImage && !selectedImage) return;
    if (needsText && !text.trim()) return;
    setSubmitting(true);
    try {
      const imageKey = needsImage ? await ensureUploadedImage() : undefined;
      await completeMission.mutateAsync({
        missionId: mission.id,
        imageKey,
        text: needsText ? text.trim() : undefined,
        autoPost: !isSocial,
      });
      toast.success("미션 완료!", mission.reward ?? "축하합니다!");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "미션 완료에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet open={Boolean(mission)} onClose={onClose}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Image source={previewUrl ? { uri: previewUrl } : mission.image} style={styles.heroImage} contentFit="cover" />
          <View style={styles.heroOverlay} />
          <View style={styles.heroText}>
            <AppText variant="captionBold" tone="inverse">{mission.aiComposite ? "AI 합성 미션" : "미션"}</AppText>
            <AppText variant="title" tone="inverse">
              {mission.emoji} {mission.title}
            </AppText>
          </View>
        </View>

        <AppText>{mission.description}</AppText>

        {mission.reward ? (
          <View style={styles.reward}>
            <AppText variant="caption">보상</AppText>
            <AppText variant="bodyBold" tone="primary">{mission.reward}</AppText>
          </View>
        ) : null}

        {needsImage ? (
          <Pressable style={styles.upload} onPress={pickImage}>
            <ImagePlus size={20} color={palette.primary} />
            <AppText variant="bodyBold" tone="primary">사진 업로드</AppText>
          </Pressable>
        ) : null}

        {mission.aiComposite && selectedImage && !compositeRequested ? (
          <Pressable onPress={requestComposite}>
            <LinearGradient colors={gradients.ocean} style={styles.aiButton}>
              {submitting ? <Loader2 size={18} color={palette.white} /> : <Sparkles size={18} color={palette.white} />}
              <AppText variant="bodyBold" tone="inverse">AI 배경 합성 요청</AppText>
            </LinearGradient>
          </Pressable>
        ) : null}

        {mission.aiComposite && compositeRequested ? (
          <View style={styles.notice}>
            <Sparkles size={16} color={palette.primary} />
            <AppText variant="captionBold">AI 합성 결과로 미션이 완료됩니다</AppText>
          </View>
        ) : null}

        {needsText ? (
          <TextField value={text} onChangeText={setText} placeholder="여행의 감상을 자유롭게 적어보세요..." multiline />
        ) : null}

        {isSocial ? (
          <View style={styles.notice}>
            <Users size={16} color={palette.primary} />
            <AppText variant="captionBold">도시 커뮤니티에서 친구를 추가하면 완료됩니다</AppText>
          </View>
        ) : null}

        <Pressable onPress={complete} disabled={submitting || completeMission.isPending}>
          <LinearGradient colors={gradients.hero} style={[styles.completeButton, (submitting || completeMission.isPending) && { opacity: 0.5 }]}>
            <Check size={18} color={palette.white} />
            <AppText variant="bodyBold" tone="inverse">{isSocial ? "미션 완료하기" : "인증하고 게시하기"}</AppText>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing["2xl"],
    gap: spacing.lg,
  },
  hero: {
    height: 220,
    borderRadius: radius.xl,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(15,23,42,0.28)",
  },
  heroText: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    gap: 4,
  },
  reward: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: "rgba(245,158,11,0.1)",
    gap: 4,
  },
  upload: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: palette.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: palette.card,
  },
  aiButton: {
    minHeight: 52,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexDirection: "row",
  },
  completeButton: {
    minHeight: 54,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexDirection: "row",
  },
  notice: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: palette.secondary,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});
