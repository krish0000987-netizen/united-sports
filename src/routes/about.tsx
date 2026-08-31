import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";

import aboutAthlete from "@/assets/about-athlete.jpg";
import support from "@/assets/support.jpg";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | UnitedAthletes for India Foundation" },
      {
        name: "description",
        content:
          "UnitedAthletes for India Foundation is an athlete-focused organisation building a stronger sporting ecosystem across India.",
      },
      {
        property: "og:title",
        content: "About UnitedAthletes for India Foundation",
      },
      {
        property: "og:description",
        content:
          "Our mission, vision and values — creating opportunity, access and support for India's sporting talent.",
      },
    ],
  }),
  component: About,
});

const values = [
  {
    title: "Athlete First",
    text: "Every initiative begins with the needs, aspirations and development of athletes.",
  },
  {
    title: "Opportunity",
    text: "We believe talent deserves access to opportunities regardless of background.",
  },
  {
    title: "Excellence",
    text: "We encourage athletes to continuously improve and pursue higher levels of performance.",
  },
  {
    title: "Accessibility",
    text: "We work toward making sports facilities, equipment and resources more accessible.",
  },
  {
    title: "Community",
    text: "Athletes become stronger when supported by a connected sporting community.",
  },
];

const provide = [
  "Sports facilities and infrastructure",
  "Sports equipment",
  "Athlete development opportunities",
  "Training and support resources",
  "Platforms for athlete engagement",
  "Sports community initiatives",
  "Opportunities to pursue sporting goals",
];

function About() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title={
          <>
            Who <span className="text-gold-gradient">We Are</span>
          </>
        }
        subtitle="An athlete-focused organisation committed to creating a stronger ecosystem for athletes across India."
        image={support}
        alt="A coach and a young athlete clasping hands at sunset"
      />

      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <Reveal>
            <h2 className="text-4xl sm:text-5xl">
              Talent can come from anywhere
            </h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              UnitedAthletes for India Foundation is an athlete-focused
              organisation committed to creating a stronger ecosystem for
              athletes across India.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We believe that talent can come from anywhere, but access to
              opportunities, facilities, equipment and support can determine how
              far that talent goes. UnitedAthletes works to provide athletes
              with the resources and opportunities they need to pursue
              excellence in sport.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <img
              src={aboutAthlete}
              alt="Indian badminton player mid-smash under a spotlight"
              width={1200}
              height={1504}
              loading="lazy"
              className="w-full rounded-sm object-cover shadow-[var(--shadow-lift)]"
            />
          </Reveal>
        </div>
      </section>

      <section className="border-y border-border bg-navy">
        <div className="mx-auto grid max-w-7xl gap-px bg-border px-0 md:grid-cols-2">
          {[
            {
              label: "Our Mission",
              text: "To empower athletes by creating opportunities, providing resources, and building an ecosystem where sporting talent can thrive.",
            },
            {
              label: "Our Vision",
              text: "A stronger India where every talented athlete has the opportunity, facilities, equipment and support needed to achieve their goals.",
            },
          ].map((b, i) => (
            <Reveal key={b.label} delay={i * 120}>
              <div className="h-full bg-navy-deep px-8 py-16 sm:px-14">
                <p className="eyebrow">{b.label}</p>
                <div className="rule-gold mt-4" />
                <p className="mt-8 font-display text-2xl leading-[1.2] sm:text-3xl">
                  {b.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <Reveal>
          <p className="eyebrow">Our Values</p>
          <div className="rule-gold mt-4" />
          <h2 className="mt-6 text-4xl sm:text-5xl">What we stand on</h2>
        </Reveal>
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 90}>
              <article className="surface-card h-full rounded-sm p-8 transition-transform duration-500 hover:-translate-y-2">
                <span className="font-display text-sm tracking-[0.3em] text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-2xl">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {v.text}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-navy">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">What We Provide</p>
            <div className="rule-gold mt-4" />
            <h2 className="mt-6 text-4xl sm:text-5xl">
              Support that is practical
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
              Real resources, delivered where they make the biggest difference
              to an athlete&apos;s week.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <ul className="divide-y divide-border border-y border-border">
              {provide.map((p) => (
                <li key={p} className="flex items-center gap-4 py-5">
                  <Check className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-lg">{p}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-28 text-center">
        <Reveal>
          <p className="eyebrow">Our Commitment</p>
          <h2 className="mt-6 text-4xl sm:text-5xl">
            We don&apos;t just support athletes.{" "}
            <span className="text-gold-gradient">
              We create opportunities for them to move forward.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-muted-foreground">
            UnitedAthletes is committed to building an ecosystem where athletes
            can focus on their passion, develop their abilities and move closer
            to achieving their dreams.
          </p>
          <Link
            to="/get-involved"
            className="group mt-10 inline-flex items-center gap-3 rounded-sm bg-primary px-8 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-primary-foreground transition-transform duration-300 hover:-translate-y-1"
          >
            Get Involved
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
