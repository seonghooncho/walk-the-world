import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import TravelSpotCard from "./TravelSpotCard";

interface SpotItem {
  name: string;
  image: string;
  subtitle?: string;
}

interface SpotCarouselProps {
  title: string;
  emoji: string;
  items: SpotItem[];
  maxVisible?: number;
}

const SpotCarousel = ({ title, emoji, items, maxVisible = 3 }: SpotCarouselProps) => {
  const [showAll, setShowAll] = useState(false);
  const visibleItems = items.slice(0, maxVisible);
  const hasMore = items.length > maxVisible;

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-foreground">
          {emoji} {title}
        </h2>
        {hasMore && (
          <button
            onClick={() => setShowAll(true)}
            className="flex items-center gap-0.5 text-xs font-medium text-muted-foreground"
          >
            더 보기
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
        {visibleItems.map((item, i) => (
          <TravelSpotCard
            key={item.name}
            name={item.name}
            image={item.image}
            subtitle={item.subtitle}
            index={i}
          />
        ))}
        {hasMore && (
          <button
            onClick={() => setShowAll(true)}
            className="flex shrink-0 w-16 items-center justify-center rounded-xl bg-secondary"
          >
            <div className="text-center">
              <p className="text-sm font-semibold text-muted-foreground">+{items.length - maxVisible}</p>
            </div>
          </button>
        )}
      </div>

      <AnimatePresence>
        {showAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                <h2 className="text-base font-semibold text-foreground">
                  {emoji} {title}
                </h2>
                <button
                  onClick={() => setShowAll(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary"
                >
                  <X className="h-4 w-4 text-foreground" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="grid grid-cols-2 gap-2.5">
                  {items.map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="relative overflow-hidden rounded-xl group cursor-pointer"
                    >
                      <div className="aspect-[3/4] w-full">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-[13px] font-semibold text-white">{item.name}</p>
                        {item.subtitle && (
                          <p className="mt-0.5 text-[11px] text-white/70">{item.subtitle}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpotCarousel;
