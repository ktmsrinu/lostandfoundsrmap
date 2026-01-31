import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface ItemInput {
  type: "lost" | "found";
  title: string;
  category: string;
  description: string;
  location: string;
  item_date: string;
  item_time?: string;
  image_url: string;
}

export interface Item {
  id: string;
  user_id: string;
  type: "lost" | "found";
  title: string;
  category: string;
  description: string;
  location: string;
  item_date: string;
  item_time: string | null;
  image_url: string;
  status: "active" | "matched" | "resolved";
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
}

export interface Match {
  id: string;
  lost_item_id: string;
  found_item_id: string;
  confidence_score: number;
  status: string;
  created_at: string;
  lost_item?: Item | null;
  found_item?: Item | null;
}

export function useItems(filter?: "lost" | "found" | "all") {
  return useQuery({
    queryKey: ["items", filter],
    queryFn: async () => {
      // First get items
      let query = supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter && filter !== "all") {
        query = query.eq("type", filter);
      }

      const { data: itemsData, error: itemsError } = await query;

      if (itemsError) throw itemsError;
      if (!itemsData) return [];

      // Get unique user IDs
      const userIds = [...new Set(itemsData.map((item) => item.user_id))];

      // Fetch profiles for these users
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);

      const profilesMap = new Map(
        (profilesData || []).map((p) => [p.user_id, { full_name: p.full_name, email: p.email }])
      );

      // Transform data to match our Item interface
      return itemsData.map((item) => ({
        ...item,
        type: item.type as "lost" | "found",
        status: item.status as "active" | "matched" | "resolved",
        profiles: profilesMap.get(item.user_id) || null,
      })) as Item[];
    },
  });
}

export function useMyItems() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-items", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data || []).map((item) => ({
        ...item,
        type: item.type as "lost" | "found",
        status: item.status as "active" | "matched" | "resolved",
      })) as Item[];
    },
    enabled: !!user,
  });
}

export function useMatches() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["matches", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data || []) as Match[];
    },
    enabled: !!user,
  });
}

export function useNotifications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (item: ItemInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("items")
        .insert({
          type: item.type,
          title: item.title,
          category: item.category as "Wallet" | "Phone" | "ID Card" | "Bag" | "Keys" | "Electronics" | "Books" | "Clothing" | "Accessories" | "Other",
          description: item.description,
          location: item.location,
          item_date: item.item_date,
          item_time: item.item_time || null,
          image_url: item.image_url,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger AI matching in the background
      try {
        await supabase.functions.invoke("match-items", {
          body: { itemId: data.id, itemType: item.type },
        });
      } catch (matchError) {
        console.error("Error triggering match:", matchError);
        // Don't fail the whole operation if matching fails
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["my-items"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Item posted successfully! Checking for matches...");
    },
    onError: (error) => {
      toast.error("Failed to post item: " + error.message);
    },
  });
}

export function useUploadImage() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("item-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("item-images")
        .getPublicUrl(fileName);

      return publicUrl;
    },
  });
}
