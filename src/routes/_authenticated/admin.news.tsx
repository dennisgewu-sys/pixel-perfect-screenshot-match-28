import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager, type ResourceConfig } from "@/components/admin/ResourceManager";
import { RequireModule } from "@/components/admin/ui";
import { formatDate, slugify } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/news")({ component: Page });

const STATUSES = ["draft", "published", "archived"] as const;
const CATEGORIES = ["news", "announcement", "press_release", "event_recap", "opinion"] as const;

const config: ResourceConfig = {
  table: "news_posts",
  title: "News & announcements",
  singular: "Article",
  description: "Only articles set to Published appear on the website. Drafts stay private to staff.",
  columns: [
    { key: "title", label: "Title", render: (r) => <span className="font-semibold text-primary">{r["title"]}</span> },
    { key: "category", label: "Category", className: "hidden md:table-cell" },
    { key: "status", label: "Status" },
    { key: "published_at", label: "Published", render: (r) => formatDate(r["published_at"]), className: "hidden md:table-cell" },
  ],
  fields: [
    { name: "title", label: "Headline", required: true, full: true },
    { name: "slug", label: "Web address (slug)", hint: "Leave blank to create from the headline." },
    { name: "category", label: "Category", type: "select", options: CATEGORIES, required: true },
    { name: "status", label: "Status", type: "select", options: STATUSES, required: true },
    { name: "author_name", label: "Author" },
    { name: "featured_image_url", label: "Featured image link", type: "url", full: true },
    { name: "excerpt", label: "Short summary", type: "textarea", rows: 2 },
    { name: "content", label: "Article text", type: "textarea", rows: 10, hint: "Leave a blank line between paragraphs." },
  ],
  searchKeys: ["title", "excerpt", "author_name", "category"],
  statusField: "status",
  statusOptions: STATUSES,
  archive: { type: "status", value: "archived", restoreTo: "draft" },
  canCreate: true,
  defaults: { status: "draft", category: "news" },
  quickStatuses: [
    { value: "published", label: "Publish" },
    { value: "draft", label: "Unpublish (draft)" },
  ],
  beforeSave: (v) => ({ ...v, slug: slugify(String(v["slug"] || v["title"] || "")), content: v["content"] ?? "" }),
  exportName: "news",
};

function Page() {
  return (
    <RequireModule module="news">
      <ResourceManager config={config} />
    </RequireModule>
  );
}
