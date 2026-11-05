import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export const ROLES: { value: AppRole; label: string; summary: string }[] = [
  { value: "super_admin", label: "Super Admin", summary: "Full platform access. Manages users, settings, content and permissions." },
  { value: "foundation_admin", label: "Foundation Administrator", summary: "Manages most Foundation operations and views organisational reports." },
  { value: "programme_manager", label: "Programme Manager", summary: "Manages programmes, applications, projects and events." },
  { value: "finance_officer", label: "Finance Officer", summary: "Manages donations, expenses and financial reports." },
  { value: "volunteer_coordinator", label: "Volunteer Coordinator", summary: "Manages membership and volunteer applications." },
  { value: "editor", label: "Editor / Communications", summary: "Manages news, articles and announcements." },
];

export const roleLabel = (r: string) => ROLES.find((x) => x.value === r)?.label ?? r;

const ADMINS: AppRole[] = ["super_admin", "foundation_admin"];

/**
 * Which roles can open each admin section. Mirrors the database security rules,
 * which are the real enforcement — this map only decides what the menu shows.
 */
export const MODULE_ACCESS = {
  dashboard: [...ADMINS, "programme_manager", "finance_officer", "volunteer_coordinator", "editor"],
  members: [...ADMINS, "volunteer_coordinator"],
  volunteers: [...ADMINS, "volunteer_coordinator"],
  rewards: [...ADMINS, "volunteer_coordinator", "finance_officer"],
  programmes: [...ADMINS, "programme_manager"],
  applications: [...ADMINS, "programme_manager"],
  projects: [...ADMINS, "programme_manager"],
  events: [...ADMINS, "programme_manager"],
  registrations: [...ADMINS, "programme_manager"],
  donations: [...ADMINS, "finance_officer"],
  expenses: [...ADMINS, "finance_officer"],
  news: [...ADMINS, "editor"],
  feedback: ADMINS,
  enquiries: ADMINS,
  reports: [...ADMINS, "finance_officer"],
  staff: ADMINS,
  roles: ADMINS,
  audit: ADMINS,
  settings: ADMINS,
} satisfies Record<string, AppRole[]>;

export type AdminModule = keyof typeof MODULE_ACCESS;

export function canAccess(module: AdminModule, roles: readonly AppRole[]): boolean {
  const allowed: readonly AppRole[] = MODULE_ACCESS[module];
  return roles.some((r) => allowed.includes(r));
}

/** Only a Super Admin may create accounts, change roles or deactivate staff. */
export function canManageStaff(roles: readonly AppRole[]): boolean {
  return roles.includes("super_admin");
}
