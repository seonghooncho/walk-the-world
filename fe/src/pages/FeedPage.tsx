import { useEffect } from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Search, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import UserAvatar from "@/components/shared/UserAvatar";
import EmptyState from "@/components/shared/EmptyState";
import { useChatRooms } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import type { ChatRoomData } from "@/lib/api";
import { getTimeAgo } from "@/lib/timeAgo";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const FeedPage = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { isLoggedIn, requireLogin } = useAuth();

  // Require login to access chat
  useEffect(() => {
    if (!isLoggedIn) {
      requireLogin();
    }
  }, [isLoggedIn, requireLogin]);

  const { data: apiRooms, isLoading } = useChatRooms();

  const rooms: Array<{
    id: string;
    friendName: string;
    friendAvatar: string | null;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
  }> = (apiRooms || []).map((r: ChatRoomData) => ({
    id: String(r.id),
    friendName: r.friendName,
    friendAvatar: r.friendAvatar,
    lastMessage: r.lastMessage ?? "",
    lastMessageAt: r.lastMessageAt ?? "",
    unreadCount: r.unreadCount,
  }));

  const filtered = search
    ? rooms.filter((r) =>
        r.friendName.toLowerCase().includes(search.toLowerCase())
      )
    : rooms;

  const handleChatClick = (roomId: string) => {
    navigate(`/chat/${roomId}`);
  };

  if (!isLoggedIn) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground text-sm">로그인이 필요합니다</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="채팅" subtitle="도시에서 만난 친구들과 이어지는 대화" />

      {/* Search */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="친구 검색..."
            className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="px-4">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((room, i) => (
            <motion.button
              key={room.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => handleChatClick(room.id)}
              className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary/60 active:bg-secondary"
            >
              <UserAvatar name={room.friendName} size="md" showOnline />
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-foreground">{room.friendName}</span>
                </div>
                <div className="flex items-end justify-between mt-0.5">
                  <p
                    className={`truncate text-[12px] flex-1 mr-2 ${
                      room.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {room.lastMessage}
                  </p>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] text-muted-foreground">
                      {room.lastMessageAt ? getTimeAgo(room.lastMessageAt) : ""}
                    </span>
                    {room.unreadCount > 0 && (
                      <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                        {Math.min(room.unreadCount, 99)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          ))
        ) : (
          <EmptyState
            icon={search ? Search : MessageCircle}
            title={search ? "검색 결과가 없어요" : "아직 채팅방이 없어요"}
            description={search ? "친구 이름을 다시 확인해보세요." : "같은 도시의 여행자를 친구로 추가하면 대화를 시작할 수 있습니다."}
            action={
              !search && (
                <button
                  type="button"
                  onClick={() => navigate("/city")}
                  className="pressable inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-bold text-primary-foreground"
                >
                  <Users className="h-4 w-4" />
                  도시 커뮤니티 보기
                </button>
              )
            }
          />
        )}
      </div>
    </AppLayout>
  );
};

export default FeedPage;
