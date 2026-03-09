import { motion } from "framer-motion";
import { X, MapPin, Footprints, Calendar, UserPlus, MessageCircle } from "lucide-react";
import UserAvatar from "./UserAvatar";
import type { UserProfile } from "@/mocks/mockData";
import { getCurrentCity, formatSteps } from "@/mocks/mockData";
import { useAppStore } from "@/stores/appStore";
import { useNavigate } from "react-router-dom";

interface ProfileDetailSheetProps {
  user: UserProfile;
  onClose: () => void;
  onAddFriend?: () => void;
}

const ProfileDetailSheet = ({ user: target, onClose, onAddFriend }: ProfileDetailSheetProps) => {
  const currentUserState = useAppStore((s) => s.user);
  const getChatRoomByFriendId = useAppStore((s) => s.getChatRoomByFriendId);
  const navigate = useNavigate();
  const isSelf = target.id === currentUserState.id;
  const isFriend = currentUserState.friends.includes(target.id);
  const city = getCurrentCity(target.totalSteps);

  const joinDate = new Date(target.joinedAt);
  const joinLabel = `${joinDate.getFullYear()}.${String(joinDate.getMonth() + 1).padStart(2, "0")}`;

  const handleMessage = () => {
    const room = getChatRoomByFriendId(target.id);
    onClose();
    navigate(room ? `/chat/${room.id}` : "/feed");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-lg rounded-t-2xl bg-card pb-8"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Close */}
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted">
          <X className="h-5 w-5" />
        </button>

        {/* Profile header */}
        <div className="flex flex-col items-center px-6 pt-2">
          <UserAvatar name={target.name} avatar={target.avatar} size="lg" showOnline />
          <h2 className="mt-3 text-lg font-bold text-card-foreground">{target.name}</h2>
          {isSelf && (
            <span className="mt-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-medium text-primary-foreground">나</span>
          )}
        </div>

        {/* Stats */}
        <div className="mt-5 mx-6 grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center rounded-xl bg-muted/60 py-3">
            <Footprints className="h-4 w-4 text-primary mb-1" />
            <span className="text-sm font-bold text-card-foreground">{formatSteps(target.totalSteps)}</span>
            <span className="text-[10px] text-muted-foreground">총 걸음</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-muted/60 py-3">
            <MapPin className="h-4 w-4 text-accent mb-1" />
            <span className="text-sm font-bold text-card-foreground">{city.countryFlag} {city.name}</span>
            <span className="text-[10px] text-muted-foreground">현재 도시</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-muted/60 py-3">
            <Calendar className="h-4 w-4 text-ocean mb-1" />
            <span className="text-sm font-bold text-card-foreground">{joinLabel}</span>
            <span className="text-[10px] text-muted-foreground">가입일</span>
          </div>
        </div>

        {/* Actions */}
        {!isSelf && (
          <div className="mt-5 flex gap-3 mx-6">
            {!isFriend ? (
              <button
                onClick={() => { onAddFriend?.(); onClose(); }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-hero py-3 text-sm font-semibold text-primary-foreground"
              >
                <UserPlus className="h-4 w-4" />
                친구 추가
              </button>
            ) : (
              <button
                onClick={handleMessage}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-hero py-3 text-sm font-semibold text-primary-foreground"
              >
                <MessageCircle className="h-4 w-4" />
                메시지 보내기
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfileDetailSheet;
