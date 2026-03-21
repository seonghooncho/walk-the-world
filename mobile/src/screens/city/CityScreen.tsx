import { useEffect, useMemo, useState } from "react";
import { MessageCircle, PenSquare, UserPlus } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AppScreen } from "@/src/components/common/AppScreen";
import { AppText } from "@/src/components/common/AppText";
import { LoadingSpinner } from "@/src/components/common/LoadingSpinner";
import { UserAvatar } from "@/src/components/common/UserAvatar";
import { CreatePostSheet } from "@/src/components/shared/CreatePostSheet";
import { FriendAddSheet } from "@/src/components/shared/FriendAddSheet";
import { PostCard } from "@/src/components/shared/PostCard";
import { ProfileDetailSheet } from "@/src/components/shared/ProfileDetailSheet";
import { useAuth } from "@/src/contexts/AuthContext";
import { useChatRooms, useCityMembers, useEnsureChatRoom, usePosts } from "@/src/hooks/useApi";
import { findCityById, getStaticCities, sortPostsNewestFirst, toUiPost, toUiProfile, type UiProfile } from "@/src/lib/city-utils";
import { palette, radius, spacing } from "@/src/lib/theme";
import { useToast } from "@/src/providers/ToastProvider";

type Tab = "members" | "posts";

export function CityScreen() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("posts");
  const [friendTarget, setFriendTarget] = useState<UiProfile | null>(null);
  const [profileTarget, setProfileTarget] = useState<UiProfile | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { user, isLoggedIn, requireLogin, isReady } = useAuth();
  const cities = useMemo(() => getStaticCities(), []);
  const city = findCityById(cities, user?.currentCityId ?? null);
  const { data: membersData, isLoading: isMembersLoading } = useCityMembers(city?.id ?? "");
  const { data: postsData, isLoading: isPostsLoading } = usePosts({ cityId: city?.id });
  const { data: roomsData } = useChatRooms();
  const ensureChatRoom = useEnsureChatRoom();

  useEffect(() => {
    if (isReady && !isLoggedIn) {
      requireLogin();
    }
  }, [isLoggedIn, isReady, requireLogin]);

  if (!isLoggedIn) {
    return (
      <AppScreen centerContent>
        <AppText tone="muted">로그인이 필요합니다</AppText>
      </AppScreen>
    );
  }

  if (!user || !city || isMembersLoading || isPostsLoading) {
    return (
      <AppScreen centerContent>
        <LoadingSpinner size="large" />
      </AppScreen>
    );
  }

  const members = [
    toUiProfile(user, { isFriend: false, joinedAt: user.createdAt }),
    ...(membersData ?? []).map((member) => toUiProfile(member, { currentCityId: city.id })),
  ];

  const cityPosts = sortPostsNewestFirst((postsData?.pages ?? []).flatMap((page) => page.data).map(toUiPost));

  const handleMessage = async (friendId: number) => {
    try {
      const room = (roomsData ?? []).find((candidate) => candidate.friendId === friendId);
      const targetRoom = room ?? (await ensureChatRoom.mutateAsync(friendId));
      router.push(`/chat/${targetRoom.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "채팅방을 열지 못했습니다");
    }
  };

  return (
    <AppScreen>
      <View style={styles.header}>
        <AppText variant="caption">도시 커뮤니티</AppText>
        <AppText variant="title">
          {city.countryFlag} {city.name}
        </AppText>
        <AppText variant="caption">{members.length}명이 이 도시에 있습니다</AppText>
      </View>

      <View style={styles.tabs}>
        {(["members", "posts"] as Tab[]).map((currentTab) => (
          <Pressable key={currentTab} onPress={() => setTab(currentTab)} style={[styles.tab, tab === currentTab && styles.tabActive]}>
            <AppText variant="bodyBold" tone={tab === currentTab ? "default" : "muted"}>{currentTab === "members" ? "멤버" : "게시물"}</AppText>
          </Pressable>
        ))}
      </View>

      {tab === "members" ? (
        <ScrollView contentContainerStyle={styles.content}>
          {members.map((member) => {
            const isSelf = member.id === user.id;
            return (
              <View key={member.id} style={styles.memberCard}>
                <Pressable onPress={() => setProfileTarget(member)}>
                  <UserAvatar name={member.name} avatar={member.avatarUrl} size="md" showOnline />
                </Pressable>
                <Pressable style={{ flex: 1 }} onPress={() => setProfileTarget(member)}>
                  <AppText variant="bodyBold">{member.name}</AppText>
                  <AppText variant="caption">
                    {(member.totalSteps / 1000).toFixed(0)}K 보 {member.isFriend ? "• 친구" : ""}
                  </AppText>
                </Pressable>
                {!isSelf ? (
                  member.isFriend ? (
                    <Pressable style={styles.secondaryButton} onPress={() => void handleMessage(member.id)}>
                      <MessageCircle size={14} color={palette.secondaryForeground} />
                      <AppText variant="captionBold">메시지</AppText>
                    </Pressable>
                  ) : (
                    <Pressable style={styles.primaryButton} onPress={() => setFriendTarget(member)}>
                      <UserPlus size={14} color={palette.white} />
                      <AppText variant="captionBold" tone="inverse">친추</AppText>
                    </Pressable>
                  )
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable style={styles.postComposer} onPress={() => setShowCreatePost(true)}>
            <PenSquare size={16} color={palette.mutedForeground} />
            <AppText variant="bodyBold" tone="muted">게시물 작성하기</AppText>
          </Pressable>
          {cityPosts.length > 0 ? cityPosts.map((post) => <PostCard key={post.id} post={post} />) : <AppText tone="muted" style={{ textAlign: "center", marginTop: 40 }}>아직 게시물이 없어요</AppText>}
        </ScrollView>
      )}

      <FriendAddSheet open={Boolean(friendTarget)} targetUser={friendTarget} sameCityCost onClose={() => setFriendTarget(null)} />
      {profileTarget ? (
        <ProfileDetailSheet
          open={Boolean(profileTarget)}
          onClose={() => setProfileTarget(null)}
          user={profileTarget}
          cityLabel={`${city.countryFlag} ${city.name}`}
          onMessage={() => void handleMessage(profileTarget.id)}
          onAddFriend={() => setFriendTarget(profileTarget)}
        />
      ) : null}
      <CreatePostSheet open={showCreatePost} onClose={() => setShowCreatePost(false)} city={city} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 4,
    backgroundColor: palette.card,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: palette.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: palette.primary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: 120,
  },
  memberCard: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  primaryButton: {
    minHeight: 34,
    borderRadius: radius.md,
    backgroundColor: palette.primary,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  secondaryButton: {
    minHeight: 34,
    borderRadius: radius.md,
    backgroundColor: palette.secondary,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  postComposer: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: palette.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexDirection: "row",
  },
});
