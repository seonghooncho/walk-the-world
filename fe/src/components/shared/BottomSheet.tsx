import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Additional class for the sheet container */
  className?: string;
  children: ReactNode;
}

/**
 * Reusable bottom sheet with backdrop, spring animation, drag handle and optional header.
 * Used by CommentSheet, CreatePostSheet, SettingsSheet, MyPostsSheet, etc.
 */
const BottomSheet = ({ open, onClose, title, className = "", children }: BottomSheetProps) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="app-layer-overlay fixed inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className={cn(
              "app-bottom-sheet-root app-bottom-sheet-panel app-layer-modal fixed inset-x-0 flex flex-col rounded-t-2xl bg-card shadow-elevated",
              className,
            )}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between border-b border-border px-4 pb-3">
                <h2 className="text-sm font-bold text-card-foreground">{title}</h2>
                <button onClick={onClose}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            )}

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
