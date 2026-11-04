import { describe, expect, it } from "vitest";
import { badgeName, levelForReferrals, referralsToNextLevel, totalRewardGhs } from "./referrals";

describe("volunteer referral rewards", () => {
  it("3 referrals earn no badge yet", () => {
    expect(levelForReferrals(3)).toBe(0);
  });
  it("4 referrals reach level 1 and GHS 100", () => {
    expect(levelForReferrals(4)).toBe(1);
    expect(totalRewardGhs(1)).toBe(100);
  });
  it("another 4 (8 total) upgrade to level 2 and another GHS 100", () => {
    expect(levelForReferrals(8)).toBe(2);
    expect(totalRewardGhs(2)).toBe(200);
  });
  it("after 5 referrals, 3 more are needed for the next level", () => {
    expect(referralsToNextLevel(5)).toBe(3);
  });
  it("level 2 badge is Community Champion", () => {
    expect(badgeName(2)).toContain("Community Champion");
  });
});
