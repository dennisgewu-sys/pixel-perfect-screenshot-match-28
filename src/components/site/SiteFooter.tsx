import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { ORG } from "@/lib/content";
import { SOCIAL_KEYS, useOrgSettings } from "@/hooks/use-org-settings";
import { Logo } from "./Logo";

export function SiteFooter() {
  const { data: settings } = useOrgSettings();
  const socials = SOCIAL_KEYS.filter((s) => settings?.[s.key]);

  return (
    <footer className="bg-navy-gradient text-on-dark">
      <div className="pattern-dots">
        <div className="container-page grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo tone="light" />
            <p className="font-display text-2xl font-bold text-gold">{ORG.motto}</p>
            <p className="text-sm text-on-dark-muted">{ORG.slogan}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {ORG.hashtags.map((h) => (
                <span key={h} className="rounded-full bg-on-dark/10 px-3 py-1 text-xs font-semibold">
                  {h}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gold">Explore</h2>
            <ul className="space-y-2 text-sm text-on-dark-muted">
              {[
                ["/about", "About Us"],
                ["/pillars", "Our Pillars"],
                ["/programmes", "Programmes"],
                ["/projects", "Projects & Impact"],
                ["/leadership", "Leadership"],
                ["/roadmap", "Roadmap"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-on-dark">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gold">Get involved</h2>
            <ul className="space-y-2 text-sm text-on-dark-muted">
              {[
                ["/get-involved", "Become a Member"],
                ["/get-involved", "Volunteer"],
                ["/get-involved", "Partner With Us"],
                ["/feedback", "Community Feedback"],
                ["/news", "News & Updates"],
                ["/privacy", "Privacy Notice"],
              ].map(([to, label]) => (
                <li key={label}>
                  <Link to={to} className="hover:text-on-dark">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gold">Contact</h2>
            <ul className="space-y-3 text-sm text-on-dark-muted">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{settings?.office_address || ORG.location}</span>
              </li>
              <li className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                {settings?.contact_email ? (
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-on-dark">
                    {settings.contact_email}
                  </a>
                ) : (
                  <span>Email to be announced</span>
                )}
              </li>
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                {settings?.contact_phone ? (
                  <a href={`tel:${settings.contact_phone}`} className="hover:text-on-dark">
                    {settings.contact_phone}
                  </a>
                ) : (
                  <span>Phone to be announced</span>
                )}
              </li>
            </ul>
            {socials.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {socials.map((s) => (
                  <a
                    key={s.key}
                    href={settings![s.key]!}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-on-dark/20 px-2.5 py-1 text-xs hover:bg-on-dark/10"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-on-dark/10">
          <div className="container-page flex flex-col gap-2 py-6 text-xs text-on-dark-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {ORG.name}. A non-partisan community development organisation.
            </p>
            <Link to="/auth" className="hover:text-on-dark">
              Staff sign in
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
