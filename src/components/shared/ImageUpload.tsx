import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";

interface ImageUploadProps {
  image: string | null;
  onImageChange: (image: string | null) => void;
  /** Label shown above the upload area */
  label?: string;
  /** Compact mode hides the dashed drop zone and shows only an icon button */
  compact?: boolean;
}

/**
 * Reusable image upload component with FileReader preview.
 * Used by CreatePostSheet, MissionDetailModal, etc.
 */
const ImageUpload = ({ image, onImageChange, label, compact = false }: ImageUploadProps) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onImageChange(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      {label && <p className="mb-2 text-sm font-semibold text-card-foreground">{label}</p>}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleSelect} />

      {image ? (
        <div className="relative overflow-hidden rounded-2xl">
          <img src={image} alt="업로드" className="w-full rounded-2xl object-cover" />
          <button
            onClick={() => onImageChange(null)}
            className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      ) : compact ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ImagePlus className="h-5 w-5" />
          사진
        </button>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
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
  );
};

export default ImageUpload;
