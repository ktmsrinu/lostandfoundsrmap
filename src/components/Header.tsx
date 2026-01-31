import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Menu, X, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { cn } from "@/lib/utils";

interface HeaderProps {
  userName?: string;
  hasNotifications?: boolean;
  onMenuClick?: () => void;
  onLogout?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function Header({
  userName = "User",
  hasNotifications = false,
  onMenuClick,
  onLogout,
  isDarkMode = false,
  onToggleDarkMode,
}: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border safe-top">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold">
            <span className="text-foreground">SRMAP</span>{" "}
            <span className="gradient-text">Lost & Found</span>
          </h1>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search items..."
              className="pl-10 bg-secondary border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2 text-foreground"
          >
            {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDarkMode}
            className="text-foreground"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Notifications */}
          <button className={cn("relative p-2 text-foreground", hasNotifications && "pulse-dot")}>
            <Bell className="w-5 h-5" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2 ml-2">
            <AvatarInitials name={userName} size="sm" withGradientRing />
            <span className="hidden sm:inline text-sm font-medium text-foreground">
              {userName.split(" ")[0]}
            </span>
          </div>

          {/* Logout */}
          <Button variant="ghost" size="icon" onClick={onLogout} className="text-muted-foreground">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Search Dropdown */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border overflow-hidden"
          >
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search items..."
                  className="pl-10 bg-secondary border-0"
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
