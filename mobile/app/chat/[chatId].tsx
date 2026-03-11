import { useLocalSearchParams } from "expo-router";
import { ChatRoomScreen } from "@/src/screens/chat/ChatRoomScreen";

export default function ChatRoute() {
  const params = useLocalSearchParams<{ chatId?: string }>();
  return <ChatRoomScreen chatId={Number(params.chatId)} />;
}
