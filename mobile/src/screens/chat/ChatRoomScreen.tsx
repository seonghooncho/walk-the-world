import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Send } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { AppText } from "@/src/components/common/AppText";
import { LoadingSpinner } from "@/src/components/common/LoadingSpinner";
import { UserAvatar } from "@/src/components/common/UserAvatar";
import { ProfileDetailSheet } from "@/src/components/shared/ProfileDetailSheet";
import { useAuth } from "@/src/contexts/AuthContext";
import { useChatMessages, useChatRooms, useMarkChatAsRead, usePublicProfile, useSendMessage } from "@/src/hooks/useApi";
import { groupMessagesByDate, toUiChatMessage, toUiProfile } from "@/src/lib/city-utils";
import { palette, radius, spacing } from "@/src/lib/theme";

export function ChatRoomScreen({ chatId }: { chatId: number }) {
  const { user, isLoggedIn, requireLogin, isReady } = useAuth();
  const [input, setInput] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const { data: roomsData, isLoading: isRoomsLoading } = useChatRooms();
  const { data: messagesData, isLoading: isMessagesLoading } = useChatMessages(chatId);
  const sendMessage = useSendMessage();
  const markChatAsRead = useMarkChatAsRead();
  const room = (roomsData ?? []).find((candidate) => candidate.id === chatId);
  const friendId = room?.friendId ?? 0;
  const { data: friendProfile } = usePublicProfile(friendId);
  const messages = useMemo(() => (messagesData?.pages ?? []).flatMap((page) => page.data).map(toUiChatMessage), [messagesData]);
  const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages]);
  const profileTarget = room && friendProfile ? toUiProfile(friendProfile, { isFriend: true, currentCityId: friendProfile.currentCityId }) : null;

  useEffect(() => {
    if (isReady && !isLoggedIn) requireLogin();
  }, [isLoggedIn, isReady, requireLogin]);

  useEffect(() => {
    if (room?.unreadCount) {
      markChatAsRead.mutate(room.id);
    }
  }, [markChatAsRead, room]);

  const submit = async () => {
    if (!input.trim()) return;
    try {
      await sendMessage.mutateAsync({ roomId: chatId, content: input.trim() });
      setInput("");
    } catch {
      // ignore, toast is not critical here
    }
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.center}>
        <AppText tone="muted">로그인이 필요합니다</AppText>
      </View>
    );
  }

  if (isRoomsLoading || isMessagesLoading || !user) {
    return (
      <View style={styles.center}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.center}>
        <AppText tone="muted">채팅방을 찾을 수 없어요</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={20} color={palette.foreground} />
        </Pressable>
        <Pressable style={styles.headerUser} onPress={() => setShowProfile(true)}>
          <UserAvatar name={room.friendName} avatar={room.friendAvatar} size="md" showOnline />
          <AppText variant="bodyBold">{room.friendName}</AppText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.messages}>
        {groupedMessages.map((group) => (
          <View key={group.date} style={{ gap: spacing.md }}>
            <View style={styles.dateWrap}>
              <AppText variant="caption">{group.date}</AppText>
            </View>
            {group.messages.map((message) => {
              const isMine = message.senderId === user.id;
              return (
                <View key={message.id} style={[styles.messageRow, isMine && { justifyContent: "flex-end" }]}>
                  <View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}>
                    <AppText tone={isMine ? "inverse" : "default"}>{message.content}</AppText>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="메시지를 입력하세요..."
          placeholderTextColor={palette.mutedForeground}
          style={styles.input}
          onSubmitEditing={() => void submit()}
        />
        <Pressable onPress={() => void submit()} disabled={!input.trim()} style={[styles.send, !input.trim() && { opacity: 0.4 }]}>
          <Send size={16} color={palette.white} />
        </Pressable>
      </View>

      {profileTarget ? (
        <ProfileDetailSheet open={showProfile} onClose={() => setShowProfile(false)} user={profileTarget} cityLabel={profileTarget.currentCityId} onMessage={() => setShowProfile(false)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingTop: 64,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: palette.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  headerUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  messages: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 120,
  },
  dateWrap: {
    alignSelf: "center",
    backgroundColor: palette.secondary,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  messageRow: {
    flexDirection: "row",
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  myBubble: {
    backgroundColor: palette.primary,
    borderBottomRightRadius: 8,
  },
  otherBubble: {
    backgroundColor: palette.secondary,
    borderBottomLeftRadius: 8,
  },
  inputBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 28,
    backgroundColor: palette.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.xl,
    backgroundColor: palette.secondary,
    paddingHorizontal: spacing.lg,
    color: palette.foreground,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
