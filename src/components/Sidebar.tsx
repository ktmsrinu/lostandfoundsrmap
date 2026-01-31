import { motion } from "framer-motion";
import { Home, Search, PlusCircle, Bell, User, Settings, Shield, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeItem: string;
  onNavigate: (item: string) => void;
  hasNotifications?: boolean;
  isAdmin?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems: { id: string; icon: typeof Home; label: string; adminOnly?: boolean }[] = [
  { id: "home", icon: Home, label: "Feed" },
  { id: "search", icon: Search, label: "Search" },
  { id: "add", icon: PlusCircle, label: "Post Item" },
  { id: "matches", icon: Bell, label: "Matches" },
  { id: "profile", icon: User, label: "Profile" },
  { id: "admin", icon: Shield, label: "Admin Panel", adminOnly: true },
];

export function Sidebar({
  activeItem,
  onNavigate,
  hasNotifications = false,
  isAdmin = false,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const filteredItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border",
          "flex flex-col py-6 lg:translate-x-0 lg:static lg:z-auto"
        )}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between px-6 mb-8 lg:hidden">
          <h2 className="text-lg font-bold text-sidebar-foreground">Menu</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Logo for Desktop */}
        <div className="hidden lg:block px-6 mb-8">
          <h1 className="text-xl font-bold">
            <span className="text-sidebar-foreground">SRMAP</span>{" "}
            <span className="gradient-text">Lost & Found</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {filteredItems.map((item) => {
            const isActive = activeItem === item.id;
            const Icon = item.icon;
            const showDot = item.id === "matches" && hasNotifications;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose?.();
                }}
                className={cn(
                  "relative flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all",
                  "text-left font-medium",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <div className={cn("relative", showDot && "pulse-dot")}>
                  <Icon className="w-5 h-5" />
                </div>
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebarIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="px-4 pt-4 border-t border-sidebar-border mt-auto">
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
