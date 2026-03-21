import { Modal, Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette, radius } from "@/src/lib/theme";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function BottomSheet({ open, onClose, children, style }: BottomSheetProps) {
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <SafeAreaView edges={["bottom"]} style={[styles.sheet, style]}>
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>
        {children}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: palette.overlay,
  },
  sheet: {
    maxHeight: "88%",
    backgroundColor: palette.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: palette.border,
  },
});
