import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react-native";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { AppScreen } from "@/src/components/common/AppScreen";
import { AppText } from "@/src/components/common/AppText";
import { LoadingSpinner } from "@/src/components/common/LoadingSpinner";
import { UserAvatar } from "@/src/components/common/UserAvatar";
import { useAuth } from "@/src/contexts/AuthContext";
import { useChatRooms } from "@/src/hooks/useApi";
import { getTimeAgo } from "@/src/lib/time-ago";
import { palette, radius, spacing } from "@/src/lib/theme";

export function FeedScreen() {
  const [search, setSearch] = useState("");
  const { isLoggedIn, requireLogin, isReady } = useAuth();
  const { data: rooms, isLoading } = useChatRooms();

  useEffect(() => {
    if (isReady && !isLoggedIn) {
      requireLogin();
    }
  }, [isLoggedIn, isReady, requireLogin]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rooms ?? [];
    return (rooms ?? []).filter((room) => room.friendName.toLowerCase().includes(search.toLowerCase()));
  }, [rooms, search]);

  if (!isLoggedIn) {
    return (
      <AppScreen centerContent>
        <AppText tone="muted">로그인이 필요합니다</AppText>
      </AppScreen>
    );
  }

  return (
    <AppScreen padded>
      <View style={{ paddingTop: 16, gap: spacing.md }}>
        <View>
          <AppText variant="title">채팅</AppText>
          <AppText variant="caption">친구들과 대화를 나눠보세요</AppText>
        </View>

        <View style={styles.search}>
          <Search size={16} color={palette.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="친구 검색..."
            placeholderTextColor={palette.mutedForeground}
            style={styles.searchInput}
          />
        </View>

        {isLoading ? (
          <View style={{ paddingTop: 80 }}>
            <LoadingSpinner size="large" />
          </View>
        ) : filtered.length > 0 ? (
          filtered.map((room) => (
            <Pressable key={room.id} style={styles.room} onPress={() => router.push(`/chat/${room.id}`)}>
              <UserAvatar name={room.friendName} avatar={room.friendAvatar} size="md" showOnline />
              <View style={{ flex: 1 }}>
                <AppText variant="bodyBold">{room.friendName}</AppText>
                <AppText variant="caption" numberOfLines={1}>{room.lastMessage ?? ""}</AppText>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <AppText variant="caption">{room.lastMessageAt ? getTimeAgo(room.lastMessageAt) : ""}</AppText>
                {room.unreadCount > 0 ? (
                  <View style={styles.badge}>
                    <AppText variant="captionBold" tone="inverse">{String(Math.min(room.unreadCount, 99))}</AppText>
                  </View>
                ) : null}
              </View>
            </Pressable>
          ))
        ) : (
          <View style={{ paddingTop: 80, alignItems: "center", gap: 6 }}>
            <AppText variant="headline" tone="muted">{search ? "검색 결과가 없어요" : "채팅방이 없어요"}</AppText>
            <AppText tone="muted">도시 커뮤니티에서 친구를 추가해보세요!</AppText>
          </View>
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  search: {
    minHeight: 46,
    borderRadius: radius.lg,
    backgroundColor: palette.secondary,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: palette.foreground,
  },
  room: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
});
