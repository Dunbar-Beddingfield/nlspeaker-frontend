import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { getBlogPosts } from "@/lib/api";
import { formatDateShort } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Thought leadership, speaking tips, and insights to help you grow as a communicator.",
};

export default async function BlogPage() {
  const posts = await getBlogPosts().catch(() => []);
  const featured = posts.filter((p) => p.isFeatured);
  const rest = posts.filter((p) => !p.isFeatured);

  return (
    <div className="pt-16">
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              eyebrow="Insights & Ideas"
              title="The Speaking"
              titleHighlight="Blog"
              description="Tips, stories, and frameworks to help you speak with more clarity, confidence, and impact."
            />
          </AnimatedSection>

          {posts.length === 0 ? (
            <div className="mt-16 text-center text-[#64748B]">Articles coming soon. Check back soon!</div>
          ) : (
            <>
              {/* Featured post */}
              {featured.length > 0 && (
                <AnimatedSection className="mt-16">
                  <Link href={`/blog/${featured[0].slug}`} className="group block">
                    <div className="gradient-border bg-[#111827] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                      {featured[0].coverImage && (
                        <div className="h-64 lg:h-auto overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={featured[0].coverImage} alt={featured[0].title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <div className="p-8 lg:p-10 flex flex-col justify-center">
                        <span className="text-xs font-semibold uppercase tracking-widest text-[#F59E0B] mb-3">Featured</span>
                        <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#F8FAFC] mb-4 group-hover:text-[#F59E0B] transition-colors leading-snug">
                          {featured[0].title}
                        </h2>
                        {featured[0].excerpt && (
                          <p className="text-[#94A3B8] text-sm leading-relaxed mb-6 line-clamp-3">{featured[0].excerpt}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-[#64748B] mb-6">
                          {featured[0].publishedAt && <span>{formatDateShort(featured[0].publishedAt)}</span>}
                          {featured[0].readingTimeMinutes > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {featured[0].readingTimeMinutes} min read
                            </span>
                          )}
                        </div>
                        <span className="flex items-center gap-1.5 text-sm font-medium text-[#F59E0B]">
                          Read article <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              )}

              {/* Post grid */}
              {rest.length > 0 && (
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((post, i) => (
                    <AnimatedSection key={post._id} delay={i * 0.07}>
                      <Link href={`/blog/${post.slug}`} className="group block h-full">
                        <div className="bg-[#111827] border border-[rgba(245,158,11,0.08)] hover:border-[rgba(245,158,11,0.25)] rounded-2xl overflow-hidden flex flex-col h-full transition-all hover:bg-[#1A2540]">
                          {post.coverImage && (
                            <div className="h-44 overflow-hidden shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={post.coverImage} alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                          )}
                          <div className="p-6 flex flex-col flex-1">
                            {post.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {post.tags.slice(0, 2).map((tag) => (
                                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.08)] text-[#F59E0B]">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            <h3 className="font-serif-display font-bold text-[#F8FAFC] mb-2 group-hover:text-[#F59E0B] transition-colors leading-snug flex-1">
                              {post.title}
                            </h3>
                            {post.excerpt && (
                              <p className="text-sm text-[#94A3B8] leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
                            )}
                            <div className="flex items-center justify-between text-xs text-[#64748B] mt-auto">
                              <span>{post.publishedAt ? formatDateShort(post.publishedAt) : ""}</span>
                              {post.readingTimeMinutes > 0 && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {post.readingTimeMinutes} min
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </AnimatedSection>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
