import {
  BarChart3,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  FileText,
  FolderKanban,
  HandCoins,
  HandHeart,
  History,
  Inbox,
  LayoutDashboard,
  Megaphone,
  MessageSquareWarning,
  Receipt,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  Award,
  type LucideIcon,
} from "lucide-react";
import type { AdminModule } from "./roles";

export type AdminNavItem = {
  to:
    | "/admin"
    | "/admin/members"
    | "/admin/volunteers"
    | "/admin/rewards"
    | "/admin/programmes"
    | "/admin/applications"
    | "/admin/projects"
    | "/admin/events"
    | "/admin/registrations"
    | "/admin/donations"
    | "/admin/expenses"
    | "/admin/news"
    | "/admin/feedback"
    | "/admin/enquiries"
    | "/admin/reports"
    | "/admin/staff"
    | "/admin/roles"
    | "/admin/audit"
    | "/admin/settings";
  label: string;
  icon: LucideIcon;
  module: AdminModule;
};

export const ADMIN_NAV: { group: string; items: AdminNavItem[] }[] = [
  { group: "Overview", items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" }] },
  {
    group: "People",
    items: [
      { to: "/admin/members", label: "Members", icon: Users, module: "members" },
      { to: "/admin/volunteers", label: "Volunteers", icon: HandHeart, module: "volunteers" },
      { to: "/admin/rewards", label: "Referral rewards", icon: Award, module: "rewards" },
    ],
  },
  {
    group: "Programmes",
    items: [
      { to: "/admin/programmes", label: "Programmes", icon: ClipboardList, module: "programmes" },
      { to: "/admin/applications", label: "Applications", icon: FileText, module: "applications" },
      { to: "/admin/projects", label: "Projects", icon: FolderKanban, module: "projects" },
      { to: "/admin/events", label: "Events", icon: CalendarDays, module: "events" },
      { to: "/admin/registrations", label: "Registrations & attendance", icon: CalendarCheck, module: "registrations" },
    ],
  },
  {
    group: "Finance",
    items: [
      { to: "/admin/donations", label: "Donations", icon: HandCoins, module: "donations" },
      { to: "/admin/expenses", label: "Expenses", icon: Receipt, module: "expenses" },
    ],
  },
  {
    group: "Communications",
    items: [
      { to: "/admin/news", label: "News & announcements", icon: Megaphone, module: "news" },
      { to: "/admin/feedback", label: "Community feedback", icon: MessageSquareWarning, module: "feedback" },
      { to: "/admin/enquiries", label: "Contact enquiries", icon: Inbox, module: "enquiries" },
    ],
  },
  {
    group: "Administration",
    items: [
      { to: "/admin/reports", label: "Reports", icon: BarChart3, module: "reports" },
      { to: "/admin/staff", label: "Staff accounts", icon: UserCog, module: "staff" },
      { to: "/admin/roles", label: "Roles & permissions", icon: ShieldCheck, module: "roles" },
      { to: "/admin/audit", label: "Audit log", icon: History, module: "audit" },
      { to: "/admin/settings", label: "Organisation settings", icon: Settings, module: "settings" },
    ],
  },
];
