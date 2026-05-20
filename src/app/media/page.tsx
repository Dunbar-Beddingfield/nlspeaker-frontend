import type { Metadata } from "next";
import { Download, ExternalLink, Image as ImageIcon, FileText, Play } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { getMedia, getSiteSettings } from "@/lib/api";
import type { MediaItem, MediaType } from "@/types";

export const metadata: Metadata = {
  title: "Media Kit",
  description: "Press resources, photos, logos, and video clips for event organizers and media.",
};

const TYPE_META: Record<MediaType, { label: string; Icon: React.ElementType }> = {
  photo: { label: "Photos", Icon: ImageIcon },
  logo: { label: "Logos", Icon: ImageIcon },
  "press-logo": { label: "Press Logos", Icon: ImageIcon },
  "video-clip": { label: "Video Clips", Icon: Play },
  document: { label: "Documents", Icon: FileText },
};

const SECTION_ORDER: MediaType[] = ["photo", "video-clip", "logo", "press-logo", "document"];

export default async function MediaPage() {
  const [items, settings] = await Promise.all([
    getMedia().catch(() => []),
    getSiteSettings().catch(() => ({} as Record<string, string>)),
  ]);

  type GroupedMedia = { [key: string]: MediaItem[] };
  const grouped: GroupedMedia = {};
  for (const item of items) {
    const key = item.type as string;
    if (!grouped[key]) grouped[key] = [];
    (grouped[key] as MediaItem[]).push(item);
  }

  return (
    <div className="pt-16">
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              eyebrow="Press & Media"
              title="Media"
              titleHighlight="Kit"
              description="Everything you need to promote our speaker at your event. Download photos, logos, bios, and video clips below."
            />
          </AnimatedSection>

          {items.length === 0 ? (
            <div className="mt-16 text-center text-[#64748B]">Media kit coming soon.</div>
          ) : (
            <div className="mt-16 space-y-16">
              {SECTION_ORDER.map((type) => {
                const sectionItems = grouped[type];
                if (!sectionItems?.length) return null;
                const { label, Icon } = TYPE_META[type];

                return (
                  <div key={type}>
                    <div className="flex items-center gap-3 mb-6">
                      <Icon className="w-5 h-5 text-[#F59E0B]" />
                      <h2 className="text-sm font-semibold uppercase tracking-widest text-[#F59E0B]">{label}</h2>
                    </div>
                    <div className={type === "document" ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"}>
                      {sectionItems.map((item, i) => (
                        <AnimatedSection key={item._id} delay={i * 0.06}>
                          {(type === "photo" || type === "logo" || type === "press-logo") ? (
                            <a href={item.url} target="_blank" rel="noreferrer"
                              className="group block rounded-xl overflow-hidden bg-[#111827] border border-[rgba(245,158,11,0.08)] hover:border-[rgba(245,158,11,0.3)] transition-all">
                              <div className="aspect-video overflow-hidden bg-[#1A2540]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.thumbnailUrl || item.url} alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              </div>
                              <div className="p-3 flex items-center justify-between">
                                <span className="text-xs text-[#94A3B8] truncate">{item.title}</span>
                                <Download className="w-3.5 h-3.5 text-[#64748B] shrink-0 ml-2" />
                              </div>
                            </a>
                          ) : type === "video-clip" ? (
                            <a href={item.url} target="_blank" rel="noreferrer"
                              className="group block rounded-xl overflow-hidden bg-[#111827] border border-[rgba(245,158,11,0.08)] hover:border-[rgba(245,158,11,0.3)] transition-all">
                              <div className="aspect-video relative bg-[#1A2540] flex items-center justify-center">
                                {item.thumbnailUrl && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover absolute inset-0" />
                                )}
                                <div className="relative z-10 w-12 h-12 rounded-full bg-[rgba(245,158,11,0.9)] flex items-center justify-center">
                                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                </div>
                              </div>
                              <div className="p-3 flex items-center justify-between">
                                <span className="text-xs text-[#94A3B8] truncate">{item.title}</span>
                                <ExternalLink className="w-3.5 h-3.5 text-[#64748B] shrink-0 ml-2" />
                              </div>
                            </a>
                          ) : (
                            <a href={item.url} target="_blank" rel="noreferrer"
                              className="flex items-center gap-4 p-4 rounded-xl bg-[#111827] border border-[rgba(245,158,11,0.08)] hover:border-[rgba(245,158,11,0.3)] transition-all group">
                              <div className="w-10 h-10 rounded-lg bg-[rgba(245,158,11,0.1)] flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-[#F59E0B]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#F8FAFC] group-hover:text-[#F59E0B] transition-colors truncate">{item.title}</p>
                                {item.description && <p className="text-xs text-[#64748B] truncate">{item.description}</p>}
                              </div>
                              <Download className="w-4 h-4 text-[#64748B] shrink-0" />
                            </a>
                          )}
                        </AnimatedSection>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Marketing — Brian Carter Group */}
      <section className="py-24 bg-[#111827]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#F59E0B] text-center mb-14">
              Marketing
            </p>
            <div className="flex flex-col md:flex-row gap-12 items-center">
              {/* Text */}
              <div className="flex-1">
                <h2 className="font-serif-display text-3xl font-bold text-[#F8FAFC] mb-6">
                  Brian Carter Group
                </h2>
                <div className="space-y-4 text-[#94A3B8] leading-relaxed">
                  <p>
                    Next Level Speaking Services, partnering with Brian Carter Group (BCG), now offers
                    digital, traditional and advertising marketing to boost speakers&apos; online results
                    and offline profits.
                  </p>
                  <p>
                    BCG marketing audits, consulting, ad management, and other speaker marketing services
                    are based on cutting-edge, real-world best practices. The strategies and tactics we
                    recommend aren&apos;t just neat, shiny ideas that sound good — they&apos;ve been
                    tested and proven for keynote speakers like you.
                  </p>
                  <p>
                    Digital marketing thought leader Brian Carter leads BCG. As a key player in digital
                    marketing and social media for two decades, Brian Carter combines his keynote speaking
                    industry knowledge, success marketing himself and other keynote speakers, his network
                    of influencers and agency leaders and his experience getting results for hundreds of
                    clients to lead a team that can solve your unique problems and take your results to
                    the next level.
                  </p>
                </div>
              </div>

              {/* Photo */}
              <div className="w-full md:w-64 shrink-0">
                <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-[#0B1120] border border-[rgba(245,158,11,0.1)]">
                  {settings["brianCarterPhoto"] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={settings["brianCarterPhoto"]}
                      alt="Brian Carter"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl font-bold text-[rgba(245,158,11,0.2)]">BC</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
