import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/Sidebar";
import { ItemCard, ItemData } from "@/components/ItemCard";
import { FilterTabs, FilterTab } from "@/components/FilterTabs";
import { PostItemModal, PostItemData } from "@/components/PostItemModal";
import { ItemDetailModal } from "@/components/ItemDetailModal";
import { EmptyState } from "@/components/EmptyState";
import { AuthPage } from "@/components/AuthPage";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useItems, useMatches, useCreateItem, useUploadImage, Item } from "@/hooks/useItems";
import { Loader2 } from "lucide-react";

type AppNavItem = "home" | "search" | "add" | "matches" | "profile";

// Transform database item to display format
const transformItem = (item: Item): ItemData => ({
  id: item.id,
  type: item.type,
  title: item.title,
  category: item.category,
  description: item.description,
  location: item.location,
  date: new Date(item.item_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }),
  imageUrl: item.image_url,
  userName: item.profiles?.full_name || "Unknown User",
  userEmail: item.profiles?.email || "",
  isMatched: item.status === "matched",
});

function MainApp() {
  const { profile, signOut } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activeNav, setActiveNav] = useState<AppNavItem>("home");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);

  const filterType = activeFilter === "all" || activeFilter === "matched" ? "all" : activeFilter;
  const { data: items = [], isLoading: itemsLoading } = useItems(filterType as "lost" | "found" | "all");
  const { data: matches = [] } = useMatches();
  const createItem = useCreateItem();
  const uploadImage = useUploadImage();

  // Transform items for display
  const displayItems = items
    .map(transformItem)
    .filter((item) => {
      if (activeFilter === "matched") {
        return item.isMatched;
      }
      return true;
    });

  const counts = {
    all: items.length,
    lost: items.filter((i) => i.type === "lost").length,
    found: items.filter((i) => i.type === "found").length,
    matched: items.filter((i) => i.status === "matched").length,
  };

  const handleNavigation = (item: AppNavItem) => {
    if (item === "add") {
      setShowPostModal(true);
    } else {
      setActiveNav(item);
    }
  };

  const handleSidebarNavigation = (item: string) => {
    if (item === "add") {
      setShowPostModal(true);
    } else if (item !== "admin") {
      setActiveNav(item as AppNavItem);
    }
  };

  const handlePostItem = async (data: PostItemData) => {
    let imageUrl = "/placeholder.svg";

    if (data.image) {
      try {
        imageUrl = await uploadImage.mutateAsync(data.image);
      } catch (error) {
        console.error("Failed to upload image:", error);
      }
    }

    await createItem.mutateAsync({
      type: data.type,
      title: data.title,
      category: data.category,
      description: data.description,
      location: data.location,
      item_date: data.date,
      item_time: data.time || undefined,
      image_url: imageUrl,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64">
        <Sidebar
          activeItem={activeNav}
          onNavigate={handleSidebarNavigation}
          hasNotifications={matches.length > 0}
          isAdmin={profile?.is_admin}
          isOpen={true}
        />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <Sidebar
            activeItem={activeNav}
            onNavigate={handleSidebarNavigation}
            hasNotifications={matches.length > 0}
            isAdmin={profile?.is_admin}
            isOpen={showSidebar}
            onClose={() => setShowSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:ml-64 pb-20 lg:pb-0">
        <Header
          userName={profile?.full_name || "User"}
          hasNotifications={matches.length > 0}
          onMenuClick={() => setShowSidebar(true)}
          onLogout={signOut}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        <main className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Filter Tabs */}
          <div className="mb-6">
            <FilterTabs
              activeTab={activeFilter}
              onTabChange={setActiveFilter}
              counts={counts}
            />
          </div>

          {/* Feed */}
          {itemsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
          ) : displayItems.length === 0 ? (
            <EmptyState
              type={activeFilter === "matched" ? "no-matches" : "no-items"}
              onAction={() => setShowPostModal(true)}
            />
          ) : (
            <motion.div layout className="space-y-4">
              {displayItems.map((item, index) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </motion.div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav
        activeItem={activeNav}
        onNavigate={handleNavigation}
        hasNotifications={matches.length > 0}
      />

      {/* Post Item Modal */}
      <PostItemModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={handlePostItem}
      />

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}

export default function Index() {
  const { user, isLoading, signIn, signUp } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    const { error } = await signIn(email, password);
    if (error) {
      setAuthError(error.message);
    }
    setAuthLoading(false);
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    setAuthLoading(true);
    setAuthError(null);
    const { error } = await signUp(email, password, name);
    if (error) {
      setAuthError(error.message);
    }
    setAuthLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <AuthPage
        onLogin={handleLogin}
        onSignup={handleSignup}
        error={authError}
        isLoading={authLoading}
      />
    );
  }

  return <MainApp />;
}
