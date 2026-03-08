import { useState } from "react";
import { MapPin, Send, ImagePlus } from "lucide-react";
import BottomSheet from "./BottomSheet";
import UserAvatar from "./UserAvatar";
import ImageUpload from "./ImageUpload";
import { getCurrentCity } from "@/data/mockData";
import { useAppStore } from "@/stores/appStore";

interface CreatePostSheetProps {
  open: boolean;
  onClose: () => void;
  onPost: (content: string, image?: string) => void;
}

const CreatePostSheet = ({ open, onClose, onPost }: CreatePostSheetProps) => {
  const [content, setContent] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const user = useAppStore((s) => s.user);
  const city = getCurrentCity(user.totalSteps);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onPost(content, previewImage || undefined);
    setContent("");
    setPreviewImage(null);
    setShowUpload(false);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      {/* Custom header with post button */}
      <div className="flex items-center justify-between border-b border-border px-4 pb-3">
        <button onClick={onClose} className="text-sm text-muted-foreground">취소</button>
        <h2 className="text-sm font-bold text-card-foreground">새 게시물</h2>
        <button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className="flex items-center gap-1 rounded-full bg-gradient-hero px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
          게시
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* User info */}
        <div className="mb-3 flex items-center gap-3">
          <UserAvatar name={user.name} size="md" />
          <div>
            <p className="text-sm font-semibold text-card-foreground">{user.name}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{city.countryFlag} {city.name}</span>
            </div>
          </div>
        </div>

        {/* Text input */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="여행 이야기를 공유해보세요..."
          className="min-h-[120px] w-full resize-none bg-transparent text-sm leading-relaxed text-card-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          autoFocus
        />

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <ImagePlus className="h-4 w-4" />
            사진 업로드
          </button>
        </div>

        {(showUpload || previewImage) && (
          <div className="mt-2">
            <ImageUpload image={previewImage} onImageChange={setPreviewImage} />
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">사진은 JPG/PNG 업로드 가능</span>
          <div className="flex-1" />
          <span className="text-[10px] text-muted-foreground">{content.length}/500</span>
        </div>
      </div>
    </BottomSheet>
  );
};

export default CreatePostSheet;
