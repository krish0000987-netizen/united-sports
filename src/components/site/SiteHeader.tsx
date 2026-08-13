import { Link } from "@tanstack/react-router";
import { Menu, X, Phone } from "lucide-react";
import { useEffect, useState } from "react";

import logo from "@/assets/ua-logo.jpeg.asset.json";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/programmes", label: "Programmes" },
  { to: "/get-involved", label: "Get Involved" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-primary/40">
            <img
              src={logo.url}
              alt="UnitedAthletes for India Foundation emblem"
              width={44}
              height={44}
              className="h-full w-full scale-[1.28] object-cover object-[center_3%]"
            />
          </div>
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
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="relative text-sm font-semibold uppercase tracking-[0.14em] text-foreground/80 transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="tel:+918527877688"
            className="flex items-center gap-2 text-sm font-semibold text-foreground/80 transition-colors hover:text-primary"
          >
            <Phone className="h-4 w-4 text-primary" />
            +91 85278 77688
          </a>
          <Link
            to="/get-involved"
            className="rounded-sm bg-primary px-5 py-2.5 text-sm font-extrabold uppercase tracking-[0.12em] text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
          >
            Get Involved
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
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-primary" }}
                className="border-b border-border/60 py-3 text-sm font-semibold uppercase tracking-[0.16em]"
              >
                {item.label}
              </Link>
            ))}
            <a
              href="tel:+918527877688"
              className="py-3 text-sm font-semibold uppercase tracking-[0.16em] text-primary"
            >
              +91 85278 77688
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
