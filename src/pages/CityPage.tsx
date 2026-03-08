import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, MessageCircle, Heart, PenSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import UserAvatar from "@/components/shared/UserAvatar";
import PostCard from "@/components/shared/PostCard";
import CreatePostSheet from "@/components/shared/CreatePostSheet";
import FriendAddModal from "@/components/shared/FriendAddModal";
import ProfileDetailSheet from "@/components/shared/ProfileDetailSheet";
import { cityUsers, getCurrentCity } from "@/data/mockData";
import type { UserProfile } from "@/data/mockData";
import { useAppStore } from "@/stores/appStore";
import { toast } from "sonner";

type Tab = "members" | "posts";

const CityPage = () => {
  const [tab, setTab] = useState<Tab>("posts");
  const [friendTarget, setFriendTarget] = useState<UserProfile | null>(null);
  const [profileTarget, setProfileTarget] = useState<UserProfile | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const posts = useAppStore((s) => s.posts);
  const addPost = useAppStore((s) => s.addPost);
  const getChatRoomByFriendId = useAppStore((s) => s.getChatRoomByFriendId);
  const city = getCurrentCity(user.totalSteps);
  const cityPosts = posts.filter((p) => p.cityId === city.id);
  const allUsers = [
    { ...user } as UserProfile,
    ...cityUsers.filter((u) => u.id !== user.id),
  ];

  const handleMessageClick = (friendId: string) => {
    const room = getChatRoomByFriendId(friendId);
    if (room) {
      navigate(`/chat/${room.id}`);
    } else {
      toast.info("채팅방이 없습니다");
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="px-4 pb-5 pt-12 bg-card border-b border-border">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">도시 커뮤니티</p>
          <h1 className="text-xl font-bold text-foreground mt-0.5">
            {city.countryFlag} {city.name}
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {allUsers.length}명이 이 도시에 있습니다
          </p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-card">
        {(["members", "posts"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative flex-1 py-3 text-[13px] font-medium transition-colors ${
              tab === t ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {t === "members" ? "멤버" : "게시물"}
            {tab === t && (
              <motion.div
                layoutId="city-tab"
                className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full bg-primary"
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "members" ? (
          <motion.div
            key="members"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-1.5 p-4"
          >
            {allUsers.map((u) => {
              const isSelf = u.id === user.id;
              const isFriend = user.friends.includes(u.id);

              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 rounded-xl bg-card p-3 transition-shadow hover:shadow-elevated"
                >
                  <button onClick={() => setProfileTarget(u)}>
                    <UserAvatar name={u.name} size="md" showOnline />
                  </button>
                  <div className="flex-1 cursor-pointer min-w-0" onClick={() => setProfileTarget(u)}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-card-foreground">{u.name}</span>
                      {isSelf && (
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">나</span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {(u.totalSteps / 1000).toFixed(0)}K 보 {isFriend ? "• 친구" : ""}
                    </p>
                  </div>
                  {!isSelf && (
                    <div className="flex gap-1.5">
                      {!isFriend ? (
                        <button
                          onClick={() => setFriendTarget(u)}
                          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground"
                        >
                          <UserPlus className="h-3 w-3" />
                          친추
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMessageClick(u.id)}
                          className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-[11px] font-medium text-secondary-foreground"
                        >
                          <MessageCircle className="h-3 w-3" />
                          메시지
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}

            <div className="mt-3 rounded-xl bg-secondary p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                <Heart className="h-3 w-3 text-destructive" />
                <span>같은 도시: 쿠폰 1장 | 다른 도시: 하트 2개</span>
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                QR 실친 친추는 무료! 매주 쿠폰 1장 제공
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="posts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2.5 p-4"
          >
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreatePost(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/50 py-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary"
            >
              <PenSquare className="h-4 w-4" />
              게시물 작성하기
            </motion.button>

            {cityPosts.length > 0 ? (
              cityPosts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="py-16 text-center">
                <p className="text-[13px] text-muted-foreground">아직 게시물이 없어요</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {friendTarget && (
        <FriendAddModal
          targetUser={friendTarget}
          sameCityCost={true}
          onClose={() => setFriendTarget(null)}
        />
      )}
      {profileTarget && (
        <ProfileDetailSheet
          user={profileTarget}
          onClose={() => setProfileTarget(null)}
          onAddFriend={() => setFriendTarget(profileTarget)}
        />
      )}
      <CreatePostSheet
        open={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPost={(content, image) => addPost(content, image, city.id)}
      />
    </AppLayout>
  );
};

export default CityPage;
