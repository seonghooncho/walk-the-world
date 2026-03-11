import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/src/components/common/AppText";
import { palette, radius, shadows, spacing } from "@/src/lib/theme";

type ToastTone = "success" | "error" | "info";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  success: () => {},
  error: () => {},
  info: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((tone: ToastTone, title: string, description?: string) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, title, description, tone }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2400);
  }, []);

  const value = useMemo(
    () => ({
      success: (title: string, description?: string) => push("success", title, description),
      error: (title: string, description?: string) => push("error", title, description),
      info: (title: string, description?: string) => push("info", title, description),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View pointerEvents="box-none" style={styles.viewport}>
        {toasts.map((toast) => (
          <Pressable
            key={toast.id}
            onPress={() => setToasts((current) => current.filter((candidate) => candidate.id !== toast.id))}
            style={[
              styles.toast,
              toast.tone === "success" && { borderLeftColor: palette.success },
              toast.tone === "error" && { borderLeftColor: palette.destructive },
              toast.tone === "info" && { borderLeftColor: palette.primary },
            ]}
          >
            <AppText variant="bodyBold">{toast.title}</AppText>
            {toast.description ? (
              <AppText variant="caption" style={{ marginTop: 2, color: palette.foreground }}>
                {toast.description}
              </AppText>
            ) : null}
          </Pressable>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  viewport: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    gap: 8,
  },
  toast: {
    borderLeftWidth: 4,
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.elevated,
  },
});
