import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type FilterTab = "all" | "lost" | "found" | "matched";

interface FilterTabsProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  counts?: {
    all: number;
    lost: number;
    found: number;
    matched: number;
  };
}

const tabs: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "lost", label: "Lost" },
  { id: "found", label: "Found" },
  { id: "matched", label: "Matches" },
];

export function FilterTabs({ activeTab, onTabChange, counts }: FilterTabsProps) {
  return (
    <div className="flex gap-2 p-1 bg-secondary rounded-xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts?.[tab.id];

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive ? "text-accent-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="filterTabBg"
                className="absolute inset-0 bg-accent rounded-lg"
                transition={{ type: "spring", duration: 0.4 }}
              />
            )}
            <span className="relative flex items-center justify-center gap-1.5">
              {tab.label}
              {count !== undefined && count > 0 && (
                <span
                  className={cn(
                    "text-xs px-1.5 rounded-full",
                    isActive ? "bg-accent-foreground/20" : "bg-muted"
                  )}
                >
                  {count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
