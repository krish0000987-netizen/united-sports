import { Link } from "@tanstack/react-router";
import { MapPin, Phone } from "lucide-react";

import logo from "@/assets/ua-logo.jpeg.asset.json";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-navy-deep">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-primary/40">
              <img
                src={logo.url}
                alt="UnitedAthletes for India Foundation emblem"
                width={56}
                height={56}
                loading="lazy"
                className="h-full w-full scale-[1.28] object-cover object-[center_3%]"
              />
            </div>
            <span className="font-display text-2xl">
              United<span className="text-primary">Athletes</span>
            </span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            UnitedAthletes for India Foundation — an athlete-focused organisation
            building a stronger sporting ecosystem across India.
          </p>
          <p className="mt-5 font-display text-lg text-primary">
            Empowering Athletes. Enabling Dreams.
          </p>
        </div>

        <div>
          <h3 className="text-sm tracking-[0.2em]">Explore</h3>
          <div className="rule-gold mt-4" />
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            {[
              { to: "/", label: "Home" },
              { to: "/about", label: "About Us" },
              { to: "/programmes", label: "Programmes" },
              { to: "/get-involved", label: "Get Involved" },
              { to: "/contact", label: "Contact" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm tracking-[0.2em]">Contact</h3>
          <div className="rule-gold mt-4" />
          <ul className="mt-5 space-y-4 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <a href="tel:+918527877688" className="hover:text-primary">
                +91 85278 77688
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                384A, Nyay Khand 3, Indirapuram, Ghaziabad, Uttar Pradesh – 201014
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} UnitedAthletes for India Foundation. A
            Section 8 Company.
          </span>
          <span className="uppercase tracking-[0.24em]">Made for India&apos;s athletes</span>
        </div>
      </div>
    </footer>
  );
}
