import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

interface SectionProps {
  id: string;
  index?: string; // e.g. "01"
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  /** Render the faint engineering grid behind the section. */
  grid?: boolean;
}

/**
 * Standard section shell: scroll anchor + tracking hook ([data-section]),
 * a mono eyebrow with optional index, a Fraunces display heading, and intro.
 */
export function Section({
  id,
  index,
  eyebrow,
  title,
  intro,
  children,
  className,
  containerClassName,
  grid = false,
}: SectionProps) {
  return (
    <section
      id={id}
      data-section={id}
      className={cn("relative scroll-mt-24 py-20 md:py-28", className)}
    >
      {grid && (
        <div
          aria-hidden
          className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        />
      )}
      <div
        className={cn(
          "relative mx-auto w-full max-w-5xl px-6",
          containerClassName,
        )}
      >
        {(eyebrow || title) && (
          <Reveal>
            <header className="mb-10 md:mb-14">
              {eyebrow && (
                <p className="eyebrow mb-3">
                  {index && (
                    <span className="text-accent">{index}&nbsp;&nbsp;/&nbsp;&nbsp;</span>
                  )}
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2 className="max-w-2xl text-balance text-3xl leading-tight md:text-[2.6rem]">
                  {title}
                </h2>
              )}
              {intro && (
                <p className="mt-4 max-w-xl text-pretty text-muted">{intro}</p>
              )}
            </header>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
