import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { getServices } from "@/lib/api";

export const metadata: Metadata = {
  title: "Speaking Services",
  description:
    "Explore our full range of professional speaking programs — keynotes, workshops, coaching, and more.",
};

export default async function ServicesPage() {
  const services = await getServices().catch(() => []);

  return (
    <div className="pt-16">
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[rgba(245,158,11,0.04)] rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              eyebrow="What We Offer"
              title="Our Speaking"
              titleHighlight="Programs"
              description="From high-energy keynotes to transformational workshops, every program is crafted to move your audience and leave a lasting impression."
            />
          </AnimatedSection>

          {services.length === 0 ? (
            <div className="mt-16 text-center text-[#64748B]">
              Programs coming soon. <Link href="/contact" className="text-[#F59E0B] hover:text-[#D97706] transition-colors">Reach out to book</Link>.
            </div>
          ) : (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, i) => (
                <AnimatedSection key={service._id} delay={i * 0.08}>
                  <div className="group gradient-border bg-[#111827] rounded-2xl overflow-hidden flex flex-col h-full hover:bg-[#1A2540] transition-colors">
                    {service.coverImage && (
                      <div className="h-48 overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={service.coverImage}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    {!service.coverImage && (
                      <div className="h-20 bg-gradient-to-r from-[rgba(245,158,11,0.12)] to-[rgba(217,119,6,0.06)]" />
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      {service.duration && (
                        <span className="text-xs text-[#F59E0B] font-medium mb-2">{service.duration}</span>
                      )}
                      <h3 className="font-serif-display text-xl font-bold text-[#F8FAFC] mb-3 group-hover:text-[#F59E0B] transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-[#94A3B8] leading-relaxed flex-1 mb-4">
                        {service.shortDescription}
                      </p>
                      {service.outcomes?.length > 0 && (
                        <ul className="space-y-1.5 mb-5">
                          {service.outcomes.slice(0, 3).map((o) => (
                            <li key={o} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#F59E0B] mt-0.5 shrink-0" />
                              <span className="text-xs text-[#64748B]">{o}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <Link
                        href={`/services/${service.slug}`}
                        className="flex items-center gap-1.5 text-sm font-medium text-[#F59E0B] hover:text-[#D97706] transition-colors mt-auto"
                      >
                        Learn more <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
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
            Not Sure Which Program Fits?
          </h2>
          <p className="text-[#94A3B8] mb-8">Let&apos;s talk and find the perfect fit for your event.</p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold gradient-gold text-white hover:opacity-90 transition-opacity glow-gold">
            Get in Touch <ArrowRight className="w-4 h-4" />
          </Link>
        </AnimatedSection>
      </section>
    </div>
  );
}
