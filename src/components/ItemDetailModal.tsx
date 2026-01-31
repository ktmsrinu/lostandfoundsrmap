import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { StatusBadge } from "@/components/ui/status-badge";
import { ItemData } from "@/components/ItemCard";

interface ItemDetailModalProps {
  item: ItemData | null;
  isOpen: boolean;
  onClose: () => void;
  matchedItem?: ItemData | null;
}

export function ItemDetailModal({ item, isOpen, onClose, matchedItem }: ItemDetailModalProps) {
  if (!item) return null;

  const handleContactClick = (email: string) => {
    window.location.href = `mailto:${email}?subject=Regarding your ${item.type} item: ${item.title}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card rounded-t-2xl sm:rounded-2xl shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <AvatarInitials name={item.userName} size="md" />
                <div>
                  <p className="font-semibold text-foreground">{item.userName}</p>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={item.isMatched ? "matched" : item.type} />
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Image */}
            <div className="aspect-square bg-muted">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <h2 className="text-xl font-bold text-foreground">{item.title}</h2>

              {item.matchConfidence && (
                <div className="p-3 rounded-lg bg-matched/10 border border-matched/30">
                  <p className="text-sm font-semibold text-matched">
                    🎯 {item.matchConfidence}% AI Match Confidence
                  </p>
                </div>
              )}

              <p className="text-muted-foreground">{item.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span>{item.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span>{item.date}</span>
                </div>
              </div>

              {/* Contact Section */}
              <div className="pt-4 border-t border-border space-y-3">
                <h3 className="font-semibold text-foreground">Contact</h3>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-accent" />
                  <span className="text-sm text-muted-foreground">{item.userEmail}</span>
                </div>
                <Button
                  onClick={() => handleContactClick(item.userEmail)}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact via Email
                </Button>
              </div>

              {/* Matched Item (if exists) */}
              {matchedItem && (
                <div className="pt-4 border-t border-border space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <span className="text-matched">✨</span>
                    Matching {matchedItem.type === "lost" ? "Lost" : "Found"} Report
                  </h3>
                  <div className="p-3 rounded-lg bg-secondary space-y-3">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={matchedItem.imageUrl}
                          alt={matchedItem.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {matchedItem.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by {matchedItem.userName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {matchedItem.location} • {matchedItem.date}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContactClick(matchedItem.userEmail)}
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Contact {matchedItem.userName}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
