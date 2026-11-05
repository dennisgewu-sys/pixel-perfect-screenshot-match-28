<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules

- Admin sections are config-driven through `src/components/admin/ResourceManager.tsx`; add new list/edit sections as a config, not a bespoke page. Why: keeps search, filters, archive confirmation and CSV export consistent.
- `src/lib/admin/roles.ts` `MODULE_ACCESS` must mirror the database security rules; the database is the real enforcement and the map only drives menus. Why: permissions must hold server-side.
- Records are archived (flag or `archived` status), never deleted, from the admin UI. Why: the brief requires archive actions and an audit trail.
- Staff accounts are created only by a Super Admin through `src/lib/admin/staff.functions.ts`; public sign-up stays disabled. Why: no public administrator registration.
- Volunteer referral counting, badge levels and reward rows are created only by database triggers on member/volunteer inserts; the UI just reads them. Why: the public cannot be trusted to report its own counts.
