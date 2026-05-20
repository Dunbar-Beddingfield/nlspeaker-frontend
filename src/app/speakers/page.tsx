import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Linkedin, Globe, Twitter, Instagram } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { getSpeakers } from "@/lib/api";

export const metadata: Metadata = {
  title: "Speakers",
  description:
    "Meet our world-class speakers — thought leaders, authors, and professionals ready to inspire your next event.",
};

export default async function SpeakersPage() {
  const speakers = await getSpeakers().catch(() => []);

  return (
    <div className="pt-16">
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[rgba(245,158,11,0.04)] rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              eyebrow="Past and Present"
              title="Our Featured"
              titleHighlight="Speakers"
              description="From Fortune 500 boardrooms to sold-out stages — meet the voices that move audiences and spark real change."
            />
          </AnimatedSection>

          {speakers.length === 0 ? (
            <div className="mt-16 text-center text-[#64748B]">
              Speaker profiles coming soon.{" "}
              <Link href="/contact" className="text-[#F59E0B] hover:text-[#D97706] transition-colors">
                Contact us to learn more
              </Link>
              .
            </div>
          ) : (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {speakers.map((speaker, i) => (
                <AnimatedSection key={speaker._id} delay={i * 0.08}>
                  <div className="group gradient-border bg-[#111827] rounded-2xl overflow-hidden flex flex-col h-full hover:bg-[#1A2540] transition-colors">
                    <div className="h-64 overflow-hidden shrink-0 relative bg-[#0B1120]">
                      {speaker.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={speaker.photo}
                          alt={speaker.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[rgba(245,158,11,0.12)] to-[rgba(217,119,6,0.06)]">
                          <span className="text-5xl font-bold text-[rgba(245,158,11,0.3)]">
                            {speaker.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-serif-display text-xl font-bold text-[#F8FAFC] mb-1 group-hover:text-[#F59E0B] transition-colors">
                        {speaker.name}
                      </h3>
                      {speaker.designation && (
                        <p className="text-xs font-medium text-[#F59E0B] mb-3">{speaker.designation}</p>
                      )}
                      <p className="text-sm text-[#94A3B8] leading-relaxed flex-1 mb-4 line-clamp-4">
                        {speaker.shortBio}
                      </p>

                      {speaker.pastClients?.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">
                            Past Clients
                          </p>
                          <p className="text-xs text-[#64748B] line-clamp-1">
                            {speaker.pastClients.slice(0, 4).join(" · ")}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-auto">
                        <Link
                          href={`/speakers/${speaker.slug}`}
                          className="flex items-center gap-1.5 text-sm font-medium text-[#F59E0B] hover:text-[#D97706] transition-colors"
                        >
                          View Profile <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        <div className="flex items-center gap-2">
                          {speaker.socialLinks?.linkedin && (
                            <a href={speaker.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                              className="text-[#475569] hover:text-[#F59E0B] transition-colors">
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                          {speaker.socialLinks?.website && (
                            <a href={speaker.socialLinks.website} target="_blank" rel="noopener noreferrer"
                              className="text-[#475569] hover:text-[#F59E0B] transition-colors">
                              <Globe className="w-4 h-4" />
                            </a>
                          )}
                          {speaker.socialLinks?.twitter && (
                            <a href={speaker.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                              className="text-[#475569] hover:text-[#F59E0B] transition-colors">
                              <Twitter className="w-4 h-4" />
                            </a>
                          )}
                          {speaker.socialLinks?.instagram && (
                            <a href={speaker.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                              className="text-[#475569] hover:text-[#F59E0B] transition-colors">
                              <Instagram className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#111827] text-center">
        <AnimatedSection>
          <h2 className="font-serif-display text-3xl font-bold text-[#F8FAFC] mb-4">
            Looking to Book a Speaker?
          </h2>
          <p className="text-[#94A3B8] mb-8">
            We&apos;ll match you with the perfect speaker for your event, audience, and budget.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold gradient-gold text-white hover:opacity-90 transition-opacity glow-gold"
          >
            Request a Speaker <ArrowRight className="w-4 h-4" />
          </Link>
        </AnimatedSection>
      </section>
    </div>
  );
}
