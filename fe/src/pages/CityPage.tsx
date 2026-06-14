import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, MessageCircle, Heart, PenSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import UserAvatar from "@/components/shared/UserAvatar";
import PostCard from "@/components/shared/PostCard";
import CreatePostSheet from "@/components/shared/CreatePostSheet";
import FriendAddModal from "@/components/shared/FriendAddModal";
import ProfileDetailSheet from "@/components/shared/ProfileDetailSheet";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useChatRooms, useCityMembers, useEnsureChatRoom, usePosts } from "@/hooks/useApi";
import { findCityById, getStaticCities, sortPostsNewestFirst, toUiPost, toUiProfile, type UiProfile } from "@/lib/city-utils";
import { toast } from "sonner";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

type Tab = "members" | "posts";

const CityPage = () => {
  const [tab, setTab] = useState<Tab>("posts");
  const [friendTarget, setFriendTarget] = useState<UiProfile | null>(null);
  const [profileTarget, setProfileTarget] = useState<UiProfile | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const navigate = useNavigate();
  const { user, isLoggedIn, requireLogin } = useAuth();
  const cities = useMemo(() => getStaticCities(), []);
  const city = findCityById(cities, user?.currentCityId ?? null);
  const { data: membersData, isLoading: isMembersLoading } = useCityMembers(city?.id ?? "");
  const { data: postsData, isLoading: isPostsLoading } = usePosts({ cityId: city?.id });
  const { data: roomsData } = useChatRooms();
  const ensureChatRoom = useEnsureChatRoom();

  useEffect(() => {
    if (!isLoggedIn) {
      requireLogin();
    }
  }, [isLoggedIn, requireLogin]);

  if (!isLoggedIn) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <p className="text-sm text-muted-foreground">로그인이 필요합니다</p>
        </div>
      </AppLayout>
    );
  }

  if (!user || !city || isMembersLoading || isPostsLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  const members = [
    toUiProfile(user, { isFriend: false, joinedAt: user.createdAt }),
    ...(membersData ?? []).map((member) => toUiProfile(member, { currentCityId: city.id })),
  ];

  const cityPosts = sortPostsNewestFirst(
    (postsData?.pages ?? []).flatMap((page) => page.data).map(toUiPost).filter((post) => post.cityId === city.id),
  );

  const handleMessageClick = async (friendId: number) => {
    try {
      const room = (roomsData ?? []).find((candidate) => candidate.friendId === friendId);
      const targetRoom =
        room ?? (await ensureChatRoom.mutateAsync(friendId));
      navigate(`/chat/${targetRoom.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "채팅방을 열지 못했습니다");
    }
  };

  return (
    <AppLayout>
      <PageHeader title={`${city.countryFlag} ${city.name}`} subtitle={`${members.length}명이 이 도시에서 여행 중`} />

      <div className="border-b border-border bg-card px-4 py-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-gradient-ocean p-4 text-white">
          <p className="text-[11px] font-semibold text-white/70">도시 커뮤니티</p>
          <h2 className="mt-1 text-lg font-bold">같은 도시의 여행자와 기록을 나눠보세요</h2>
          <p className="mt-1 text-[12px] leading-5 text-white/75">미션 인증, 맛집 기록, 친구 추가가 이 도시를 기준으로 이어집니다.</p>
        </motion.div>
      </div>

      <div className="flex border-b border-border bg-card">
        {(["members", "posts"] as Tab[]).map((currentTab) => (
          <button
            key={currentTab}
            onClick={() => setTab(currentTab)}
            className={`relative flex-1 py-3 text-[13px] font-medium transition-colors ${
              tab === currentTab ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {currentTab === "members" ? "멤버" : "게시물"}
            {tab === currentTab && (
              <motion.div layoutId="city-tab" className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full bg-primary" />
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
            {members.map((member) => {
              const isSelf = member.id === user.id;
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 rounded-xl bg-card p-3 transition-shadow hover:shadow-elevated"
                >
                  <button onClick={() => setProfileTarget(member)}>
                    <UserAvatar name={member.name} avatar={member.avatarUrl ?? undefined} size="md" showOnline />
                  </button>
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setProfileTarget(member)}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-card-foreground">{member.name}</span>
                      {isSelf && (
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">나</span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {(member.totalSteps / 1000).toFixed(0)}K 보 {member.isFriend ? "• 친구" : ""}
                    </p>
                  </div>
                  {!isSelf && (
                    <div className="flex gap-1.5">
                      {!member.isFriend ? (
                        <button
                          onClick={() => setFriendTarget(member)}
                          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground"
                        >
                          <UserPlus className="h-3 w-3" />
                          친추
                        </button>
                      ) : (
                        <button
                          onClick={() => void handleMessageClick(member.id)}
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
              <p className="mt-0.5 text-[10px] text-muted-foreground">QR 실친 친추는 무료입니다</p>
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
              <EmptyState
                icon={PenSquare}
                title="아직 도시 기록이 없어요"
                description="첫 게시물을 남기면 같은 도시의 여행자들이 이곳에서 대화를 시작할 수 있습니다."
                action={
                  <button
                    type="button"
                    onClick={() => setShowCreatePost(true)}
                    className="pressable rounded-xl bg-primary px-4 py-2.5 text-[13px] font-bold text-primary-foreground"
                  >
                    첫 게시물 작성
                  </button>
                }
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {friendTarget && <FriendAddModal targetUser={friendTarget} sameCityCost={true} onClose={() => setFriendTarget(null)} />}
      {profileTarget && (
        <ProfileDetailSheet
          user={profileTarget}
          cityLabel={`${city.countryFlag} ${city.name}`}
          messageRoomId={(roomsData ?? []).find((room) => room.friendId === profileTarget.id)?.id ?? null}
          onMessage={() => {
            void handleMessageClick(profileTarget.id);
          }}
          onClose={() => setProfileTarget(null)}
          onAddFriend={() => setFriendTarget(profileTarget)}
        />
      )}
      <CreatePostSheet open={showCreatePost} onClose={() => setShowCreatePost(false)} city={city} />
    </AppLayout>
  );
};

export default CityPage;
