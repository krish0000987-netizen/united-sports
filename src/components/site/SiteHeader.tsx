import { Link } from "@tanstack/react-router";
import { Menu, X, Phone } from "lucide-react";
import { useEffect, useState } from "react";

import logoCircle from "@/assets/logo-circle.png";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getNavigation, FALLBACK_NAV } from "@/lib/cms/navigation";
import { getSiteSettings } from "@/lib/cms/settings";

const fallbackNav = FALLBACK_NAV;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: navData } = useQuery({
    queryKey: ["nav-header"],
    queryFn: () => getNavigation("header"),
  });
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSiteSettings,
  });
  const nav =
    navData ??
    fallbackNav.map((n) => ({
      label: n.label,
      url: n.to,
      open_in_new_tab: false,
    }));
  const phone = (settings?.phone as string) ?? "+91 85278 77688";
  const phoneHref = `tel:${phone.replace(/\s/g, "")}`;
  const ctaLabel = (settings?.header_cta_label as string) ?? "Get Involved";
  const ctaUrl = (settings?.header_cta_url as string) ?? "/get-involved";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-navy-deep/85 backdrop-blur-xl border-b border-border py-2"
          : "bg-transparent py-4",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5">
        <Link
          to="/"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <img
            src={logoCircle}
            alt="UnitedAthletes for India Foundation emblem"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-contain ring-1 ring-primary/40"
          />
          <span className="leading-none">
            <span className="block font-display text-lg tracking-wide">
              United<span className="text-primary">Athletes</span>
            </span>
            <span className="block text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
              for India Foundation
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.url}
              to={item.url}
              activeOptions={{ exact: item.url === "/" }}
              activeProps={{ className: "text-primary" }}
              className="relative text-sm font-semibold uppercase tracking-[0.14em] text-foreground/80 transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={phoneHref}
            className="flex items-center gap-2 text-sm font-semibold text-foreground/80 transition-colors hover:text-primary"
          >
            <Phone className="h-4 w-4 text-primary" />
            {phone}
          </a>
          <Link
            to={ctaUrl}
            className="rounded-sm bg-primary px-5 py-2.5 text-sm font-extrabold uppercase tracking-[0.12em] text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
          >
            {ctaLabel}
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="rounded-sm border border-border p-2 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-navy-deep/95 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
            {nav.map((item) => (
              <Link
                key={item.url}
                to={item.url}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: item.url === "/" }}
                activeProps={{ className: "text-primary" }}
                className="border-b border-border/60 py-3 text-sm font-semibold uppercase tracking-[0.16em]"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={phoneHref}
              className="py-3 text-sm font-semibold uppercase tracking-[0.16em] text-primary"
            >
              {phone}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
