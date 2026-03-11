import { ScrollView, StyleSheet, View, type ScrollViewProps, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette, screenMaxWidth } from "@/src/lib/theme";

interface AppScreenProps extends ScrollViewProps {
  centerContent?: boolean;
  padded?: boolean;
  contentContainerStyle?: ViewStyle;
}

export function AppScreen({ children, centerContent = false, padded = false, contentContainerStyle, ...props }: AppScreenProps) {
  const Wrapper = centerContent ? View : ScrollView;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <Wrapper
        {...props}
        contentContainerStyle={centerContent ? undefined : [styles.content, padded && styles.padded, contentContainerStyle]}
        style={[styles.wrapper, props.style]}
      >
        {centerContent ? <View style={[styles.centerContent, contentContainerStyle]}>{children}</View> : children}
      </Wrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  wrapper: {
    flex: 1,
    alignSelf: "center",
    width: "100%",
    maxWidth: screenMaxWidth,
    backgroundColor: palette.background,
  },
  content: {
    paddingBottom: 96,
  },
  padded: {
    paddingHorizontal: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
