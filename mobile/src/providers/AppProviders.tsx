import { type ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { LoginPromptSheet } from "@/src/components/shared/LoginPromptSheet";
import { StepSyncProvider } from "@/src/providers/StepSyncProvider";
import { ToastProvider } from "@/src/providers/ToastProvider";
import { palette } from "@/src/lib/theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children, onLayout }: { children: ReactNode; onLayout?: () => void }) {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.background }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StepSyncProvider>
              <ToastProvider>
                <View style={{ flex: 1, backgroundColor: palette.background }} onLayout={onLayout}>
                  {children}
                  <LoginPromptSheet />
                </View>
              </ToastProvider>
            </StepSyncProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
