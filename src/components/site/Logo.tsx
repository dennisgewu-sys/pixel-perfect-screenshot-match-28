import { Link } from "@tanstack/react-router";
import emblem from "@/assets/arise-emblem.png.asset.json";
import fullLogo from "@/assets/arise-ashaiman-logo.png.asset.json";
import { cn } from "@/lib/utils";

export const LOGO_URL = fullLogo.url;
export const EMBLEM_URL = emblem.url;

/** Brand lockup: official emblem + wordmark. Swap the asset files to update everywhere. */
export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <Link to="/" className={cn("group flex items-center gap-2.5", className)} aria-label="Arise Ashaiman Foundation — home">
      <img src={emblem.url} alt="" width={44} height={44} className="h-11 w-11 shrink-0 object-contain" />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[1.05rem] font-extrabold tracking-tight",
            tone === "dark" ? "text-primary" : "text-on-dark",
          )}
        >
          ARISE ASHAIMAN
        </span>
        <span
          className={cn(
            "mt-1 text-[0.62rem] font-semibold tracking-[0.32em]",
            tone === "dark" ? "text-teal" : "text-gold",
          )}
        >
          FOUNDATION
        </span>
      </span>
    </Link>
  );
}
