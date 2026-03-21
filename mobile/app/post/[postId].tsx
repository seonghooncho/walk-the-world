import { useLocalSearchParams } from "expo-router";
import { PostDetailScreen } from "@/src/screens/post/PostDetailScreen";

export default function PostRoute() {
  const params = useLocalSearchParams<{ postId?: string }>();
  return <PostDetailScreen postId={Number(params.postId)} />;
}
