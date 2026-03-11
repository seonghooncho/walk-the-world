import { Image } from "expo-image";
import { ImagePlus, Send, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Pressable, StyleSheet, View } from "react-native";
import { BottomSheet } from "@/src/components/shared/BottomSheet";
import { AppText } from "@/src/components/common/AppText";
import { TextField } from "@/src/components/common/TextField";
import { UserAvatar } from "@/src/components/common/UserAvatar";
import { useAuth } from "@/src/contexts/AuthContext";
import { useCreatePost } from "@/src/hooks/useApi";
import type { UiCity } from "@/src/lib/city-utils";
import { uploadImageAsset } from "@/src/lib/upload-image";
import { palette, radius, spacing } from "@/src/lib/theme";
import { useToast } from "@/src/providers/ToastProvider";
import { useState } from "react";

export function CreatePostSheet({
  open,
  onClose,
  city,
}: {
  open: boolean;
  onClose: () => void;
  city: UiCity | null;
}) {
  const { user } = useAuth();
  const toast = useToast();
  const createPost = useCreatePost();
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  if (!user) {
    return null;
  }

  const reset = () => {
    setContent("");
    setSelectedImage(null);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const submit = async () => {
    if (!content.trim()) {
      return;
    }
    try {
      let imageKey: string | undefined;
      if (selectedImage) {
        const uploaded = await uploadImageAsset("posts", {
          uri: selectedImage.uri,
          fileName: selectedImage.fileName,
          mimeType: selectedImage.mimeType,
        });
        imageKey = uploaded.key;
      }

      await createPost.mutateAsync({ content: content.trim(), cityId: city?.id, imageKey });
      toast.success("게시물이 등록되었습니다");
      reset();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "게시물 등록에 실패했습니다");
    }
  };

  return (
    <BottomSheet open={open} onClose={() => { reset(); onClose(); }}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.profile}>
            <UserAvatar name={user.name} avatar={user.avatarUrl} size="md" />
            <View>
              <AppText variant="bodyBold">{user.name}</AppText>
              <AppText variant="caption">{city ? `${city.countryFlag} ${city.name}` : user.currentCityId}</AppText>
            </View>
          </View>
          <Pressable onPress={submit} disabled={!content.trim() || createPost.isPending} style={{ opacity: !content.trim() ? 0.4 : 1 }}>
            <View style={styles.submit}>
              <Send size={14} color={palette.white} />
              <AppText variant="captionBold" tone="inverse">게시</AppText>
            </View>
          </Pressable>
        </View>

        <TextField value={content} onChangeText={setContent} placeholder="여행 이야기를 공유해보세요..." multiline />

        <Pressable style={styles.pickButton} onPress={pickImage}>
          <ImagePlus size={16} color={palette.primary} />
          <AppText variant="bodyBold" tone="primary">사진 업로드</AppText>
        </Pressable>

        {selectedImage ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: selectedImage.uri }} style={styles.preview} contentFit="cover" />
            <Pressable style={styles.remove} onPress={() => setSelectedImage(null)}>
              <X size={16} color={palette.white} />
            </Pressable>
          </View>
        ) : null}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing["2xl"],
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  submit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: palette.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  pickButton: {
    minHeight: 44,
    borderRadius: radius.lg,
    backgroundColor: palette.secondary,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexDirection: "row",
  },
  previewWrap: {
    position: "relative",
  },
  preview: {
    width: "100%",
    height: 220,
    borderRadius: radius.lg,
  },
  remove: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: "rgba(15,23,42,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
});
