import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  Dumbbell,
  HeartHandshake,
  Landmark,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import community from "@/assets/community.jpg";
import equipment from "@/assets/equipment.jpg";
import facility from "@/assets/facility.jpg";
import hero from "@/assets/hero-athletes.jpg";
import para from "@/assets/para-athlete.jpg";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UnitedAthletes | Empowering Athletes. Enabling Dreams." },
      {
        name: "description",
        content:
          "UnitedAthletes for India Foundation bridges talent and opportunity with sports facilities, equipment, guidance and support for athletes across India.",
      },
      {
        property: "og:title",
        content: "UnitedAthletes | Empowering Athletes. Enabling Dreams.",
      },
      {
        property: "og:description",
        content:
          "An athlete-first foundation creating opportunities, facilities and equipment access for India's sporting talent.",
      },
    ],
  }),
  component: Home,
});

const whatWeDo = [
  { icon: Trophy, title: "Athlete Development", text: "Structured support for athletes moving from potential to performance." },
  { icon: Landmark, title: "Sports Facilities", text: "Access to quality infrastructure and training environments." },
  { icon: Dumbbell, title: "Equipment & Resources", text: "Essential gear and resources for daily training and competition." },
  { icon: Award, title: "Training Opportunities", text: "Development pathways that sharpen skill and raise standards." },
  { icon: HeartHandshake, title: "Athlete Support", text: "Guidance and support systems around every athlete's journey." },
  { icon: Users, title: "Community & Networking", text: "A connected ecosystem of athletes, coaches and organisations." },
  { icon: Sparkles, title: "Emerging Athletes", text: "Opportunities for talent that has been waiting to be seen." },
];

const focus = [
  { n: "01", title: "Athletes", text: "Supporting athletes in their journey from potential to performance.", img: para, alt: "Indian para-athlete racing on a track at sunset" },
  { n: "02", title: "Facilities", text: "Helping athletes access quality sports infrastructure and training environments.", img: facility, alt: "Modern indoor sports arena lit at night" },
  { n: "03", title: "Equipment", text: "Providing access to essential sports equipment and resources.", img: equipment, alt: "Premium sports equipment on a dark surface" },
  { n: "04", title: "Opportunities", text: "Creating pathways for athletes to showcase talent and pursue their goals.", img: community, alt: "Athletes standing together in a huddle" },
];

const sports = [
  "Cricket", "Football", "Badminton", "Tennis", "Athletics", "Swimming",
  "Archery", "Basketball", "Hockey", "Wrestling", "Boxing", "Volleyball",
  "Para-Sports", "And More",
];

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="grain relative flex min-h-screen items-center overflow-hidden">
        <img
          src={hero}
          alt="Indian sprinter training at dawn on a stadium track"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover object-[70%_center] opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

        <div className="relative mx-auto w-full max-w-7xl px-5 pt-32 pb-24">
          <Reveal>
            <p className="eyebrow">UnitedAthletes for India Foundation</p>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-6 max-w-4xl text-[3rem] leading-[0.92] sm:text-7xl lg:text-8xl">
              Empowering Athletes.
              <span className="block text-gold-gradient">Enabling Dreams.</span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              We bridge the gap between talent and opportunity — providing the
              facilities, equipment, guidance and support systems athletes across
              India need to reach their full potential.
            </p>
          </Reveal>
          <Reveal delay={340}>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/get-involved"
                className="pulse-ring group inline-flex items-center gap-3 rounded-sm bg-primary px-8 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-primary-foreground transition-transform duration-300 hover:-translate-y-1"
              >
                Get Involved
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/programmes"
                className="inline-flex items-center gap-3 rounded-sm border border-primary/50 px-8 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-primary transition-colors duration-300 hover:bg-primary/10"
              >
                Explore Opportunities
              </Link>
            </div>
          </Reveal>

          <Reveal delay={460}>
            <dl className="mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-border pt-8">
              {[
                { k: "14+", v: "Sporting disciplines" },
                { k: "6", v: "Core programmes" },
                { k: "1", v: "Athlete-first promise" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-display text-4xl text-primary">{s.k}</dt>
                  <dd className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* MISSION */}
      <section className="border-y border-border bg-navy">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="eyebrow">Our Mission</p>
            <div className="rule-gold mt-4" />
          </Reveal>
          <Reveal delay={120}>
            <p className="font-display text-3xl leading-[1.15] sm:text-4xl lg:text-5xl">
              To empower athletes by providing the right{" "}
              <span className="text-gold-gradient">opportunities, facilities,
              equipment, guidance and support</span>{" "}
              they need to achieve their goals and reach their full potential.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ABOUT */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="relative">
              <img
                src={community}
                alt="Indian athletes in a huddle, backlit with golden light"
                width={1920}
                height={912}
                loading="lazy"
                className="w-full rounded-sm object-cover shadow-[var(--shadow-lift)]"
              />
              <div className="absolute -bottom-8 -right-4 hidden surface-card float-slow rounded-sm p-6 sm:block">
                <p className="font-display text-2xl text-primary">Talent is everywhere.</p>
                <p className="mt-1 text-sm text-muted-foreground">Opportunity should be too.</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <p className="eyebrow">About UnitedAthletes</p>
            <div className="rule-gold mt-4" />
            <h2 className="mt-6 text-4xl sm:text-5xl">
              A platform built around the athlete
            </h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              UnitedAthletes is dedicated to supporting athletes across India by
              creating opportunities for them to pursue their sporting ambitions. We
              work to bridge the gap between talent and opportunity by providing
              access to sports facilities, equipment, resources and a supportive
              ecosystem that enables athletes to grow.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Our goal is to help athletes focus on what matters most — training,
              competing, improving and achieving their dreams.
            </p>
            <Link
              to="/about"
              className="group mt-8 inline-flex items-center gap-3 text-sm font-extrabold uppercase tracking-[0.14em] text-primary"
            >
              Read our story
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="border-y border-border bg-navy">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <Reveal>
            <p className="eyebrow">What We Do</p>
            <div className="rule-gold mt-4" />
            <h2 className="mt-6 max-w-2xl text-4xl sm:text-5xl">
              Everything an athlete needs to keep going
            </h2>
          </Reveal>
          <ul className="mt-14 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {whatWeDo.map((item, i) => (
              <Reveal as="li" key={item.title} delay={i * 70}>
                <div className="group h-full bg-navy-deep p-8 transition-colors duration-500 hover:bg-navy-light">
                  <item.icon className="h-7 w-7 text-primary transition-transform duration-500 group-hover:-translate-y-1" />
                  <h3 className="mt-6 text-xl">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            ))}
            <Reveal as="li" delay={490}>
              <Link
                to="/programmes"
                className="flex h-full flex-col justify-between bg-primary p-8 text-primary-foreground"
              >
                <span className="font-display text-2xl leading-tight">
                  See all programmes
                </span>
                <ArrowRight className="mt-8 h-6 w-6" />
              </Link>
            </Reveal>
          </ul>
        </div>
      </section>

      {/* FOCUS */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <Reveal>
          <p className="eyebrow">Our Focus</p>
          <div className="rule-gold mt-4" />
          <h2 className="mt-6 max-w-2xl text-4xl sm:text-5xl">Four pillars, one athlete</h2>
        </Reveal>
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {focus.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <article className="group relative h-[26rem] overflow-hidden rounded-sm border border-border">
                <img
                  src={f.img}
                  alt={f.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/70 to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-8">
                  <span className="font-display text-sm tracking-[0.3em] text-primary">
                    {f.n}
                  </span>
                  <h3 className="mt-3 text-3xl">{f.title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    {f.text}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SPORTS MARQUEE */}
      <section className="overflow-hidden border-y border-border bg-navy py-20">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal>
            <p className="eyebrow">Sports</p>
            <div className="rule-gold mt-4" />
            <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
              UnitedAthletes supports athletes across multiple sporting disciplines
              and aims to create opportunities for athletes from diverse sporting
              backgrounds.
            </p>
          </Reveal>
        </div>
        <div className="mt-12 flex w-max marquee-track">
          {[0, 1].map((dup) => (
            <ul key={dup} className="flex items-center" aria-hidden={dup === 1}>
              {sports.map((s) => (
                <li
                  key={`${dup}-${s}`}
                  className="flex items-center gap-8 whitespace-nowrap px-8 font-display text-3xl text-foreground/70 sm:text-5xl"
                >
                  {s}
                  <span className="h-2 w-2 rotate-45 bg-primary" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="grain relative overflow-hidden">
        <img
          src={facility}
          alt="Empty sports arena lit in gold at night"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
        <div className="relative mx-auto max-w-4xl px-5 py-28 text-center">
          <Reveal>
            <p className="eyebrow">Call to Action</p>
            <h2 className="mt-6 text-4xl sm:text-6xl">
              Your talent deserves <span className="text-gold-gradient">an opportunity.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl leading-relaxed text-muted-foreground">
              Join the UnitedAthletes community and take the next step toward
              achieving your sporting goals.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/get-involved"
                className="group inline-flex items-center gap-3 rounded-sm bg-primary px-8 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-primary-foreground transition-transform duration-300 hover:-translate-y-1"
              >
                Get Involved
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/programmes"
                className="inline-flex items-center rounded-sm border border-primary/50 px-8 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-primary transition-colors hover:bg-primary/10"
              >
                Explore Opportunities
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
