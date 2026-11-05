import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, streamText } from "ai";
import { createLovableAiGatewayRunIdFetch } from "./run-id.server";
import { badgeName, referralsToNextLevel, REFERRALS_PER_LEVEL, REWARD_PER_LEVEL_GHS } from "@/lib/referrals";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

export type Progress = {
  first_name: string;
  referral_count: number;
  badge_level: number;
  rewards_earned: number;
  rewards_paid: number;
};

export function buildFacts(p: Progress) {
  const pending = Math.max(0, p.rewards_earned - p.rewards_paid);
  return [
    `Volunteer first name: ${p.first_name}`,
    `Sign-ups through their invite link: ${p.referral_count}`,
    `Current badge: ${badgeName(p.badge_level)}`,
    `Sign-ups still needed for Level ${p.badge_level + 1}: ${referralsToNextLevel(p.referral_count)}`,
    `Rewards earned: ${p.rewards_earned} (GHS ${(p.rewards_earned * REWARD_PER_LEVEL_GHS).toFixed(2)})`,
    `Rewards already paid: ${p.rewards_paid} (GHS ${(p.rewards_paid * REWARD_PER_LEVEL_GHS).toFixed(2)})`,
    `Rewards awaiting staff check and payment: ${pending} (GHS ${(pending * REWARD_PER_LEVEL_GHS).toFixed(2)})`,
  ].join("\n");
}

const INSTRUCTIONS = `You are the friendly referral helper for Arise Ashaiman Foundation (motto "We Dey Together!") in Ashaiman, Ghana.
Explain a volunteer's referral milestone status and reward eligibility using ONLY the facts provided.
Programme rules:
- Every ${REFERRALS_PER_LEVEL} people who sign up as members or volunteers through the volunteer's invite link raise their badge one level.
- Each new level earns GHS ${REWARD_PER_LEVEL_GHS.toFixed(2)}. Badges: Level 1 Community Mobiliser, Level 2 Community Champion, Level 3 Community Ambassador, Level 4 Community Hero, Level 5+ Community Legend.
- A person only counts once per volunteer, and volunteers cannot refer themselves.
- Foundation staff check each sign-up, then pay rewards offline (cash or mobile money). The website never sends money.
Never invent numbers, dates, payment timelines, contact details or rules. Never ask for PINs, passwords or bank details.
If asked something you cannot answer from the facts, say staff can help via the Contact page.
Answer in 2-5 short, warm sentences of plain English. Use GHS for money.`;

export async function answerReferralQuestion(apiKey: string, progress: Progress, question: string) {
  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: GATEWAY,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  let failure: unknown;
  const result = streamText({
    model: provider.responses(MODEL),
    instructions: INSTRUCTIONS,
    messages: [{ role: "user", content: `Facts:\n${buildFacts(progress)}\n\nVolunteer's question: ${question}` }],
    maxRetries: 0,
    onError: ({ error }) => {
      failure = error;
    },
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  try {
    const text = (await result.text).trim();
    if (failure) throw failure;
    if (!text) return { ok: false as const, message: "The helper couldn't answer that. Please try asking differently." };
    return { ok: true as const, answer: text };
  } catch (e) {
    const err = failure ?? e;
    console.error("referral assistant failed", err);
    const status = APICallError.isInstance(err) ? err.statusCode : undefined;
    if (status === 429) return { ok: false as const, message: "The helper is busy right now. Please try again in a minute." };
    if (status === 402 || status === 403)
      return { ok: false as const, message: "The referral helper is unavailable at the moment. Please contact the Foundation." };
    return { ok: false as const, message: "Something went wrong. Please try again later." };
  }
}
