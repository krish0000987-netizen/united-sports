import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Dumbbell,
  HeartHandshake,
  Landmark,
  Users,
} from "lucide-react";

import community from "@/assets/community.jpg";
import equipment from "@/assets/equipment.jpg";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/get-involved")({
  head: () => ({
    meta: [
      { title: "Get Involved | UnitedAthletes for India Foundation" },
      {
        name: "description",
        content:
          "Support athlete development, provide sports equipment, back facilities, partner with us, or support an athlete directly.",
      },
      { property: "og:title", content: "Get Involved | UnitedAthletes" },
      {
        property: "og:description",
        content:
          "Join athletes, supporters and organisations creating better opportunities for India's sporting talent.",
      },
    ],
  }),
  component: GetInvolved,
});

const ways = [
  {
    icon: HeartHandshake,
    title: "Support Athlete Development",
    text: "Help athletes access the resources, opportunities and support they need to continue their sporting journey.",
  },
  {
    icon: Dumbbell,
    title: "Provide Sports Equipment",
    text: "Contribute sports equipment and resources that can directly support athletes and sporting initiatives.",
  },
  {
    icon: Landmark,
    title: "Support Sports Facilities",
    text: "Help create better access to quality sports facilities and training environments.",
  },
  {
    icon: Building2,
    title: "Partner With Us",
    text: "Organisations and businesses can collaborate with UnitedAthletes to support athlete-focused initiatives and sports development programmes.",
  },
  {
    icon: Users,
    title: "Support an Athlete",
    text: "Help talented athletes overcome resource limitations and continue working toward their sporting goals.",
  },
];

function GetInvolved() {
  return (
    <>
      <PageHero
        eyebrow="Get Involved"
        title={
          <>
            Be part of the{" "}
            <span className="text-gold-gradient">UnitedAthletes movement</span>
          </>
        }
        subtitle="Sport has the power to transform lives. UnitedAthletes brings together athletes, supporters, organisations, institutions and sports enthusiasts to create better opportunities for India's sporting talent."
        image={community}
        alt="Athletes standing together in a huddle under golden light"
      />

      <section className="mx-auto max-w-7xl px-5 py-24">
        <Reveal>
          <p className="eyebrow">Ways to Support</p>
          <div className="rule-gold mt-4" />
          <h2 className="mt-6 max-w-2xl text-4xl sm:text-5xl">
            Choose how you want to make a difference
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {ways.map((w, i) => (
            <Reveal key={w.title} delay={i * 90}>
              <article className="surface-card group h-full rounded-sm p-8 transition-transform duration-500 hover:-translate-y-2">
                <w.icon className="h-7 w-7 text-primary transition-transform duration-500 group-hover:-translate-y-1" />
                <h3 className="mt-6 text-2xl">{w.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {w.text}
                </p>
              </article>
            </Reveal>
          ))}
          <Reveal delay={450}>
            <Link
              to="/contact"
              className="flex h-full flex-col justify-between rounded-sm bg-primary p-8 text-primary-foreground transition-transform duration-500 hover:-translate-y-2"
            >
              <span className="font-display text-3xl leading-tight">
                Talk to us today
              </span>
              <ArrowRight className="mt-10 h-7 w-7" />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="grain relative overflow-hidden border-y border-border">
        <img
          src={equipment}
          alt="Premium sports equipment arranged on a dark navy surface"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
        <div className="relative mx-auto max-w-7xl px-5 py-24">
          <Reveal>
            <h2 className="max-w-3xl text-4xl sm:text-5xl">
              Every contribution becomes{" "}
              <span className="text-gold-gradient">
                training time, gear, and a chance to compete.
              </span>
            </h2>
            <Link
              to="/contact"
              className="group mt-10 inline-flex items-center gap-3 rounded-sm bg-primary px-8 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-primary-foreground transition-transform duration-300 hover:-translate-y-1"
            >
              Start a conversation
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
