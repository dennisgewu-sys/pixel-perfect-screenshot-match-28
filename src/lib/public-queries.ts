import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const programmesQuery = queryOptions({
  queryKey: ["public", "programmes"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("programmes")
      .select("id,title,slug,summary,description,category,status,registration_status,is_flagship,sort_order")
      .eq("is_archived", false)
      .order("sort_order");
    if (error) throw error;
    return data;
  },
});

export const projectsQuery = queryOptions({
  queryKey: ["public", "projects"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("id,title,description,location,category,image_url,start_date,completion_date,status")
      .eq("is_archived", false)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const upcomingEventsQuery = queryOptions({
  queryKey: ["public", "events", "upcoming"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("events")
      .select("id,title,description,location,start_at,end_at,registration_status,status,programme_id")
      .eq("is_archived", false)
      .gte("start_at", new Date().toISOString())
      .order("start_at");
    if (error) throw error;
    return data;
  },
});

export const newsListQuery = (limit?: number) =>
  queryOptions({
    queryKey: ["public", "news", limit ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("news_posts")
        .select("id,title,slug,excerpt,featured_image_url,category,author_name,published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

export const newsPostQuery = (slug: string) =>
  queryOptions({
    queryKey: ["public", "news", "post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_posts")
        .select("id,title,slug,excerpt,content,featured_image_url,category,author_name,published_at")
        .eq("status", "published")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
