import { describe, expect, it } from "vitest";
import { canAccess, canManageStaff } from "./roles";

describe("admin role access", () => {
  it("finance officers can open donations and expenses but not members", () => {
    expect(canAccess("donations", ["finance_officer"])).toBe(true);
    expect(canAccess("expenses", ["finance_officer"])).toBe(true);
    expect(canAccess("members", ["finance_officer"])).toBe(false);
  });

  it("volunteer coordinators manage members and volunteers but not finances", () => {
    expect(canAccess("members", ["volunteer_coordinator"])).toBe(true);
    expect(canAccess("volunteers", ["volunteer_coordinator"])).toBe(true);
    expect(canAccess("donations", ["volunteer_coordinator"])).toBe(false);
  });

  it("programme managers manage programmes, projects and events only", () => {
    expect(canAccess("programmes", ["programme_manager"])).toBe(true);
    expect(canAccess("projects", ["programme_manager"])).toBe(true);
    expect(canAccess("events", ["programme_manager"])).toBe(true);
    expect(canAccess("news", ["programme_manager"])).toBe(false);
  });

  it("editors manage news only", () => {
    expect(canAccess("news", ["editor"])).toBe(true);
    expect(canAccess("feedback", ["editor"])).toBe(false);
  });

  it("community feedback is limited to administrators", () => {
    expect(canAccess("feedback", ["foundation_admin"])).toBe(true);
    expect(canAccess("feedback", ["programme_manager"])).toBe(false);
  });

  it("only a Super Admin can manage staff accounts", () => {
    expect(canManageStaff(["super_admin"])).toBe(true);
    expect(canManageStaff(["foundation_admin"])).toBe(false);
  });

  it("a user with no role can open nothing", () => {
    expect(canAccess("dashboard", [])).toBe(false);
  });
});
