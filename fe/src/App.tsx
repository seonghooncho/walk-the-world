import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import LoginModal from "@/components/shared/LoginModal";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import CityPage from "./pages/CityPage";
import FeedPage from "./pages/FeedPage";
import ChatRoomPage from "./pages/ChatRoomPage";
import ProfilePage from "./pages/ProfilePage";
import AddFriendPage from "./pages/AddFriendPage";
import PostDetailPage from "./pages/PostDetailPage";
import BadgeCollectionPage from "./pages/BadgeCollectionPage";
import LoginPage from "./pages/LoginPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import NotFound from "./pages/NotFound";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LoginModal />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<OAuthCallbackPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/city" element={<CityPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/chat/:chatId" element={<ChatRoomPage />} />
            <Route path="/post/:postId" element={<PostDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/badges" element={<BadgeCollectionPage />} />
            <Route path="/add-friend/:userId" element={<AddFriendPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
