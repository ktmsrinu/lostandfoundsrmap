import { motion } from "framer-motion";
import { Home, Search, PlusCircle, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = "home" | "search" | "add" | "matches" | "profile";

interface BottomNavProps {
  activeItem: NavItem;
  onNavigate: (item: NavItem) => void;
  hasNotifications?: boolean;
}

const navItems: { id: NavItem; icon: typeof Home; label: string }[] = [
  { id: "home", icon: Home, label: "Home" },
  { id: "search", icon: Search, label: "Search" },
  { id: "add", icon: PlusCircle, label: "Post" },
  { id: "matches", icon: Bell, label: "Matches" },
  { id: "profile", icon: User, label: "Profile" },
];

export function BottomNav({ activeItem, onNavigate, hasNotifications = false }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-bottom lg:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          const Icon = item.icon;
          const showDot = item.id === "matches" && hasNotifications;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors",
                isActive ? "text-accent" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-accent rounded-b-full"
                />
              )}
              <div className={cn("relative", showDot && "pulse-dot")}>
                <Icon className={cn("w-6 h-6", item.id === "add" && "w-7 h-7")} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
