import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import programmeHero from "@/assets/programme-hero.jpg";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/programmes")({
  head: () => ({
    meta: [
      { title: "Programmes | UnitedAthletes for India Foundation" },
      {
        name: "description",
        content:
          "Six athlete-first programmes: development, facility access, equipment support, emerging athletes, community initiatives and the opportunity platform.",
      },
      { property: "og:title", content: "Programmes | UnitedAthletes" },
      {
        property: "og:description",
        content:
          "Initiatives focused on athlete development and access to resources, facilities, equipment and opportunities.",
      },
    ],
  }),
  component: Programmes,
});

const programmes = [
  { n: "01", title: "Athlete Development Programme", text: "Supporting athletes with resources, guidance and opportunities designed to help them progress in their sporting journey." },
  { n: "02", title: "Sports Facility Access", text: "Helping athletes gain access to suitable sports facilities and training environments." },
  { n: "03", title: "Sports Equipment Support", text: "Providing access to essential sports equipment and resources that athletes require for training and development." },
  { n: "04", title: "Emerging Athlete Support", text: "Identifying and supporting promising athletes who need greater access to opportunities and resources." },
  { n: "05", title: "Community Sports Initiatives", text: "Building stronger sporting communities by connecting athletes, coaches, organisations, supporters and sports enthusiasts." },
  { n: "06", title: "Athlete Opportunity Platform", text: "Creating a platform where athletes can discover opportunities, connect with the sporting ecosystem and work toward their goals." },
];

const approach = ["Discover", "Support", "Equip", "Develop", "Connect", "Empower"];

function Programmes() {
  return (
    <>
      <PageHero
        eyebrow="Programmes"
        title={
          <>
            Our <span className="text-gold-gradient">Programmes</span>
          </>
        }
        subtitle="Initiatives focused on athlete development and access to sports resources, facilities, equipment and opportunities."
        image={programmeHero}
        alt="Young Indian boxer training in a gym with golden light"
      />

      <section className="mx-auto max-w-7xl px-5 py-24">
        <ul className="border-t border-border">
          {programmes.map((p, i) => (
            <Reveal as="li" key={p.n} delay={i * 60}>
              <div className="group grid gap-6 border-b border-border py-10 transition-colors duration-500 hover:bg-navy md:grid-cols-[7rem_1fr_auto] md:items-center md:px-6">
                <span className="font-display text-4xl text-primary/70 transition-colors group-hover:text-primary">
                  {p.n}
                </span>
                <div>
                  <h2 className="text-2xl sm:text-3xl">{p.title}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {p.text}
                  </p>
                </div>
                <ArrowRight className="hidden h-6 w-6 text-primary transition-transform duration-500 group-hover:translate-x-2 md:block" />
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="border-y border-border bg-navy">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <Reveal>
            <p className="eyebrow">Our Approach</p>
            <div className="rule-gold mt-4" />
            <h2 className="mt-6 max-w-3xl text-4xl sm:text-5xl">
              An athlete-first path from ambition to achievement
            </h2>
          </Reveal>
          <ol className="mt-14 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-6">
            {approach.map((step, i) => (
              <Reveal as="li" key={step} delay={i * 90}>
                <div className="h-full bg-navy-deep p-7">
                  <span className="font-display text-xs tracking-[0.3em] text-primary">
                    Step {i + 1}
                  </span>
                  <p className="mt-4 font-display text-2xl">{step}</p>
                </div>
              </Reveal>
            ))}
          </ol>
          <Reveal delay={200}>
            <p className="mt-10 max-w-2xl leading-relaxed text-muted-foreground">
              Our objective is to make the journey from sporting ambition to
              achievement more accessible.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-28 text-center">
        <Reveal>
          <h2 className="text-4xl sm:text-5xl">
            Ready to take the <span className="text-gold-gradient">next step?</span>
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/get-involved"
              className="group inline-flex items-center gap-3 rounded-sm bg-primary px-8 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-primary-foreground transition-transform duration-300 hover:-translate-y-1"
            >
              Get Involved
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-sm border border-primary/50 px-8 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-primary transition-colors hover:bg-primary/10"
            >
              Contact Us
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
