import { useLocalSearchParams } from "expo-router";
import { AddFriendScreen } from "@/src/screens/friend/AddFriendScreen";

export default function AddFriendRoute() {
  const params = useLocalSearchParams<{ userId?: string }>();
  return <AddFriendScreen userId={Number(params.userId)} />;
}
