import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";
import UserAvatar from "@/components/shared/UserAvatar";
import ProfileDetailSheet from "@/components/shared/ProfileDetailSheet";
import { useAppStore } from "@/stores/appStore";
import type { UserProfile } from "@/data/mockData";
import type { ChatMessage } from "@/stores/appStore";

const ChatRoomPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const chatRooms = useAppStore((s) => s.chatRooms);
  const userMap = useAppStore((s) => s.userMap);
  const sendMessage = useAppStore((s) => s.sendMessage);
  const markChatAsRead = useAppStore((s) => s.markChatAsRead);

  const [input, setInput] = useState("");
  const [profileTarget, setProfileTarget] = useState<UserProfile | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);

  const chatRoom = chatRooms.find((r) => r.id === chatId);
  const friend = chatRoom ? userMap[chatRoom.friendId] : null;
  const messages = chatRoom?.messages ?? [];

  // 채팅방 진입 시 읽음 처리
  useEffect(() => {
    if (chatId && chatRoom && chatRoom.unread > 0) {
      markChatAsRead(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !chatId) return;
    sendMessage(chatId, text);
    setInput("");
  };

  if (!chatRoom || !friend) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center bg-background">
        <p className="text-muted-foreground">채팅방을 찾을 수 없어요</p>
        <button onClick={() => navigate("/feed")} className="mt-3 text-sm text-primary font-medium">돌아가기</button>
      </div>
    );
  }

  // Group messages by date
  const groupedByDate: { date: string; msgs: ChatMessage[] }[] = [];
  messages.forEach((msg) => {
    const d = msg.createdAt.slice(0, 10);
    const last = groupedByDate[groupedByDate.length - 1];
    if (last && last.date === d) {
      last.msgs.push(msg);
    } else {
      groupedByDate.push({ date: d, msgs: [msg] });
    }
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h < 12 ? "오전" : "오후"} ${h % 12 || 12}:${m}`;
  };

  /** 같은 발신자 + 같은 분(minute)인 연속 메시지 중 마지막만 시간 표시 */
  const getTimeKey = (msg: ChatMessage) => {
    const d = new Date(msg.createdAt);
    return `${msg.senderId}_${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}-${d.getMinutes()}`;
  };

  const shouldShowTime = (msgs: ChatMessage[], idx: number) => {
    const cur = msgs[idx];
    const next = msgs[idx + 1];
    if (!next) return true;
    return getTimeKey(cur) !== getTimeKey(next);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-3 pb-3 pt-12">
        <button onClick={() => navigate("/feed")} className="rounded-full p-1.5 hover:bg-muted">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <button onClick={() => setProfileTarget(friend)} className="flex items-center gap-2.5">
          <UserAvatar name={friend.name} size="md" showOnline />
          <span className="text-sm font-semibold text-foreground">{friend.name}</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {groupedByDate.map((group) => (
          <div key={group.date}>
            <div className="flex justify-center my-3">
              <span className="rounded-full bg-muted px-3 py-1 text-[10px] text-muted-foreground">
                {formatDate(group.date)}
              </span>
            </div>
            <div className="space-y-1.5">
              {group.msgs.map((msg, idx) => {
                const isMine = msg.senderId === user.id;
                const showTime = shouldShowTime(group.msgs, idx);
                const isUnread = isMine && msg.read === false;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex items-end gap-1.5 max-w-[75%] ${isMine ? "flex-row-reverse" : ""}`}>
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-sm ${
                          isMine
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        }`}
                      >
                        {msg.content}
                      </div>
                      {showTime && (
                        <div className={`flex flex-col shrink-0 ${isMine ? "items-end" : "items-start"}`}>
                          {isMine && isUnread && (
                            <span className="text-[10px] text-primary font-semibold leading-tight">1</span>
                          )}
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      )}
                      {!showTime && isMine && isUnread && (
                        <span className="text-[10px] text-primary font-semibold shrink-0">1</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-3 py-3 pb-safe">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onCompositionStart={() => { isComposingRef.current = true; }}
            onCompositionEnd={() => { isComposingRef.current = false; }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isComposingRef.current) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="메시지를 입력하세요..."
            className="flex-1 rounded-xl bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Profile sheet */}
      {profileTarget && (
        <ProfileDetailSheet user={profileTarget} onClose={() => setProfileTarget(null)} />
      )}
    </div>
  );
};

export default ChatRoomPage;
