import { useRef, useState } from "react";
import { Loader2, MapPin, Send, ImagePlus, X } from "lucide-react";
import BottomSheet from "./BottomSheet";
import UserAvatar from "./UserAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { useCreatePost } from "@/hooks/useApi";
import { SOCIAL_TEXT_MAX_LENGTH } from "@/lib/input-limits";
import { uploadImageFile } from "@/lib/upload-file";
import type { UiCity } from "@/lib/city-utils";
import { toast } from "sonner";

interface CreatePostSheetProps {
  open: boolean;
  onClose: () => void;
  city: UiCity | null;
}

const CreatePostSheet = ({ open, onClose, city }: CreatePostSheetProps) => {
  const { user } = useAuth();
  const createPost = useCreatePost();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!user) {
    return null;
  }

  const reset = () => {
    setContent("");
    setPreviewImage(null);
    setSelectedFile(null);
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (!file) {
      setPreviewImage(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      return;
    }

    try {
      let imageKey: string | undefined;
      if (selectedFile) {
        const uploaded = await uploadImageFile("posts", selectedFile);
        imageKey = uploaded.key;
      }

      await createPost.mutateAsync({
        content: content.trim(),
        cityId: city?.id,
        imageKey,
      });

      toast.success("게시물이 등록되었습니다");
      reset();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "게시물 등록에 실패했습니다");
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex items-center justify-between border-b border-border px-4 pb-3">
        <button
          onClick={() => {
            reset();
            onClose();
          }}
          className="text-sm text-muted-foreground"
        >
          취소
        </button>
        <h2 className="text-sm font-bold text-card-foreground">새 게시물</h2>
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || createPost.isPending}
          className="flex items-center gap-1 rounded-full bg-gradient-hero px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-40"
        >
          {createPost.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          게시
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-3 flex items-center gap-3">
          <UserAvatar name={user.name} avatar={user.avatarUrl ?? undefined} size="md" />
          <div>
            <p className="text-sm font-semibold text-card-foreground">{user.name}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{city ? `${city.countryFlag} ${city.name}` : user.currentCityId}</span>
            </div>
          </div>
        </div>

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={SOCIAL_TEXT_MAX_LENGTH}
          placeholder="여행 이야기를 공유해보세요..."
          className="min-h-[120px] w-full resize-none bg-transparent text-sm leading-relaxed text-card-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          autoFocus
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
        />

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <ImagePlus className="h-4 w-4" />
            사진 업로드
          </button>
        </div>

        {previewImage && (
          <div className="relative mt-3 overflow-hidden rounded-2xl">
            <img src={previewImage} alt="업로드 미리보기" className="w-full rounded-2xl object-cover" />
            <button
              onClick={() => handleFileChange(null)}
              className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">사진은 JPG/PNG 업로드 가능</span>
          <div className="flex-1" />
          <span className="text-[10px] text-muted-foreground">{content.length}/{SOCIAL_TEXT_MAX_LENGTH}</span>
        </div>
      </div>
    </BottomSheet>
  );
};

export default CreatePostSheet;
