import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";
import UserAvatar from "@/components/shared/UserAvatar";
import ProfileDetailSheet from "@/components/shared/ProfileDetailSheet";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useChatMessages, useChatRoom, useChatRooms, useMarkChatAsRead, usePublicProfile, useSendMessage } from "@/hooks/useApi";
import { groupMessagesByDate, toUiChatMessage, toUiProfile } from "@/lib/city-utils";
import { SOCIAL_TEXT_MAX_LENGTH } from "@/lib/input-limits";
import { toast } from "sonner";

const ChatRoomPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn, requireLogin } = useAuth();
  const [input, setInput] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);
  const roomId = Number(chatId);
  const hasValidRoomId = Number.isFinite(roomId) && roomId > 0;

  const { data: roomsData, isLoading: isRoomsLoading } = useChatRooms();
  const listedRoom = (roomsData ?? []).find((candidate) => candidate.id === roomId);
  const shouldFetchDirectRoom = hasValidRoomId && !listedRoom;
  const { data: directRoom, isLoading: isDirectRoomLoading } = useChatRoom(roomId, {
    enabled: shouldFetchDirectRoom,
  });
  const { data: messagesData, isLoading: isMessagesLoading } = useChatMessages(roomId);
  const sendMessage = useSendMessage();
  const markChatAsRead = useMarkChatAsRead();

  const room = listedRoom ?? directRoom;
  const roomLookupFailed = hasValidRoomId && !room && !isRoomsLoading && !isDirectRoomLoading;
  const friendId = room?.friendId ?? 0;
  const { data: friendProfile } = usePublicProfile(friendId);
  const messages = useMemo(
    () => (messagesData?.pages ?? []).flatMap((page) => page.data).map(toUiChatMessage),
    [messagesData],
  );
  const groupedByDate = useMemo(() => groupMessagesByDate(messages), [messages]);
  const profileTarget =
    room && friendProfile
      ? toUiProfile(friendProfile, { isFriend: true, currentCityId: friendProfile.currentCityId })
      : null;

  useEffect(() => {
    if (!isLoggedIn) {
      requireLogin();
    }
  }, [isLoggedIn, requireLogin]);

  useEffect(() => {
    if (room?.unreadCount) {
      markChatAsRead.mutate(room.id);
    }
  }, [markChatAsRead, room]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !hasValidRoomId || sendMessage.isPending) {
      return;
    }

    try {
      await sendMessage.mutateAsync({ roomId, content: text });
      setInput("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "메시지를 보내지 못했습니다");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center bg-background">
        <p className="text-muted-foreground">로그인이 필요합니다</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (!hasValidRoomId || roomLookupFailed) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center bg-background">
        <p className="text-muted-foreground">채팅방을 찾을 수 없어요</p>
        <button onClick={() => navigate("/feed")} className="mt-3 text-sm font-medium text-primary">
          돌아가기
        </button>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours < 12 ? "오전" : "오후"} ${hours % 12 || 12}:${minutes}`;
  };

  const getTimeKey = (message: (typeof messages)[number]) => {
    const date = new Date(message.createdAt);
    return `${message.senderId}_${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
  };

  const shouldShowTime = (groupMessages: typeof messages, index: number) => {
    const current = groupMessages[index];
    const next = groupMessages[index + 1];
    if (!next) {
      return true;
    }
    return getTimeKey(current) !== getTimeKey(next);
  };

  const chatTitle = room?.friendName ?? "채팅방 불러오는 중";

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-border bg-card px-3 pb-3 pt-12">
        <button onClick={() => navigate("/feed")} className="rounded-full p-1.5 hover:bg-muted">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <button
          onClick={() => room && setShowProfile(true)}
          disabled={!room}
          className="flex items-center gap-2.5 text-left disabled:cursor-default"
        >
          <UserAvatar name={chatTitle} avatar={room?.friendAvatar ?? undefined} size="md" showOnline={!!room} />
          <span className="text-sm font-semibold text-foreground">{chatTitle}</span>
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
        {isMessagesLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          groupedByDate.map((group) => (
            <div key={group.date}>
              <div className="my-3 flex justify-center">
                <span className="rounded-full bg-muted px-3 py-1 text-[10px] text-muted-foreground">
                  {formatDate(group.date)}
                </span>
              </div>
              <div className="space-y-1.5">
                {group.messages.map((message, index) => {
                  const isMine = message.senderId === user.id;
                  const showTime = shouldShowTime(group.messages, index);
                  const isUnread = isMine && message.read === false;

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex max-w-[75%] items-end gap-1.5 ${isMine ? "flex-row-reverse" : ""}`}>
                        <div
                          className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm ${
                            isMine
                              ? "rounded-br-md bg-primary text-primary-foreground"
                              : "rounded-bl-md bg-muted text-foreground"
                          }`}
                        >
                          {message.content}
                        </div>
                        {showTime && (
                          <div className={`flex shrink-0 flex-col ${isMine ? "items-end" : "items-start"}`}>
                            {isMine && isUnread && (
                              <span className="text-[10px] font-semibold leading-tight text-primary">1</span>
                            )}
                            <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                        )}
                        {!showTime && isMine && isUnread && (
                          <span className="shrink-0 text-[10px] font-semibold text-primary">1</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border bg-card px-3 py-3 pb-safe">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={SOCIAL_TEXT_MAX_LENGTH}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !isComposingRef.current) {
                event.preventDefault();
                void handleSend();
              }
            }}
            placeholder="메시지를 입력하세요..."
            className="flex-1 rounded-xl bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!input.trim() || sendMessage.isPending || !hasValidRoomId}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
            aria-label="메시지 보내기"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="mt-1 flex justify-end">
          <span className="text-[10px] text-muted-foreground">
            {input.length}/{SOCIAL_TEXT_MAX_LENGTH}
          </span>
        </div>
      </div>

      {showProfile && profileTarget && (
        <ProfileDetailSheet
          user={profileTarget}
          cityLabel={profileTarget.currentCityId}
          messageRoomId={room.id}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
};

export default ChatRoomPage;
