import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Programme and event pick-lists for staff forms (includes archived items so old records still show a name). */
export const programmeOptionsQuery = queryOptions({
  queryKey: ["admin", "programmes", "options"],
  queryFn: async () => {
    const { data, error } = await supabase.from("programmes").select("id,title").order("sort_order");
    if (error) throw error;
    return data.map((p) => ({ value: p.id, label: p.title }));
  },
});

export const eventOptionsQuery = queryOptions({
  queryKey: ["admin", "events", "options"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("events")
      .select("id,title,start_at,capacity,is_archived")
      .order("start_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});
