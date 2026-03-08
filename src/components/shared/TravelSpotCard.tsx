import { motion } from "framer-motion";

interface TravelSpotCardProps {
  name: string;
  image: string;
  subtitle?: string;
  index?: number;
}

const TravelSpotCard = ({ name, image, subtitle, index = 0 }: TravelSpotCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="relative shrink-0 w-32 overflow-hidden rounded-xl group cursor-pointer"
    >
      <div className="aspect-[3/4] w-full">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <p className="text-[13px] font-semibold text-white leading-tight">{name}</p>
        {subtitle && (
          <p className="mt-0.5 text-[11px] text-white/70">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
};

export default TravelSpotCard;
