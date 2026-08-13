import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import facility from "@/assets/facility.jpg";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | UnitedAthletes for India Foundation" },
      {
        name: "description",
        content:
          "Reach UnitedAthletes for India Foundation — call +91 8527877688 or visit us in Indirapuram, Ghaziabad, Uttar Pradesh.",
      },
      { property: "og:title", content: "Contact UnitedAthletes" },
      {
        property: "og:description",
        content:
          "Get in touch with UnitedAthletes for India Foundation about athletes, facilities, equipment and partnerships.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    toast.success("Thank you — we'll be in touch soon.", {
      description: "Your message has been noted by the UnitedAthletes team.",
    });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let&apos;s <span className="text-gold-gradient">talk sport</span>
          </>
        }
        subtitle="Athletes, coaches, organisations and supporters — we'd love to hear from you."
        image={facility}
        alt="Modern indoor sports arena lit at night"
      />

      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <p className="eyebrow">Contact Us</p>
            <div className="rule-gold mt-4" />
            <h2 className="mt-6 text-4xl sm:text-5xl">
              UnitedAthletes for India Foundation
            </h2>
            <ul className="mt-10 space-y-6">
              <li className="flex gap-4">
                <Phone className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Phone & WhatsApp
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <a href="tel:+918527877688" className="text-lg hover:text-primary">
                      +91 85278 77688
                    </a>
                    <a
                      href="https://wa.me/918527877688?text=Hello%20UnitedAthletes%20Foundation!"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366]/20 px-3 py-1 text-xs font-extrabold text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white"
                    >
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>
              </li>
              <li className="flex gap-4">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Address
                  </p>
                  <p className="max-w-sm text-lg leading-relaxed">
                    384A, Nyay Khand 3, Indirapuram, Ghaziabad, Uttar Pradesh –
                    201014
                  </p>
                </div>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={140}>
            <form onSubmit={onSubmit} className="surface-card rounded-sm p-8 sm:p-10">
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="text-xs uppercase tracking-[0.24em] text-muted-foreground"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-3 w-full rounded-sm border border-input bg-background/60 px-4 py-3 outline-none transition-colors focus:border-primary"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="text-xs uppercase tracking-[0.24em] text-muted-foreground"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-3 w-full rounded-sm border border-input bg-background/60 px-4 py-3 outline-none transition-colors focus:border-primary"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="text-xs uppercase tracking-[0.24em] text-muted-foreground"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="mt-3 w-full resize-none rounded-sm border border-input bg-background/60 px-4 py-3 outline-none transition-colors focus:border-primary"
                  />
                </div>
                <button
                  type="submit"
                  className="group inline-flex w-full items-center justify-center gap-3 rounded-sm bg-primary px-8 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-primary-foreground transition-transform duration-300 hover:-translate-y-1"
                >
                  Submit
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-border bg-navy">
        <div className="mx-auto max-w-4xl px-5 py-24 text-center">
          <Reveal>
            <h2 className="text-4xl sm:text-5xl">
              Together, we can build a{" "}
              <span className="text-gold-gradient">stronger sporting India.</span>
            </h2>
            <p className="mt-8 font-display text-2xl">UnitedAthletes</p>
            <p className="mt-2 text-sm uppercase tracking-[0.28em] text-primary">
              Empowering Athletes. Enabling Dreams.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
