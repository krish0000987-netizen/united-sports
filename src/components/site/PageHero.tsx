import type { ReactNode } from "react";

import { Reveal } from "./Reveal";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  alt,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  image: string;
  alt: string;
  children?: ReactNode;
}) {
  return (
    <section className="grain relative flex min-h-[62vh] items-end overflow-hidden pt-28">
      <img
        src={image}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/30" />
      <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-16">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <div className="rule-gold mt-4" />
          <h1 className="mt-6 max-w-4xl text-5xl sm:text-6xl lg:text-7xl">{title}</h1>
          {subtitle && (
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {subtitle}
            </p>
          )}
          {children}
        </Reveal>
      </div>
    </section>
  );
}
