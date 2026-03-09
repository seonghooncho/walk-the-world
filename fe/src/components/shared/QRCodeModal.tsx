import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check } from "lucide-react";
import { useState } from "react";
import UserAvatar from "./UserAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
}

const QRCodeModal = ({ open, onClose }: QRCodeModalProps) => {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const qrUrl = `${window.location.origin}/add-friend/${user.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      toast.success("링크가 복사되었습니다!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("복사에 실패했습니다");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div
              className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-elevated"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <div className="flex justify-end">
                <button onClick={onClose}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* User info */}
              <div className="flex flex-col items-center">
                <UserAvatar name={user.name} avatar={user.avatarUrl ?? undefined} size="lg" />
                <h3 className="mt-2 text-lg font-bold text-card-foreground">{user.name}</h3>
                <p className="text-xs text-muted-foreground">QR코드를 스캔하여 친구를 추가하세요</p>
              </div>

              {/* QR Code */}
              <div className="mt-5 flex justify-center">
                <div className="rounded-2xl bg-white p-4 shadow-card">
                  <QRCodeSVG
                    value={qrUrl}
                    size={200}
                    level="M"
                    bgColor="#FFFFFF"
                    fgColor="hsl(220, 25%, 14%)"
                    style={{ display: "block" }}
                  />
                </div>
              </div>

              {/* Info text */}
              <p className="mt-4 text-center text-xs text-muted-foreground">
                🎉 QR 친구 추가는 <span className="font-bold text-primary">무료</span>입니다!
              </p>

              {/* Copy link */}
              <button
                onClick={handleCopy}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-muted/50 py-3 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-success" />
                    복사됨!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    링크 복사하기
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QRCodeModal;
