import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const orgSettingsQuery = queryOptions({
  queryKey: ["organization_settings"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("organization_settings")
      .select("*")
      .order("created_at")
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  staleTime: 5 * 60 * 1000,
});

export function useOrgSettings() {
  return useQuery(orgSettingsQuery);
}

export const SOCIAL_KEYS = [
  { key: "facebook_url", label: "Facebook" },
  { key: "instagram_url", label: "Instagram" },
  { key: "x_url", label: "X (Twitter)" },
  { key: "tiktok_url", label: "TikTok" },
  { key: "youtube_url", label: "YouTube" },
  { key: "whatsapp_url", label: "WhatsApp" },
  { key: "linkedin_url", label: "LinkedIn" },
] as const;
