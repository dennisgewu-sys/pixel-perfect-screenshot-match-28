/** Every this many successful referrals the volunteer moves up one badge level. */
export const REFERRALS_PER_LEVEL = 4;
/** Reward paid (offline, by Finance) for every new badge level, in GHS. */
export const REWARD_PER_LEVEL_GHS = 100;

const BADGES = ["Community Mobiliser", "Community Champion", "Community Ambassador", "Community Hero"];

export function badgeName(level: number): string {
  if (level <= 0) return "No badge yet";
  if (level <= BADGES.length) return `Level ${level} · ${BADGES[level - 1]}`;
  return `Level ${level} · Community Legend`;
}

export function levelForReferrals(count: number): number {
  return Math.floor(Math.max(0, count) / REFERRALS_PER_LEVEL);
}

export function referralsToNextLevel(count: number): number {
  return REFERRALS_PER_LEVEL - (Math.max(0, count) % REFERRALS_PER_LEVEL);
}

export function totalRewardGhs(level: number): number {
  return Math.max(0, level) * REWARD_PER_LEVEL_GHS;
}

export function makeReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export function referralLink(origin: string, code: string): string {
  return `${origin}/get-involved?ref=${encodeURIComponent(code)}#volunteer`;
}

const KEY = "aaf_ref";
/** Captures ?ref= from the URL (and remembers it for the visit). Browser only. */
export function readReferralCode(): string | null {
  if (typeof window === "undefined") return null;
  const fromUrl = new URLSearchParams(window.location.search).get("ref");
  if (fromUrl && /^[A-Za-z0-9]{6,12}$/.test(fromUrl)) {
    sessionStorage.setItem(KEY, fromUrl.toUpperCase());
    return fromUrl.toUpperCase();
  }
  return sessionStorage.getItem(KEY);
}
