"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, Mic, Calendar, Mail } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { submitInquiry } from "@/lib/api";
import { COMPANY, AUDIENCE_SIZES, BUDGET_RANGES, EVENT_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type TabType = "booking" | "contact";

const ERROR_MAP: Record<string, string> = {
  "eventDate must be a valid ISO 8601 date string": "Please enter a valid event date.",
  "email must be an email": "Please enter a valid email address.",
  "name must be longer than or equal to 1 characters": "Please enter your full name.",
  "message must be longer than or equal to 1 characters": "Please enter a message.",
};

function humaniseApiError(message: string): string {
  if (!message) return "Something went wrong. Please try again or email us directly.";
  const mapped = ERROR_MAP[message];
  if (mapped) return mapped;
  // Strip technical field prefixes like "fieldName must ..." → "Please check your submission and try again."
  if (/must be|must have|should be|is not valid/i.test(message)) {
    return "Please check your submission and try again.";
  }
  return message;
}

export function ContactForm() {
  const searchParams = useSearchParams();
  const defaultService = searchParams.get("service") || "";
  const [tab, setTab] = useState<TabType>("booking");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const get = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement)?.value || "";

    const rawDate = get("eventDate");
    const eventDate = rawDate ? new Date(rawDate).toISOString() : "";

    const payload =
      tab === "booking"
        ? {
            type: "booking",
            name: get("name"),
            email: get("email"),
            phone: get("phone"),
            organization: get("organization"),
            eventDate,
            eventType: get("eventType"),
            eventLocation: get("eventLocation"),
            audienceSize: get("audienceSize"),
            budget: get("budget"),
            message: get("message"),
            consentGiven: true,
          }
        : {
            type: "contact",
            name: get("name"),
            email: get("email"),
            phone: get("phone"),
            organization: get("organization"),
            message: get("message"),
          };

    try {
      await submitInquiry(payload);
      setSubmitted(true);
    } catch (e) {
      setError(humaniseApiError(e instanceof Error ? e.message : ""));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-16">
        <AnimatedSection className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-6 glow-gold">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-serif-display text-3xl font-bold text-[#F8FAFC] mb-3">
            Message Received!
          </h2>
          <p className="text-[#94A3B8] leading-relaxed">
            Thank you for reaching out. We&apos;ll review your inquiry and get back to you
            within 1–2 business days.
          </p>
        </AnimatedSection>
      </div>
    );
  }

  const inputCls =
    "w-full px-4 py-2.5 rounded-lg bg-[#0B1120] border border-[rgba(245,158,11,0.15)] text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#F59E0B] transition-colors text-sm";
  const labelCls = "block text-sm font-medium text-[#94A3B8] mb-1.5";

  return (
    <div className="pt-16">
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              eyebrow="Get in Touch"
              title="Let&apos;s Make Your"
              titleHighlight="Event Unforgettable"
              description="Ready to bring a transformational speaker to your event? Fill in the details and we'll be in touch within 1–2 business days."
            />
          </AnimatedSection>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left: contact info */}
            <AnimatedSection delay={0.1}>
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-[#111827] border border-[rgba(245,158,11,0.08)]">
                  <div className="w-9 h-9 rounded-lg bg-[rgba(245,158,11,0.1)] flex items-center justify-center mb-3">
                    <Mail className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <p className="text-sm font-medium text-[#F8FAFC] mb-1">Email Us</p>
                  <a
                    href={`mailto:${COMPANY.email}`}
                    className="text-sm text-[#64748B] hover:text-[#F59E0B] transition-colors"
                  >
                    {COMPANY.email}
                  </a>
                </div>
                <div className="p-5 rounded-2xl bg-[#111827] border border-[rgba(245,158,11,0.08)]">
                  <div className="w-9 h-9 rounded-lg bg-[rgba(245,158,11,0.1)] flex items-center justify-center mb-3">
                    <Mic className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <p className="text-sm font-medium text-[#F8FAFC] mb-1">Book a Speaker</p>
                  <p className="text-sm text-[#64748B]">
                    Fill in the booking form and we&apos;ll confirm availability within 48 hours.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#111827] border border-[rgba(245,158,11,0.08)]">
                  <div className="w-9 h-9 rounded-lg bg-[rgba(245,158,11,0.1)] flex items-center justify-center mb-3">
                    <Calendar className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <p className="text-sm font-medium text-[#F8FAFC] mb-1">Response Time</p>
                  <p className="text-sm text-[#64748B]">
                    We respond to all inquiries within 1–2 business days.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* Right: form */}
            <AnimatedSection delay={0.15} className="lg:col-span-2">
              {/* Tab selector */}
              <div className="flex rounded-xl bg-[#111827] p-1 mb-6 w-fit">
                {(["booking", "contact"] as TabType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "px-5 py-2 rounded-lg text-sm font-medium transition-colors",
                      tab === t
                        ? "gradient-gold text-white"
                        : "text-[#64748B] hover:text-[#F8FAFC]",
                    )}
                  >
                    {t === "booking" ? "Booking Request" : "General Contact"}
                  </button>
                ))}
              </div>

              <form
                onSubmit={handleSubmit}
                className="gradient-border bg-[#111827] rounded-2xl p-6 sm:p-8 space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Full Name *</label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="Jane Smith"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Email *</label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="jane@company.com"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Organization</label>
                    <input
                      name="organization"
                      type="text"
                      placeholder="Company or event name"
                      className={inputCls}
                    />
                  </div>
                </div>

                {tab === "booking" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelCls}>Event Date</label>
                        <input name="eventDate" type="date" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Event Type</label>
                        <select name="eventType" className={inputCls} defaultValue="">
                          <option value="" disabled>Select event type</option>
                          {EVENT_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Event Location / City</label>
                      <input
                        name="eventLocation"
                        type="text"
                        placeholder="New York, NY"
                        className={inputCls}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelCls}>Audience Size</label>
                        <select name="audienceSize" className={inputCls} defaultValue="">
                          <option value="" disabled>Select size</option>
                          {AUDIENCE_SIZES.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Budget Range</label>
                        <select
                          name="budget"
                          className={inputCls}
                          defaultValue={defaultService}
                        >
                          <option value="" disabled>Select range</option>
                          {BUDGET_RANGES.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className={labelCls}>
                    {tab === "booking" ? "Additional Details *" : "Message *"}
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder={
                      tab === "booking"
                        ? "Tell us about your event goals, audience, and any specific topics you'd like covered…"
                        : "How can we help you?"
                    }
                    className={`${inputCls} resize-none`}
                  />
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full gradient-gold text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 h-12"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                    </>
                  ) : tab === "booking" ? (
                    "Submit Booking Request"
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
}
