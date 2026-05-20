import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Star, Quote } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { getTestimonials } from "@/lib/api";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "Hear what event organizers, leaders, and audiences say about Next Level Speaking Services.",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`w-4 h-4 ${n <= rating ? "text-[#F59E0B] fill-[#F59E0B]" : "text-[#334155]"}`} />
      ))}
    </div>
  );
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials().catch(() => []);
  const featured = testimonials.filter((t) => t.isFeatured);
  const rest = testimonials.filter((t) => !t.isFeatured);

  return (
    <div className="pt-16">
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              eyebrow="Social Proof"
              title="What People Are"
              titleHighlight="Saying"
              description="From intimate workshop rooms to packed conference halls — here's what audiences and organizers have to say."
            />
          </AnimatedSection>

          {testimonials.length === 0 ? (
            <div className="mt-16 text-center text-[#64748B]">
              Testimonials coming soon.
            </div>
          ) : (
            <>
              {/* Featured testimonials — large cards */}
              {featured.length > 0 && (
                <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {featured.map((t, i) => (
                    <AnimatedSection key={t._id} delay={i * 0.1}>
                      <div className="gradient-border bg-[#111827] rounded-2xl p-8 h-full flex flex-col">
                        <Quote className="w-8 h-8 text-[#F59E0B] opacity-40 mb-4 shrink-0" />
                        <blockquote className="font-serif-display text-lg text-[#F8FAFC] leading-relaxed italic flex-1 mb-6">
                          &ldquo;{t.text}&rdquo;
                        </blockquote>
                        <div className="flex items-center gap-4">
                          {t.authorPhoto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={t.authorPhoto} alt={t.authorName}
                              className="w-12 h-12 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-[rgba(245,158,11,0.15)] flex items-center justify-center shrink-0">
                              <span className="text-[#F59E0B] font-bold text-lg">{t.authorName[0]}</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-[#F8FAFC] text-sm">{t.authorName}</p>
                            {(t.authorTitle || t.authorOrganization) && (
                              <p className="text-xs text-[#64748B] truncate">
                                {[t.authorTitle, t.authorOrganization].filter(Boolean).join(", ")}
                              </p>
                            )}
                          </div>
                          <div className="ml-auto shrink-0">
                            <StarRating rating={t.rating} />
                          </div>
                        </div>
                      </div>
                    </AnimatedSection>
                  ))}
                </div>
              )}

              {/* Regular grid */}
              {rest.length > 0 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.map((t, i) => (
                    <AnimatedSection key={t._id} delay={i * 0.06}>
                      <div className="bg-[#111827] border border-[rgba(245,158,11,0.08)] rounded-xl p-6 h-full flex flex-col">
                        <StarRating rating={t.rating} />
                        <blockquote className="text-sm text-[#CBD5E1] leading-relaxed italic flex-1 my-4">
                          &ldquo;{t.text}&rdquo;
                        </blockquote>
                        <div className="flex items-center gap-3">
                          {t.authorPhoto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={t.authorPhoto} alt={t.authorName}
                              className="w-9 h-9 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[rgba(245,158,11,0.12)] flex items-center justify-center shrink-0">
                              <span className="text-[#F59E0B] font-semibold text-sm">{t.authorName[0]}</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-[#F8FAFC] text-sm">{t.authorName}</p>
                            {(t.authorTitle || t.authorOrganization) && (
                              <p className="text-xs text-[#64748B] truncate">
                                {[t.authorTitle, t.authorOrganization].filter(Boolean).join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </AnimatedSection>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="py-20 bg-[#111827] text-center">
        <AnimatedSection>
          <h2 className="font-serif-display text-3xl font-bold text-[#F8FAFC] mb-4">
            Ready to Create Your Own Success Story?
          </h2>
          <p className="text-[#94A3B8] mb-8">Join the speakers who&apos;ve transformed their careers and their audiences.</p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold gradient-gold text-white hover:opacity-90 transition-opacity glow-gold">
            Book a Speaker <ArrowRight className="w-4 h-4" />
          </Link>
        </AnimatedSection>
      </section>
    </div>
  );
}
