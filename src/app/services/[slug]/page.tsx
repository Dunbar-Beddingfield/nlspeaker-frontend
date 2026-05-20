import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Users, Clock } from "lucide-react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { getServiceBySlug, getServices } from "@/lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const services = await getServices().catch(() => []);
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug).catch(() => null);
  if (!service) return { title: "Service Not Found" };
  return {
    title: service.title,
    description: service.shortDescription,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug).catch(() => null);
  if (!service) notFound();

  return (
    <div className="pt-16">
      {/* Back link */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <Link href="/services"
          className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#F59E0B] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </Link>
      </div>

      {/* Hero */}
      <section className="py-16 relative">
        {service.coverImage && (
          <div className="absolute inset-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={service.coverImage} alt={service.title} className="w-full h-full object-cover opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120]/80 to-[#0B1120]" />
          </div>
        )}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            {service.duration && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.25)] text-[#F59E0B] text-xs font-medium mb-4">
                <Clock className="w-3 h-3" /> {service.duration}
              </div>
            )}
            <h1 className="font-serif-display text-4xl sm:text-5xl font-bold text-[#F8FAFC] mb-6 leading-tight">
              {service.title}
            </h1>
            <p className="text-lg text-[#94A3B8] leading-relaxed max-w-2xl">
              {service.shortDescription}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Body */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main */}
          <div className="lg:col-span-2">
            <AnimatedSection>
              {service.fullDescription && (
                <>
                  <h2 className="font-serif-display text-2xl font-bold text-[#F8FAFC] mb-5">About This Program</h2>
                  <p className="text-[#94A3B8] leading-relaxed whitespace-pre-line mb-10">
                    {service.fullDescription}
                  </p>
                </>
              )}
              {service.outcomes?.length > 0 && (
                <>
                  <h2 className="font-serif-display text-2xl font-bold text-[#F8FAFC] mb-5">What Audiences Take Away</h2>
                  <ul className="space-y-3 mb-10">
                    {service.outcomes.map((o) => (
                      <li key={o} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#F59E0B] mt-0.5 shrink-0" />
                        <span className="text-[#CBD5E1]">{o}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {service.idealAudience && (
                <>
                  <h2 className="font-serif-display text-2xl font-bold text-[#F8FAFC] mb-4">Ideal Audience</h2>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-[#F59E0B] mt-0.5 shrink-0" />
                    <p className="text-[#94A3B8] leading-relaxed">{service.idealAudience}</p>
                  </div>
                </>
              )}
            </AnimatedSection>
          </div>

          {/* Sidebar CTA */}
          <AnimatedSection delay={0.15}>
            <div className="gradient-border bg-[#111827] rounded-2xl p-6 sticky top-24">
              <h3 className="font-semibold text-[#F8FAFC] mb-2">Book This Program</h3>
              <p className="text-sm text-[#64748B] mb-6">
                Bring this talk to your next event. Let&apos;s make it unforgettable.
              </p>
              <Link href={`/contact?service=${service.slug}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold gradient-gold text-white hover:opacity-90 transition-opacity glow-gold-sm">
                Request Booking <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/services"
                className="flex items-center justify-center gap-2 w-full py-2.5 mt-3 rounded-xl text-sm text-[#64748B] hover:text-[#F8FAFC] transition-colors border border-[rgba(245,158,11,0.1)] hover:border-[rgba(245,158,11,0.25)]">
                View All Programs
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
