import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { getTopics } from "@/lib/api";

export const metadata: Metadata = {
  title: "Speaking Topics",
  description:
    "Browse our speaking topics — leadership, mindset, resilience, communication, and more.",
};

export default async function TopicsPage() {
  const topics = await getTopics().catch(() => []);

  return (
    <div className="pt-16">
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              eyebrow="Areas of Expertise"
              title="Speaking"
              titleHighlight="Topics"
              description="Every talk is anchored in one of these core topic areas — designed to inspire, challenge, and equip your audience with ideas they can act on immediately."
            />
          </AnimatedSection>

          {topics.length === 0 ? (
            <div className="mt-16 text-center text-[#64748B]">
              Topics coming soon. <Link href="/contact" className="text-[#F59E0B] hover:text-[#D97706] transition-colors">Contact us to learn more</Link>.
            </div>
          ) : (
            <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {topics.map((topic, i) => (
                <AnimatedSection key={topic._id} delay={i * 0.07}>
                  <div className="group p-6 rounded-2xl bg-[#111827] border border-[rgba(245,158,11,0.08)] hover:border-[rgba(245,158,11,0.3)] hover:bg-[#1A2540] transition-all h-full flex flex-col">
                    {topic.icon && (
                      <span className="text-3xl mb-4 block">{topic.icon}</span>
                    )}
                    <h3 className="font-serif-display text-xl font-bold text-[#F8FAFC] mb-3 group-hover:text-[#F59E0B] transition-colors">
                      {topic.title}
                    </h3>
                    {topic.description && (
                      <p className="text-sm text-[#94A3B8] leading-relaxed flex-1">
                        {topic.description}
                      </p>
                    )}
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-[#111827] text-center">
        <AnimatedSection>
          <h2 className="font-serif-display text-3xl font-bold text-[#F8FAFC] mb-4">
            Looking for a Specific Topic?
          </h2>
          <p className="text-[#94A3B8] mb-8 max-w-xl mx-auto">
            We tailor every talk to your audience and event goals. Let&apos;s design something truly memorable.
          </p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold gradient-gold text-white hover:opacity-90 transition-opacity glow-gold">
            Discuss Your Event <ArrowRight className="w-4 h-4" />
          </Link>
        </AnimatedSection>
      </section>
    </div>
  );
}
