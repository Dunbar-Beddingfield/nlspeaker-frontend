import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts().catch(() => []);
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug).catch(() => null);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug).catch(() => null);
  if (!post) notFound();

  return (
    <div className="pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <Link href="/blog"
          className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#F59E0B] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>

      {/* Hero image */}
      {post.coverImage && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="h-72 sm:h-96 rounded-2xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatedSection>
          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-[rgba(245,158,11,0.1)] text-[#F59E0B] border border-[rgba(245,158,11,0.2)]">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#F8FAFC] leading-tight mb-6">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-[#94A3B8] leading-relaxed mb-8 italic border-l-2 border-[#F59E0B] pl-4">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-[#64748B] pb-8 border-b border-[rgba(245,158,11,0.1)] mb-10">
            {post.author && <span className="font-medium text-[#94A3B8]">{post.author}</span>}
            {post.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {formatDate(post.publishedAt)}
              </span>
            )}
            {post.readingTimeMinutes > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {post.readingTimeMinutes} min read
              </span>
            )}
          </div>

          {/* Body — stored as HTML */}
          {post.body && (
            <div
              className="prose prose-invert prose-lg max-w-none
                prose-headings:font-serif-display prose-headings:text-[#F8FAFC]
                prose-p:text-[#CBD5E1] prose-p:leading-relaxed
                prose-a:text-[#F59E0B] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-[#F8FAFC]
                prose-li:text-[#CBD5E1]
                prose-blockquote:border-l-[#F59E0B] prose-blockquote:text-[#94A3B8] prose-blockquote:italic
                prose-code:text-[#F59E0B] prose-code:bg-[rgba(245,158,11,0.1)] prose-code:px-1 prose-code:rounded"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
          )}
        </AnimatedSection>
      </article>
    </div>
  );
}
