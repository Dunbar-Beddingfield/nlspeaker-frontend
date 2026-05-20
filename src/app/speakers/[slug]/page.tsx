import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Linkedin, Globe, Twitter, Instagram } from "lucide-react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { getSpeakerBySlug, getSpeakers } from "@/lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const speakers = await getSpeakers().catch(() => []);
  return speakers.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const speaker = await getSpeakerBySlug(slug).catch(() => null);
  if (!speaker) return { title: "Speaker Not Found" };
  return {
    title: speaker.name,
    description: speaker.shortBio,
  };
}

export default async function SpeakerDetailPage({ params }: Props) {
  const { slug } = await params;
  const speaker = await getSpeakerBySlug(slug).catch(() => null);
  if (!speaker) notFound();

  const socialEntries = [
    { href: speaker.socialLinks?.linkedin, Icon: Linkedin, label: "LinkedIn" },
    { href: speaker.socialLinks?.website, Icon: Globe, label: "Website" },
    { href: speaker.socialLinks?.twitter, Icon: Twitter, label: "Twitter" },
    { href: speaker.socialLinks?.instagram, Icon: Instagram, label: "Instagram" },
  ].filter((s) => s.href);

  return (
    <div className="pt-16">
      {/* Back */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <Link
          href="/speakers"
          className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#F59E0B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Speakers
        </Link>
      </div>

      {/* Hero */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row gap-10 items-start">
              {/* Photo */}
              <div className="w-full md:w-72 shrink-0">
                <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-[#111827]">
                  {speaker.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={speaker.photo}
                      alt={speaker.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[rgba(245,158,11,0.12)] to-[rgba(217,119,6,0.06)]">
                      <span className="text-7xl font-bold text-[rgba(245,158,11,0.3)]">
                        {speaker.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Social */}
                {socialEntries.length > 0 && (
                  <div className="flex items-center gap-3 mt-4">
                    {socialEntries.map(({ href, Icon, label }) => (
                      <a
                        key={label}
                        href={href!}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="w-9 h-9 rounded-lg bg-[#111827] border border-[rgba(245,158,11,0.12)] flex items-center justify-center text-[#64748B] hover:text-[#F59E0B] hover:border-[rgba(245,158,11,0.4)] transition-all"
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Intro */}
              <div className="flex-1">
                <h1 className="font-serif-display text-4xl sm:text-5xl font-bold text-[#F8FAFC] mb-2 leading-tight">
                  {speaker.name}
                </h1>
                {speaker.designation && (
                  <p className="text-[#F59E0B] font-medium mb-5">{speaker.designation}</p>
                )}
                {speaker.shortBio && (
                  <p className="text-lg text-[#94A3B8] leading-relaxed mb-6">{speaker.shortBio}</p>
                )}

                {speaker.pastClients?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-3">
                      Past &amp; Present Clients
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {speaker.pastClients.map((client) => (
                        <span
                          key={client}
                          className="px-3 py-1 rounded-full text-xs bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.15)] text-[#94A3B8]"
                        >
                          {client}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Full bio */}
      {speaker.bio && (
        <section className="py-12 border-t border-[rgba(245,158,11,0.08)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <h2 className="font-serif-display text-2xl font-bold text-[#F8FAFC] mb-6">
                About {speaker.name.split(" ")[0]}
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-[#94A3B8] leading-relaxed whitespace-pre-line">{speaker.bio}</p>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Portfolio images */}
      {speaker.portfolioImages?.length > 0 && (
        <section className="py-12 border-t border-[rgba(245,158,11,0.08)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <h2 className="font-serif-display text-2xl font-bold text-[#F8FAFC] mb-6">Portfolio</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {speaker.portfolioImages.map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={img}
                    alt={`${speaker.name} portfolio ${i + 1}`}
                    className="w-full aspect-video object-cover rounded-xl border border-[rgba(245,158,11,0.08)] hover:border-[rgba(245,158,11,0.3)] transition-colors"
                  />
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-[#111827] text-center mt-8">
        <AnimatedSection>
          <h2 className="font-serif-display text-3xl font-bold text-[#F8FAFC] mb-4">
            Book {speaker.name.split(" ")[0]} for Your Event
          </h2>
          <p className="text-[#94A3B8] mb-8">
            Let&apos;s create an unforgettable experience for your audience.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href={`/contact?speaker=${speaker.slug}`}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold gradient-gold text-white hover:opacity-90 transition-opacity glow-gold"
            >
              Request Booking <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/speakers"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm text-[#64748B] hover:text-[#F8FAFC] transition-colors border border-[rgba(245,158,11,0.1)] hover:border-[rgba(245,158,11,0.25)]"
            >
              View All Speakers
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
}
