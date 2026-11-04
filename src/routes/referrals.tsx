import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/site/blocks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { badgeName, referralsToNextLevel, REFERRALS_PER_LEVEL, REWARD_PER_LEVEL_GHS, totalRewardGhs } from "@/lib/referrals";
import dialogue from "@/assets/community-dialogue.jpg";

export const Route = createFileRoute("/referrals")({
  head: () => ({
    meta: [
      { title: "Volunteer Referral Rewards | Arise Ashaiman" },
      { name: "description", content: "Volunteers: check your invite progress, badge level and GHS rewards." },
      { property: "og:title", content: "Volunteer Referral Rewards — Arise Ashaiman Foundation" },
      { property: "og:description", content: "Every 4 people you bring in earns a new badge level and GHS 100. We Dey Together!" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Referrals,
});

type Progress = { first_name: string; referral_count: number; badge_level: number; rewards_earned: number; rewards_paid: number };

function Referrals() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Progress | null | "none">(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    const { data } = await supabase.rpc("get_referral_progress", { _code: code });
    setLoading(false);
    setResult(data && data.length ? (data[0] as Progress) : "none");
  }

  return (
    <>
      <PageHero
        eyebrow="Volunteer rewards"
        title="Bring Your People. Earn Your Badge."
        intro={`Every ${REFERRALS_PER_LEVEL} people who join through your invite link move you up a badge level and earn you GHS ${REWARD_PER_LEVEL_GHS.toFixed(2)}.`}
        image={dialogue}
      />
      <section className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_1.4fr]">
        <aside className="space-y-3 text-sm text-muted-foreground">
          <h2 className="text-lg font-bold text-primary">How it works</h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <Link to="/get-involved" hash="volunteer" className="font-semibold text-teal underline">Sign up as a volunteer</Link>{" "}
              to get your personal invite link and code.
            </li>
            <li>Share the link. People can join as members or volunteers.</li>
            <li>At {REFERRALS_PER_LEVEL} sign-ups you reach Level 1 and earn GHS {REWARD_PER_LEVEL_GHS.toFixed(2)}.</li>
            <li>Every further {REFERRALS_PER_LEVEL} sign-ups raise your badge one level and earn another GHS {REWARD_PER_LEVEL_GHS.toFixed(2)}.</li>
            <li>Our team checks each sign-up and pays your rewards in person or by mobile money.</li>
          </ol>
        </aside>
        <div className="rounded-3xl border bg-card p-6 shadow-soft md:p-10">
          <form onSubmit={check} className="flex flex-col gap-3 sm:flex-row">
            <Input
              aria-label="Your referral code"
              placeholder="Enter your referral code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="h-11 font-mono"
              maxLength={12}
            />
            <Button type="submit" className="h-11" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Check progress
            </Button>
          </form>
          {result === "none" && <p className="mt-6 text-sm text-destructive">We couldn't find that code. Please check it and try again.</p>}
          {result && result !== "none" && (
            <div className="mt-8 space-y-4">
              <p className="text-lg">Hi <strong>{result.first_name}</strong>, here's your progress.</p>
              <div className="flex items-center gap-3 rounded-xl border bg-background p-4">
                <Award className="h-8 w-8 text-accent" />
                <div>
                  <p className="font-bold text-primary">{badgeName(result.badge_level)}</p>
                  <p className="text-sm text-muted-foreground">
                    {result.referral_count} sign-up{result.referral_count === 1 ? "" : "s"} so far ·{" "}
                    {referralsToNextLevel(result.referral_count)} more to reach Level {result.badge_level + 1}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border bg-background p-4">
                  <p className="text-xs uppercase text-muted-foreground">Rewards earned</p>
                  <p className="text-2xl font-bold text-primary">GHS {totalRewardGhs(result.rewards_earned).toFixed(2)}</p>
                </div>
                <div className="rounded-xl border bg-background p-4">
                  <p className="text-xs uppercase text-muted-foreground">Rewards paid</p>
                  <p className="text-2xl font-bold text-primary">GHS {totalRewardGhs(result.rewards_paid).toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
