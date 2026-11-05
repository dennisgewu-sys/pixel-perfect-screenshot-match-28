import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const input = z.object({
  code: z.string().trim().regex(/^[A-Za-z0-9]{6,12}$/),
  question: z.string().trim().min(3).max(500),
});

/** Public: the private referral code is the only proof of identity, and only that volunteer's summary is used. */
export const askReferralHelper = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false as const, message: "The referral helper is not set up yet." };
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const db = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
      global: {
        fetch: (i, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(i, { ...init, headers: h });
        },
      },
    });
    const { data: rows, error } = await db.rpc("get_referral_progress", { _code: data.code });
    if (error) {
      console.error(error);
      return { ok: false as const, message: "We couldn't load your progress. Please try again." };
    }
    if (!rows?.length) return { ok: false as const, message: "We couldn't find that referral code." };
    const { answerReferralQuestion } = await import("./referral-assistant.server");
    return answerReferralQuestion(apiKey, rows[0]!, data.question);
  });
