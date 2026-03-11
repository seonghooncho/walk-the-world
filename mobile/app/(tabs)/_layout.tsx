import { Tabs } from "expo-router";
import { BottomTabBar } from "@/src/components/layout/BottomTabBar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "#fcfaf7" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "홈" }} />
      <Tabs.Screen name="map" options={{ title: "노선도" }} />
      <Tabs.Screen name="city" options={{ title: "도시" }} />
      <Tabs.Screen name="feed" options={{ title: "채팅" }} />
      <Tabs.Screen name="profile" options={{ title: "프로필" }} />
    </Tabs>
  );
}
