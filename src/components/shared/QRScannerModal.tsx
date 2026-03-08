import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, AlertTriangle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface QRScannerModalProps {
  open: boolean;
  onClose: () => void;
}

const QRScannerModal = ({ open, onClose }: QRScannerModalProps) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    const scannerId = "qr-reader-" + Date.now();

    // Create the container element dynamically
    const el = document.createElement("div");
    el.id = scannerId;
    containerRef.current?.appendChild(el);

    const scanner = new Html5Qrcode(scannerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          if (!mounted) return;
          // Check if it's a valid add-friend URL
          try {
            const url = new URL(decodedText);
            const match = url.pathname.match(/^\/add-friend\/(.+)$/);
            if (match) {
              scanner.stop().catch(() => {});
              onClose();
              navigate(`/add-friend/${match[1]}`);
            } else {
              toast.error("유효하지 않은 QR코드입니다");
            }
          } catch {
            toast.error("유효하지 않은 QR코드입니다");
          }
        },
        () => {} // ignore scan failures
      )
      .catch((err) => {
        if (mounted) {
          console.error("QR Scanner error:", err);
          setError("카메라에 접근할 수 없습니다. 카메라 권한을 허용해주세요.");
        }
      });

    return () => {
      mounted = false;
      scanner.stop().catch(() => {});
      try { scanner.clear(); } catch {};
    };
  }, [open, navigate, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
          >
            {/* Header */}
            <div className="mb-4 flex w-full max-w-sm items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-white">QR 스캔</h2>
              </div>
              <button onClick={onClose} className="rounded-full bg-white/10 p-2">
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Scanner viewport */}
            <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-black">
              {error ? (
                <div className="flex flex-col items-center gap-3 p-10 text-center">
                  <AlertTriangle className="h-10 w-10 text-accent" />
                  <p className="text-sm text-white/80">{error}</p>
                  <button
                    onClick={onClose}
                    className="mt-2 rounded-xl bg-muted px-6 py-2 text-sm font-medium text-card-foreground"
                  >
                    닫기
                  </button>
                </div>
              ) : (
                <div ref={containerRef} className="aspect-square w-full" />
              )}
            </div>

            <p className="mt-4 text-center text-xs text-white/60">
              친구의 QR코드를 카메라에 비춰주세요
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QRScannerModal;
