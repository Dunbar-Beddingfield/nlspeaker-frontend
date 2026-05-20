import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin, ExternalLink } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { getEvents } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past speaking engagements — keynotes, workshops, webinars, and panels.",
};

const TYPE_LABELS: Record<string, string> = {
  keynote: "Keynote",
  workshop: "Workshop",
  webinar: "Webinar",
  panel: "Panel",
};

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([
    getEvents(false).catch(() => []),
    getEvents(true).catch(() => []),
  ]);

  return (
    <div className="pt-16">
      <section className="py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              eyebrow="On the Road"
              title="Speaking"
              titleHighlight="Engagements"
              description="Catch an upcoming event or explore past appearances. Interested in booking for your conference or company event?"
            />
          </AnimatedSection>

          {/* Upcoming */}
          <div className="mt-16">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#F59E0B] mb-6">
              Upcoming Events
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-[#64748B] text-sm">No upcoming events scheduled. <Link href="/contact" className="text-[#F59E0B] hover:text-[#D97706] transition-colors">Invite us to your event</Link>.</p>
            ) : (
              <div className="space-y-4">
                {upcoming.map((event, i) => (
                  <AnimatedSection key={event._id} delay={i * 0.07}>
                    <div className="group flex flex-col sm:flex-row gap-5 p-6 rounded-2xl bg-[#111827] border border-[rgba(245,158,11,0.1)] hover:border-[rgba(245,158,11,0.3)] transition-all">
                      {/* Date block */}
                      <div className="shrink-0 text-center sm:text-left">
                        <div className="w-16 h-16 rounded-xl gradient-gold flex flex-col items-center justify-center mx-auto sm:mx-0">
                          <span className="text-xs font-bold text-white/80 uppercase">
                            {new Date(event.date).toLocaleString("en-US", { month: "short" })}
                          </span>
                          <span className="text-2xl font-bold text-white leading-none">
                            {new Date(event.date).getDate()}
                          </span>
                        </div>
                      </div>
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.1)] text-[#F59E0B] border border-[rgba(245,158,11,0.2)]">
                            {TYPE_LABELS[event.eventType] ?? event.eventType}
                          </span>
                          {event.isFeatured && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-[#D97706] border border-[rgba(217,119,6,0.3)] font-medium">
                              Featured
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-[#F8FAFC] text-lg mb-1 group-hover:text-[#F59E0B] transition-colors">
                          {event.title}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#64748B] mb-3">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(event.date)}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {event.venue ? `${event.venue}, ` : ""}{event.location}
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-[#94A3B8] leading-relaxed line-clamp-2">{event.description}</p>
                        )}
                      </div>
                      {event.registrationUrl && (
                        <div className="shrink-0 flex items-center">
                          <a href={event.registrationUrl} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium gradient-gold text-white hover:opacity-90 transition-opacity">
                            Register <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            )}
          </div>

          {/* Past events */}
          {past.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#64748B] mb-6">
                Past Events
              </h2>
              <div className="space-y-3">
                {past.map((event, i) => (
                  <AnimatedSection key={event._id} delay={i * 0.05}>
                    <div className="flex flex-col sm:flex-row gap-4 p-5 rounded-xl bg-[#111827] border border-[rgba(245,158,11,0.06)] opacity-75">
                      <div className="shrink-0 text-sm text-[#475569] min-w-[100px]">
                        {formatDate(event.date)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[#CBD5E1] mb-0.5">{event.title}</h3>
                        {event.location && (
                          <p className="text-xs text-[#475569] flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{event.location}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-xs px-2 py-0.5 h-fit rounded-full bg-[#1A2540] text-[#475569] border border-[rgba(71,85,105,0.3)]">
                        {TYPE_LABELS[event.eventType] ?? event.eventType}
                      </span>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-[#111827] text-center">
        <AnimatedSection>
          <h2 className="font-serif-display text-3xl font-bold text-[#F8FAFC] mb-4">
            Want to Book for Your Event?
          </h2>
          <p className="text-[#94A3B8] mb-8 max-w-xl mx-auto">
            We&apos;re available for keynotes, workshops, webinars, and panel discussions worldwide.
          </p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold gradient-gold text-white hover:opacity-90 transition-opacity glow-gold">
            Request Availability <ArrowRight className="w-4 h-4" />
          </Link>
        </AnimatedSection>
      </section>
    </div>
  );
}
