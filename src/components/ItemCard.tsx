import { motion } from "framer-motion";
import { MapPin, Calendar, MessageCircle } from "lucide-react";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

export interface ItemData {
  id: string;
  type: "lost" | "found";
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  imageUrl: string;
  userName: string;
  userEmail: string;
  matchConfidence?: number;
  isMatched?: boolean;
}

interface ItemCardProps {
  item: ItemData;
  onClick?: () => void;
  className?: string;
  index?: number;
}

export function ItemCard({ item, onClick, className, index = 0 }: ItemCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={cn(
        "bg-card rounded-lg overflow-hidden shadow-card card-hover cursor-pointer border border-border",
        className
      )}
      onClick={onClick}
    >
      {/* Header - User Info */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-3">
          <AvatarInitials name={item.userName} size="sm" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">{item.userName}</span>
            <span className="text-xs text-muted-foreground">{item.category}</span>
          </div>
        </div>
        <StatusBadge status={item.isMatched ? "matched" : item.type} />
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {item.matchConfidence && (
          <div className="absolute bottom-3 right-3 bg-matched text-matched-foreground px-2 py-1 rounded-md text-xs font-bold">
            {item.matchConfidence}% Match
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-foreground text-lg leading-tight">
          {item.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{item.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{item.date}</span>
          </div>
        </div>

        {/* Action hint */}
        <div className="flex items-center gap-1.5 text-xs text-accent pt-1">
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Tap for details</span>
        </div>
      </div>
    </motion.div>
  );
}
