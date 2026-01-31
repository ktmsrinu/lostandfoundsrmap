import { motion } from "framer-motion";
import { Package, Search, Bell, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  type: "no-items" | "no-results" | "no-matches";
  onAction?: () => void;
  className?: string;
}

const stateConfig = {
  "no-items": {
    icon: Package,
    title: "No items yet",
    description: "Be the first to post a lost or found item.",
    actionLabel: "Post an Item",
  },
  "no-results": {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search or filters.",
    actionLabel: "Clear Filters",
  },
  "no-matches": {
    icon: Bell,
    title: "No matches yet",
    description: "When AI finds a potential match, it will appear here.",
    actionLabel: null,
  },
};

export function EmptyState({ type, onAction, className }: EmptyStateProps) {
  const config = stateConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <div className="p-4 rounded-full bg-secondary mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{config.title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">{config.description}</p>
      {config.actionLabel && onAction && (
        <Button onClick={onAction} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="w-4 h-4 mr-2" />
          {config.actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
