"use client";

import { useState, type FormEvent, type ComponentType } from "react";
import { Mail, Phone, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { LinkedinIcon } from "@/components/ui/icons";
import { profile } from "@/data/resume";
import { Section } from "./section";
import { Reveal } from "./reveal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { track } from "@/lib/track-client";
import { getVisitorId, cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "submitting" | "success" | "error";

interface ContactLink {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}

const contactLinks: ContactLink[] = [
  {
    icon: Mail,
    label: "Email",
    value: profile.email,
    href: `mailto:${profile.email}`,
  },
  {
    icon: Phone,
    label: "Phone",
    value: profile.phone,
    href: `tel:${profile.phone.replace(/[^+\d]/g, "")}`,
  },
  {
    icon: LinkedinIcon,
    label: "LinkedIn",
    value: profile.linkedinLabel,
    href: profile.linkedin,
  },
  {
    icon: MapPin,
    label: "Location",
    value: profile.location,
  },
];

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const nameInvalid = name.trim().length === 0;
  const emailInvalid = !EMAIL_RE.test(email.trim());
  const messageInvalid = message.trim().length === 0;
  const formInvalid = nameInvalid || emailInvalid || messageInvalid;
  const submitting = status === "submitting";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (formInvalid) {
      setShowErrors(true);
      return;
    }

    setStatus("submitting");
    track("contact_submit");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          visitorId: getVisitorId(),
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <Section
      id="contact"
      index="05"
      eyebrow="Contact"
      title="Let's talk about your AI product team."
      grid
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        {/* Left — warm invite + contact list */}
        <Reveal>
          <div>
            <p className="max-w-md text-pretty text-lg leading-relaxed text-foreground/80">
              If you&apos;re building an AI-first product and need a leader who
              pairs disciplined delivery with genuine product instinct, I&apos;d
              love to hear about it. The fastest way to reach me is below — or
              send a note and I&apos;ll reply personally.
            </p>

            <div className="mt-8 h-px w-24 bg-clay/60" />

            <dl className="mt-8 space-y-1">
              {contactLinks.map(({ icon: Icon, label, value, href }) => {
                const body = (
                  <>
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-surface text-accent transition-colors group-hover:border-accent-ring">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <dt className="eyebrow text-[0.65rem]">{label}</dt>
                      <dd className="truncate text-[0.95rem] text-foreground">
                        {value}
                      </dd>
                    </span>
                  </>
                );

                return href ? (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      href.startsWith("http") ? "noopener noreferrer" : undefined
                    }
                    className="group -mx-3 flex items-center gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-2"
                  >
                    {body}
                  </a>
                ) : (
                  <div
                    key={label}
                    className="group -mx-3 flex items-center gap-4 px-3 py-2.5"
                  >
                    {body}
                  </div>
                );
              })}
            </dl>
          </div>
        </Reveal>

        {/* Right — form */}
        <Reveal delay={0.1}>
          <div className="card-paper rounded-2xl p-6 sm:p-8">
            {status === "success" ? (
              <div
                role="status"
                aria-live="polite"
                className="flex min-h-[20rem] flex-col items-center justify-center text-center"
              >
                <span className="grid size-14 place-items-center rounded-full bg-accent-soft text-accent">
                  <CheckCircle2 className="size-7" aria-hidden />
                </span>
                <h3 className="mt-5 text-2xl">Thanks</h3>
                <p className="mt-2 max-w-xs text-pretty text-muted">
                  Matt will be in touch shortly.
                </p>
              </div>
            ) : (
              <form noValidate onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="contact-name"
                    className="eyebrow block text-[0.65rem]"
                  >
                    Name
                  </label>
                  <Input
                    id="contact-name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    required
                    disabled={submitting}
                    aria-invalid={showErrors && nameInvalid}
                    aria-describedby={
                      showErrors && nameInvalid ? "contact-name-error" : undefined
                    }
                    className={cn(
                      showErrors &&
                        nameInvalid &&
                        "border-clay focus:border-clay focus:ring-clay/20",
                    )}
                  />
                  {showErrors && nameInvalid && (
                    <p id="contact-name-error" className="text-sm text-clay">
                      Please enter your name.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="contact-email"
                    className="eyebrow block text-[0.65rem]"
                  >
                    Email
                  </label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                    disabled={submitting}
                    aria-invalid={showErrors && emailInvalid}
                    aria-describedby={
                      showErrors && emailInvalid
                        ? "contact-email-error"
                        : undefined
                    }
                    className={cn(
                      showErrors &&
                        emailInvalid &&
                        "border-clay focus:border-clay focus:ring-clay/20",
                    )}
                  />
                  {showErrors && emailInvalid && (
                    <p id="contact-email-error" className="text-sm text-clay">
                      Please enter a valid email address.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="contact-message"
                    className="eyebrow block text-[0.65rem]"
                  >
                    Message
                  </label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="A few lines on the role, team, or problem you're solving…"
                    rows={5}
                    required
                    disabled={submitting}
                    aria-invalid={showErrors && messageInvalid}
                    aria-describedby={
                      showErrors && messageInvalid
                        ? "contact-message-error"
                        : undefined
                    }
                    className={cn(
                      showErrors &&
                        messageInvalid &&
                        "border-clay focus:border-clay focus:ring-clay/20",
                    )}
                  />
                  {showErrors && messageInvalid && (
                    <p id="contact-message-error" className="text-sm text-clay">
                      Please add a short message.
                    </p>
                  )}
                </div>

                {status === "error" && error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-clay/30 bg-clay/5 px-4 py-3 text-sm text-clay"
                  >
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? (
                    <>
                      <Spinner />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send message
                      <ArrowRight className="size-4" aria-hidden />
                    </>
                  )}
                </Button>

                <p className="text-center text-[0.7rem] text-faint">
                  Goes straight to Matt&apos;s inbox · no newsletters, ever.
                </p>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
