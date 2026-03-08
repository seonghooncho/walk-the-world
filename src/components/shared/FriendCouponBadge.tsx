import { Ticket } from "lucide-react";

interface FriendCouponBadgeProps {
  count: number;
}

const FriendCouponBadge = ({ count }: FriendCouponBadgeProps) => {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5">
      <Ticket className="h-3.5 w-3.5 text-primary" />
      <span className="text-xs font-semibold text-primary">
        친추 쿠폰 {count}장
      </span>
    </div>
  );
};

export default FriendCouponBadge;
