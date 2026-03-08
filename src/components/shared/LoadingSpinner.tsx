import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  /** Tailwind size class, default h-5 w-5 */
  size?: string;
}

/**
 * Reusable spinning loader used by async action buttons (FriendAddModal, MissionDetailModal, etc.)
 */
const LoadingSpinner = ({ size = "h-5 w-5" }: LoadingSpinnerProps) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1 }}
      className={`${size} rounded-full border-2 border-primary-foreground border-t-transparent`}
    />
  );
};

export default LoadingSpinner;
