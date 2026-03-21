import { Image } from "expo-image";
import { ChevronRight, X } from "lucide-react-native";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/src/components/common/AppText";
import { palette, radius, spacing } from "@/src/lib/theme";
import { useState } from "react";
import type { SpotImageItem } from "@/src/mocks/spotImages";

export function SpotCarousel({
  title,
  emoji,
  items,
  maxVisible = 3,
}: {
  title: string;
  emoji: string;
  items: SpotImageItem[];
  maxVisible?: number;
}) {
  const [open, setOpen] = useState(false);
  const visibleItems = items.slice(0, maxVisible);
  const hasMore = items.length > maxVisible;

  return (
    <View style={{ gap: spacing.md }}>
      <View style={styles.header}>
        <AppText variant="headline">
          {emoji} {title}
        </AppText>
        {hasMore ? (
          <Pressable style={styles.more} onPress={() => setOpen(true)}>
            <AppText variant="captionBold">더 보기</AppText>
            <ChevronRight size={14} color={palette.mutedForeground} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
        {visibleItems.map((item) => (
          <View key={item.name} style={styles.card}>
            <Image source={item.image} style={styles.cardImage} contentFit="cover" />
            <View style={styles.cardOverlay} />
            <View style={styles.cardText}>
              <AppText variant="bodyBold" tone="inverse">{item.name}</AppText>
              {item.subtitle ? <AppText variant="caption" tone="inverse">{item.subtitle}</AppText> : null}
            </View>
          </View>
        ))}
        {hasMore ? (
          <Pressable style={styles.moreCard} onPress={() => setOpen(true)}>
            <AppText variant="headline" tone="muted">+{items.length - maxVisible}</AppText>
          </Pressable>
        ) : null}
      </ScrollView>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <AppText variant="headline">
              {emoji} {title}
            </AppText>
            <Pressable style={styles.close} onPress={() => setOpen(false)}>
              <X size={16} color={palette.foreground} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalGrid}>
            {items.map((item) => (
              <View key={item.name} style={styles.modalCard}>
                <Image source={item.image} style={styles.modalCardImage} contentFit="cover" />
                <View style={styles.cardOverlay} />
                <View style={styles.cardText}>
                  <AppText variant="bodyBold" tone="inverse">{item.name}</AppText>
                  {item.subtitle ? <AppText variant="caption" tone="inverse">{item.subtitle}</AppText> : null}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  more: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  card: {
    width: 140,
    height: 180,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(15,23,42,0.24)",
  },
  cardText: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
  },
  moreCard: {
    width: 64,
    height: 180,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.secondary,
  },
  modal: {
    flex: 1,
    backgroundColor: palette.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: 18,
    paddingBottom: spacing.lg,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.secondary,
  },
  modalGrid: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  modalCard: {
    width: "48%",
    aspectRatio: 0.75,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  modalCardImage: {
    width: "100%",
    height: "100%",
  },
});
