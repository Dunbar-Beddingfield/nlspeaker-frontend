import { Mic, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { COMPANY, STATS } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[rgba(245,158,11,0.06)] blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center pt-24 pb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.08)] text-[#F59E0B] text-sm font-medium mb-8">
            <Mic className="w-3.5 h-3.5" />
            Professional Speaking Services
          </div>

          {/* Headline */}
          <h1 className="font-serif-display text-5xl sm:text-6xl md:text-7xl font-bold text-[#F8FAFC] leading-tight mb-6">
            Building a Better Future
            <br />
            <span className="gradient-gold-text">for Our Speakers</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#94A3B8] max-w-2xl mx-auto leading-relaxed mb-10">
            {COMPANY.description}
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold gradient-gold text-white hover:opacity-90 transition-opacity glow-gold"
            >
              Book a Speaker
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold border border-[rgba(245,158,11,0.25)] text-[#F8FAFC] hover:bg-[rgba(245,158,11,0.06)] transition-colors"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-[rgba(245,158,11,0.12)] bg-[#111827]">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold gradient-gold-text mb-1">{stat.value}</p>
              <p className="text-sm text-[#64748B]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials teaser */}
      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="flex justify-center mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]" />
          ))}
        </div>
        <blockquote className="font-serif-display text-2xl sm:text-3xl text-[#F8FAFC] italic leading-relaxed mb-6">
          &ldquo;An electrifying speaker who transformed how our entire team thinks about
          leadership and growth.&rdquo;
        </blockquote>
        <p className="text-sm text-[#64748B]">— Event organizer, Fortune 500 company</p>
        <Link
          href="/testimonials"
          className="inline-flex items-center gap-1.5 mt-8 text-sm font-medium text-[#F59E0B] hover:text-[#D97706] transition-colors"
        >
          Read all testimonials <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
