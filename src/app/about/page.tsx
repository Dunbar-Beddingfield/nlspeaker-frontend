import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Mic, Users, Globe, Heart } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { getSiteSettings } from "@/lib/api";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn the story behind Next Level Speaking Services — our mission, values, and commitment to building better futures for speakers.",
};

const VALUES = [
  "Authentic storytelling & message clarity",
  "Audience-first approach to every talk",
  "Proven frameworks for stage confidence",
  "Personalized coaching for every speaker",
  "Connections to top-tier event organizers",
  "Results measured in standing ovations",
];

const PILLARS = [
  { Icon: Mic, label: "Expert Coaching", desc: "World-class techniques to sharpen your delivery, presence, and message." },
  { Icon: Users, label: "Community", desc: "A network of speakers lifting each other higher at every stage." },
  { Icon: Globe, label: "Global Reach", desc: "Booking support that opens doors on stages around the world." },
  { Icon: Heart, label: "Authentic Impact", desc: "We believe the best talks change lives. We help you make that happen." },
];

export default async function AboutPage() {
  const settings = await getSiteSettings().catch(() => ({} as Record<string, string>));
  const speakerName = settings["speakerName"] || COMPANY.shortName;
  const aboutSummary = settings["aboutSummary"] || COMPANY.description;

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[rgba(245,158,11,0.05)] rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              eyebrow="Our Story"
              title="The Mission Behind"
              titleHighlight={speakerName}
              description={aboutSummary}
            />
          </AnimatedSection>
        </div>
      </section>

      {/* Mission + values */}
      <section className="py-24 bg-[#111827]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <h2 className="font-serif-display text-3xl font-bold text-[#F8FAFC] mb-6">
                Why We Do This
              </h2>
              <p className="text-[#94A3B8] leading-relaxed mb-5">
                Every speaker has a message worth hearing. Too many brilliant ideas stay locked inside people who never got the tools, confidence, or platform to share them. That&apos;s the gap we exist to close.
              </p>
              <p className="text-[#94A3B8] leading-relaxed mb-8">
                From first-time speakers taking the stage to seasoned executives looking to electrify keynote audiences, we bring personalized coaching, strategic booking support, and a community that believes in the power of one great talk to change everything.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VALUES.map((v) => (
                  <div key={v} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" />
                    <span className="text-sm text-[#CBD5E1]">{v}</span>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="gradient-border bg-[#0B1120] rounded-2xl p-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#F59E0B] mb-6">
                  Audiences We Serve
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {["Aspiring Speakers", "Corporate Leaders", "Event Organizers", "Coaches & Consultants", "Entrepreneurs", "Non-Profit Leaders", "Educators", "Authors"].map((t) => (
                    <span key={t}
                      className="px-3 py-1.5 rounded-full text-xs bg-[rgba(245,158,11,0.08)] text-[#F59E0B] border border-[rgba(245,158,11,0.2)]">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="pt-6 border-t border-[rgba(245,158,11,0.1)]">
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    Whether you&apos;re preparing for your first TEDx talk or stepping onto a global conference stage, we have a program designed for exactly where you are right now.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Four pillars */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader eyebrow="Our Approach" title="What Sets Us" titleHighlight="Apart" />
          </AnimatedSection>
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PILLARS.map(({ Icon, label, desc }, i) => (
              <AnimatedSection key={label} delay={i * 0.1}>
                <div className="p-6 rounded-2xl bg-[#111827] border border-[rgba(245,158,11,0.08)] h-full">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(245,158,11,0.1)] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <h3 className="font-semibold text-[#F8FAFC] mb-2">{label}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">{desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#111827] text-center">
        <AnimatedSection>
          <h2 className="font-serif-display text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-4">
            Ready to Take the Stage?
          </h2>
          <p className="text-[#94A3B8] mb-8 max-w-xl mx-auto">
            Let&apos;s talk about where you are today and where you want to be. Your next great talk starts here.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold gradient-gold text-white hover:opacity-90 transition-opacity glow-gold"
          >
            Book a Speaker <ArrowRight className="w-4 h-4" />
          </Link>
        </AnimatedSection>
      </section>
    </div>
  );
}
